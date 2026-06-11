package com.nursing.service;

import com.nursing.entity.*;
import com.nursing.repository.CarePlanRepository;
import com.nursing.repository.ElderRepository;
import com.nursing.repository.RiskEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RiskEventService {

    private final RiskEventRepository riskEventRepository;
    private final ElderRepository elderRepository;
    private final CarePlanRepository carePlanRepository;

    public RiskEventService(RiskEventRepository riskEventRepository, ElderRepository elderRepository,
                            CarePlanRepository carePlanRepository) {
        this.riskEventRepository = riskEventRepository;
        this.elderRepository = elderRepository;
        this.carePlanRepository = carePlanRepository;
    }

    public List<RiskEvent> findAll() {
        return riskEventRepository.findAll();
    }

    public RiskEvent findById(Long id) {
        return riskEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("风险事件未找到: " + id));
    }

    @Transactional
    public RiskEvent create(RiskEvent event) {
        Elder elder = elderRepository.findById(event.getElderId())
                .orElseThrow(() -> new RuntimeException("老人信息未找到"));
        event.setElderName(elder.getName());
        if (event.getPlanAdjustment() == null) event.setPlanAdjustment(false);
        if (event.getBillingImpact() == null) event.setBillingImpact(false);
        if (event.getFamilyNotified() == null) event.setFamilyNotified(false);
        if (event.getDoctorNotified() == null) event.setDoctorNotified(false);
        RiskEvent saved = riskEventRepository.save(event);

        if (RiskEventType.FALL.equals(event.getType()) && Boolean.TRUE.equals(event.getPlanAdjustment())) {
            suspendActivitiesForElder(event.getElderId(), saved.getId());
        }

        return saved;
    }

    @Transactional
    public HandlingRecord addHandlingRecord(Long riskEventId, HandlingRecord record) {
        RiskEvent event = findById(riskEventId);
        record.setRiskEventId(riskEventId);
        event.getHandlingRecords().add(record);
        if (event.getStatus() == RiskEventStatus.REPORTED) {
            event.setStatus(RiskEventStatus.PROCESSING);
        }
        riskEventRepository.save(event);
        return record;
    }

    @Transactional
    public RiskEvent updateStatus(Long id, RiskEventStatus status) {
        RiskEvent event = findById(id);
        event.setStatus(status);
        if (status == RiskEventStatus.RESOLVED) {
            event.setPlanAdjustment(false);
            event.setBillingImpact(false);
        }
        return riskEventRepository.save(event);
    }

    @Transactional
    public void triggerPlanAdjustment(Long riskEventId) {
        RiskEvent event = findById(riskEventId);
        event.setPlanAdjustment(true);
        riskEventRepository.save(event);
    }

    @Transactional
    public void triggerBillingAdjustment(Long riskEventId) {
        RiskEvent event = findById(riskEventId);
        event.setBillingImpact(true);
        riskEventRepository.save(event);
    }

    @Transactional
    public RiskEvent notifyFamily(Long riskEventId) {
        RiskEvent event = findById(riskEventId);
        event.setFamilyNotified(true);
        event.setFamilyNotifiedTime(LocalDateTime.now());

        HandlingRecord record = new HandlingRecord();
        record.setRiskEventId(riskEventId);
        record.setHandler("系统");
        record.setHandlerRole("SYSTEM");
        record.setAction("已通知家属");
        record.setActionTime(LocalDateTime.now());
        record.setResult("家属已收到跌倒事件通知");
        event.getHandlingRecords().add(record);

        if (event.getStatus() == RiskEventStatus.REPORTED) {
            event.setStatus(RiskEventStatus.PROCESSING);
        }
        return riskEventRepository.save(event);
    }

    @Transactional
    public RiskEvent notifyDoctor(Long riskEventId) {
        RiskEvent event = findById(riskEventId);
        event.setDoctorNotified(true);
        event.setDoctorNotifiedTime(LocalDateTime.now());

        HandlingRecord record = new HandlingRecord();
        record.setRiskEventId(riskEventId);
        record.setHandler("系统");
        record.setHandlerRole("SYSTEM");
        record.setAction("已通知评估医生");
        record.setActionTime(LocalDateTime.now());
        record.setResult("评估医生已收到跌倒事件通知，等待评估");
        event.getHandlingRecords().add(record);

        if (event.getStatus() == RiskEventStatus.REPORTED) {
            event.setStatus(RiskEventStatus.PROCESSING);
        }
        return riskEventRepository.save(event);
    }

    @Transactional
    public RiskEvent updateFallDetails(Long riskEventId, String location, CompanionStatus companionStatus,
                                        String injuryPhotos, HospitalResult hospitalResult, String hospitalNotes) {
        RiskEvent event = findById(riskEventId);
        event.setLocation(location);
        event.setCompanionStatus(companionStatus);
        event.setInjuryPhotos(injuryPhotos);
        event.setHospitalResult(hospitalResult);
        event.setHospitalNotes(hospitalNotes);
        return riskEventRepository.save(event);
    }

    @Transactional
    public RiskEvent submitReview(Long riskEventId, String reviewConclusion, String patrolFrequencyAdjustment,
                                  Boolean planAdjustment, Boolean billingImpact) {
        RiskEvent event = findById(riskEventId);
        event.setReviewConclusion(reviewConclusion);
        event.setPatrolFrequencyAdjustment(patrolFrequencyAdjustment);
        if (planAdjustment != null) event.setPlanAdjustment(planAdjustment);
        if (billingImpact != null) event.setBillingImpact(billingImpact);

        HandlingRecord record = new HandlingRecord();
        record.setRiskEventId(riskEventId);
        record.setHandler("系统");
        record.setHandlerRole("SYSTEM");
        record.setAction("提交复盘结论");
        record.setActionTime(LocalDateTime.now());
        String result = "复盘结论: " + reviewConclusion;
        if (patrolFrequencyAdjustment != null) {
            result += "; 巡视频次调整: " + patrolFrequencyAdjustment;
        }
        record.setResult(result);
        event.getHandlingRecords().add(record);

        return riskEventRepository.save(event);
    }

    @Transactional
    public void suspendActivitiesForElder(Long elderId, Long riskEventId) {
        CarePlan activePlan = carePlanRepository.findByElderIdAndStatus(elderId, CarePlanStatus.ACTIVE).orElse(null);
        if (activePlan == null) return;

        for (CarePlanItem item : activePlan.getItems()) {
            if (CareItemType.REHABILITATION.equals(item.getType()) && Boolean.TRUE.equals(item.getIsActive())) {
                item.setIsActive(false);
                item.setExpiryDate(java.time.LocalDate.now());
            }
        }

        CarePlanChange change = new CarePlanChange();
        change.setCarePlanId(activePlan.getId());
        change.setChangeDate(java.time.LocalDate.now());
        change.setChangeReason("跌倒事件(RISK_EVENT_ID=" + riskEventId + ")导致活动暂停");
        change.setReasonType(ReasonType.RISK_EVENT);
        activePlan.getChanges().add(change);

        carePlanRepository.save(activePlan);
    }
}
