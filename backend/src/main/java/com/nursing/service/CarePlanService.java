package com.nursing.service;

import com.nursing.entity.*;
import com.nursing.repository.CarePlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CarePlanService {

    private final CarePlanRepository carePlanRepository;

    public CarePlanService(CarePlanRepository carePlanRepository) {
        this.carePlanRepository = carePlanRepository;
    }

    public CarePlan findByElderId(Long elderId) {
        return carePlanRepository.findByElderIdAndStatus(elderId, CarePlanStatus.ACTIVE)
                .orElse(null);
    }

    @Transactional
    public CarePlan create(CarePlan carePlan) {
        return carePlanRepository.save(carePlan);
    }

    @Transactional
    public CarePlanItem addItem(Long carePlanId, CarePlanItem item) {
        CarePlan plan = carePlanRepository.findById(carePlanId)
                .orElseThrow(() -> new RuntimeException("护理方案未找到"));
        item.setCarePlanId(carePlanId);
        plan.getItems().add(item);
        carePlanRepository.save(plan);
        return item;
    }

    @Transactional
    public CarePlanItem updateItem(Long itemId, CarePlanItem updated) {
        CarePlan plan = carePlanRepository.findAll().stream()
                .filter(p -> p.getItems().stream().anyMatch(i -> i.getId().equals(itemId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("护理项目未找到"));

        CarePlanItem item = plan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("护理项目未找到"));

        item.setType(updated.getType());
        item.setFrequency(updated.getFrequency());
        item.setDescription(updated.getDescription());
        item.setIsActive(updated.getIsActive());

        carePlanRepository.save(plan);
        return item;
    }

    @Transactional
    public CarePlanChange addChange(Long carePlanId, CarePlanChange change) {
        CarePlan plan = carePlanRepository.findById(carePlanId)
                .orElseThrow(() -> new RuntimeException("护理方案未找到"));
        change.setCarePlanId(carePlanId);
        plan.getChanges().add(change);
        carePlanRepository.save(plan);
        return change;
    }

    @Transactional
    public CarePlan suspendPlan(Long carePlanId) {
        CarePlan plan = carePlanRepository.findById(carePlanId)
                .orElseThrow(() -> new RuntimeException("护理方案未找到"));
        plan.setStatus(CarePlanStatus.SUSPENDED);
        plan.setExpiryDate(LocalDate.now());
        return carePlanRepository.save(plan);
    }

    @Transactional
    public CarePlan activatePlan(Long carePlanId) {
        CarePlan plan = carePlanRepository.findById(carePlanId)
                .orElseThrow(() -> new RuntimeException("护理方案未找到"));
        plan.setStatus(CarePlanStatus.ACTIVE);
        plan.setEffectiveDate(LocalDate.now());
        plan.setExpiryDate(null);
        return carePlanRepository.save(plan);
    }
}
