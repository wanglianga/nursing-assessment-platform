package com.nursing.repository;

import com.nursing.entity.CarePlan;
import com.nursing.entity.CarePlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CarePlanRepository extends JpaRepository<CarePlan, Long> {

    List<CarePlan> findByElderId(Long elderId);

    Optional<CarePlan> findByElderIdAndStatus(Long elderId, CarePlanStatus status);

    @Query("SELECT cp FROM CarePlan cp WHERE cp.elderId = :elderId AND cp.effectiveDate <= :endDate AND (cp.expiryDate IS NULL OR cp.expiryDate >= :startDate) ORDER BY cp.effectiveDate ASC")
    List<CarePlan> findByElderIdEffectiveInRange(@Param("elderId") Long elderId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<CarePlan> findByElderIdOrderByEffectiveDateDesc(Long elderId);
}
