package com.nursing.service;

import com.nursing.entity.*;
import com.nursing.repository.ElderRepository;
import com.nursing.repository.RiskEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RiskEventService {

    private final RiskEventRepository riskEventRepository;
    private final ElderRepository elderRepository;

    public RiskEventService(RiskEventRepository riskEventRepository, ElderRepository elderRepository) {
        this.riskEventRepository = riskEventRepository;
        this.elderRepository = elderRepository;
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
        return riskEventRepository.save(event);
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
}
