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

        if (assessment.getType() == AssessmentType.REASSESSMENT) {
            triggerReassessmentCarePlanUpdate(assessment.getElderId(), level, assessment.getReassessmentReason());
        } else {
            triggerCarePlanUpdate(assessment.getElderId(), level);
        }

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

    @Transactional
    public void triggerReassessmentCarePlanUpdate(Long elderId, NursingLevel newLevel, ReassessmentReason reason) {
        LocalDate reassessmentDate = LocalDate.now();

        CarePlan activePlan = carePlanRepository.findByElderIdAndStatus(elderId, CarePlanStatus.ACTIVE)
                .orElse(null);

        if (activePlan != null) {
            NursingLevel oldLevel = activePlan.getNursingLevel();
            String beforeSnapshot = buildPlanSnapshot(activePlan);

            activePlan.setStatus(CarePlanStatus.EXPIRED);
            activePlan.setExpiryDate(reassessmentDate);
            for (CarePlanItem item : activePlan.getItems()) {
                if (item.getIsActive()) {
                    item.setExpiryDate(reassessmentDate);
                }
            }
            carePlanRepository.save(activePlan);

            LocalDate newEffectiveDate = reassessmentDate.plusDays(1);
            CarePlan newPlan = new CarePlan();
            newPlan.setElderId(elderId);
            newPlan.setNursingLevel(newLevel);
            newPlan.setEffectiveDate(newEffectiveDate);
            newPlan.setStatus(CarePlanStatus.ACTIVE);

            for (CarePlanItem oldItem : activePlan.getItems()) {
                CarePlanItem newItem = new CarePlanItem();
                newItem.setCarePlanId(0L);
                newItem.setType(oldItem.getType());
                newItem.setFrequency(oldItem.getFrequency());
                newItem.setDescription(oldItem.getDescription());
                newItem.setIsActive(true);
                newItem.setEffectiveDate(newEffectiveDate);
                newPlan.getItems().add(newItem);
            }

            String reasonDesc = getReassessmentReasonDescription(reason);
            CarePlanChange change = new CarePlanChange();
            change.setCarePlanId(activePlan.getId());
            change.setChangeDate(reassessmentDate);
            change.setChangeReason("护理等级复评: " + reasonDesc);
            change.setReasonType(ReasonType.REASSESSMENT);
            change.setBeforeSnapshot(beforeSnapshot);
            change.setAfterSnapshot(buildPlanSnapshot(newLevel, newEffectiveDate));

            newPlan.getChanges().add(change);
            carePlanRepository.save(newPlan);
        } else {
            CarePlan newPlan = new CarePlan();
            newPlan.setElderId(elderId);
            newPlan.setNursingLevel(newLevel);
            newPlan.setEffectiveDate(reassessmentDate.plusDays(1));
            newPlan.setStatus(CarePlanStatus.ACTIVE);
            carePlanRepository.save(newPlan);
        }
    }

    private String buildPlanSnapshot(CarePlan plan) {
        StringBuilder sb = new StringBuilder();
        sb.append("等级: ").append(plan.getNursingLevel().name());
        sb.append(", 生效: ").append(plan.getEffectiveDate());
        sb.append(", 项目: [");
        for (int i = 0; i < plan.getItems().size(); i++) {
            CarePlanItem item = plan.getItems().get(i);
            if (i > 0) sb.append("; ");
            sb.append(item.getType().name()).append("-").append(item.getFrequency());
        }
        sb.append("]");
        return sb.toString();
    }

    private String buildPlanSnapshot(NursingLevel level, LocalDate effectiveDate) {
        return "等级: " + level.name() + ", 生效: " + effectiveDate;
    }

    private String getReassessmentReasonDescription(ReassessmentReason reason) {
        if (reason == null) return "其他原因";
        return switch (reason) {
            case HOSPITALIZATION_RETURN -> "住院返回";
            case COGNITIVE_DECLINE -> "认知下降";
            case REHABILITATION_IMPROVEMENT -> "康复改善";
            case PERIODIC_REVIEW -> "定期复评";
            case OTHER -> "其他原因";
        };
    }
}
