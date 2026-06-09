package com.nursing.repository;

import com.nursing.entity.CareRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CareRecordRepository extends JpaRepository<CareRecord, Long> {

    List<CareRecord> findByElderId(Long elderId);

    List<CareRecord> findByCaregiverId(Long caregiverId);

    List<CareRecord> findByElderIdAndRecordTimeBetween(Long elderId, LocalDateTime start, LocalDateTime end);

    long countByRecordTimeBetween(LocalDateTime start, LocalDateTime end);
}
