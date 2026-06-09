package com.nursing.repository;

import com.nursing.entity.RiskEvent;
import com.nursing.entity.RiskEventStatus;
import com.nursing.entity.RiskEventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiskEventRepository extends JpaRepository<RiskEvent, Long> {

    List<RiskEvent> findByElderId(Long elderId);

    List<RiskEvent> findByStatus(RiskEventStatus status);

    List<RiskEvent> findByType(RiskEventType type);
}
