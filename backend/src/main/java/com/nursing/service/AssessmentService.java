package com.nursing.service;

import com.nursing.entity.*;
import com.nursing.repository.AssessmentRepository;
import com.nursing.repository.CarePlanRepository;
import com.nursing.repository.ElderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final ElderRepository elderRepository;
    private final CarePlanRepository carePlanRepository;

    public AssessmentService(AssessmentRepository assessmentRepository, ElderRepository elderRepository, CarePlanRepository carePlanRepository) {
        this.assessmentRepository = assessmentRepository;
        this.elderRepository = elderRepository;
        this.carePlanRepository = carePlanRepository;
    }

    public List<Assessment> findByElderId(Long elderId) {
        return assessmentRepository.findByElderIdOrderByAssessmentDateDesc(elderId);
    }

    @Transactional
    public Assessment create(Assessment assessment) {
        int totalScore = assessment.getSelfCareScore() + assessment.getCognitiveScore()
                + assessment.getChronicDiseaseScore() + assessment.getFallRiskScore()
                + assessment.getMedicationScore();
        assessment.setTotalScore(totalScore);

        NursingLevel level = calculateNursingLevel(totalScore);
        assessment.setNursingLevel(level);

        if (assessment.getAssessmentDate() == null) {
            assessment.setAssessmentDate(LocalDate.now());
        }

        Assessment saved = assessmentRepository.save(assessment);

        Elder elder = elderRepository.findById(assessment.getElderId())
                .orElseThrow(() -> new RuntimeException("老人信息未找到"));
        elder.setNursingLevel(level);
        elderRepository.save(elder);

        triggerCarePlanUpdate(assessment.getElderId(), level);

        return saved;
    }

    public NursingLevel calculateNursingLevel(int totalScore) {
        if (totalScore <= 20) return NursingLevel.SELF_CARE;
        if (totalScore <= 40) return NursingLevel.LEVEL_3;
        if (totalScore <= 60) return NursingLevel.LEVEL_2;
        if (totalScore <= 80) return NursingLevel.LEVEL_1;
        return NursingLevel.SPECIAL;
    }

    @Transactional
    public void triggerCarePlanUpdate(Long elderId, NursingLevel nursingLevel) {
        CarePlan activePlan = carePlanRepository.findByElderIdAndStatus(elderId, CarePlanStatus.ACTIVE)
                .orElse(null);

        if (activePlan != null) {
            String beforeSnapshot = activePlan.getNursingLevel().name();
            activePlan.setStatus(CarePlanStatus.EXPIRED);
            activePlan.setExpiryDate(LocalDate.now());
            carePlanRepository.save(activePlan);

            CarePlan newPlan = new CarePlan();
            newPlan.setElderId(elderId);
            newPlan.setNursingLevel(nursingLevel);
            newPlan.setEffectiveDate(LocalDate.now());
            newPlan.setStatus(CarePlanStatus.ACTIVE);

            CarePlanChange change = new CarePlanChange();
            change.setCarePlanId(activePlan.getId());
            change.setChangeDate(LocalDate.now());
            change.setChangeReason("评估等级变更");
            change.setReasonType(ReasonType.ASSESSMENT);
            change.setBeforeSnapshot(beforeSnapshot);
            change.setAfterSnapshot(nursingLevel.name());

            newPlan.getChanges().add(change);
            carePlanRepository.save(newPlan);
        } else {
            CarePlan newPlan = new CarePlan();
            newPlan.setElderId(elderId);
            newPlan.setNursingLevel(nursingLevel);
            newPlan.setEffectiveDate(LocalDate.now());
            newPlan.setStatus(CarePlanStatus.ACTIVE);
            carePlanRepository.save(newPlan);
        }
    }
}
