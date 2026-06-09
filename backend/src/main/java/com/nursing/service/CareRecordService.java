package com.nursing.service;

import com.nursing.entity.CareRecord;
import com.nursing.repository.CareRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
public class CareRecordService {

    private final CareRecordRepository careRecordRepository;

    public CareRecordService(CareRecordRepository careRecordRepository) {
        this.careRecordRepository = careRecordRepository;
    }

    public List<CareRecord> findByElderId(Long elderId) {
        return careRecordRepository.findByElderId(elderId);
    }

    public List<CareRecord> findByDateRange(Long elderId, LocalDateTime start, LocalDateTime end) {
        return careRecordRepository.findByElderIdAndRecordTimeBetween(elderId, start, end);
    }

    public List<CareRecord> findByCaregiverId(Long caregiverId) {
        return careRecordRepository.findByCaregiverId(caregiverId);
    }

    public CareRecord create(CareRecord record) {
        return careRecordRepository.save(record);
    }

    public Map<String, Long> countTodayCompleted() {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
        long completed = careRecordRepository.countByRecordTimeBetween(startOfDay, endOfDay);
        return Map.of("completed", completed, "total", completed);
    }
}
