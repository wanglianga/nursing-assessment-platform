package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.HandlingRecord;
import com.nursing.entity.RiskEvent;
import com.nursing.entity.RiskEventStatus;
import com.nursing.service.RiskEventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/risk-events")
public class RiskEventController {

    private final RiskEventService riskEventService;

    public RiskEventController(RiskEventService riskEventService) {
        this.riskEventService = riskEventService;
    }

    @GetMapping
    public ApiResponse<List<RiskEvent>> findAll() {
        return ApiResponse.success(riskEventService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<RiskEvent> findById(@PathVariable Long id) {
        return ApiResponse.success(riskEventService.findById(id));
    }

    @PostMapping
    public ApiResponse<RiskEvent> create(@RequestBody RiskEvent event) {
        return ApiResponse.success(riskEventService.create(event));
    }

    @PostMapping("/{id}/handling")
    public ApiResponse<HandlingRecord> addHandlingRecord(@PathVariable Long id, @RequestBody HandlingRecord record) {
        return ApiResponse.success(riskEventService.addHandlingRecord(id, record));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<RiskEvent> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        RiskEventStatus status = RiskEventStatus.valueOf(statusStr);
        return ApiResponse.success(riskEventService.updateStatus(id, status));
    }
}
