package com.nursing.repository;

import com.nursing.entity.CarePlan;
import com.nursing.entity.CarePlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarePlanRepository extends JpaRepository<CarePlan, Long> {

    List<CarePlan> findByElderId(Long elderId);

    Optional<CarePlan> findByElderIdAndStatus(Long elderId, CarePlanStatus status);
}
