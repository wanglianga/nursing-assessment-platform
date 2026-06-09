package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.CareRecord;
import com.nursing.service.CareRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/care-records")
public class CareRecordController {

    private final CareRecordService careRecordService;

    public CareRecordController(CareRecordService careRecordService) {
        this.careRecordService = careRecordService;
    }

    @GetMapping("/elder/{elderId}")
    public ApiResponse<List<CareRecord>> findByElderId(@PathVariable Long elderId) {
        return ApiResponse.success(careRecordService.findByElderId(elderId));
    }

    @GetMapping("/caregiver/{caregiverId}")
    public ApiResponse<List<CareRecord>> findByCaregiverId(@PathVariable Long caregiverId) {
        return ApiResponse.success(careRecordService.findByCaregiverId(caregiverId));
    }

    @PostMapping
    public ApiResponse<CareRecord> create(@RequestBody CareRecord record) {
        return ApiResponse.success(careRecordService.create(record));
    }

    @GetMapping("/stats/today")
    public ApiResponse<Map<String, Long>> getTodayStats() {
        return ApiResponse.success(careRecordService.countTodayCompleted());
    }
}
