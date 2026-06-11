package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.*;
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

    @PostMapping("/{id}/notify-family")
    public ApiResponse<RiskEvent> notifyFamily(@PathVariable Long id) {
        return ApiResponse.success(riskEventService.notifyFamily(id));
    }

    @PostMapping("/{id}/notify-doctor")
    public ApiResponse<RiskEvent> notifyDoctor(@PathVariable Long id) {
        return ApiResponse.success(riskEventService.notifyDoctor(id));
    }

    @PutMapping("/{id}/fall-details")
    public ApiResponse<RiskEvent> updateFallDetails(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String location = (String) body.get("location");
        String companionStatusStr = (String) body.get("companionStatus");
        CompanionStatus companionStatus = companionStatusStr != null ? CompanionStatus.valueOf(companionStatusStr) : null;
        String injuryPhotos = (String) body.get("injuryPhotos");
        String hospitalResultStr = (String) body.get("hospitalResult");
        HospitalResult hospitalResult = hospitalResultStr != null ? HospitalResult.valueOf(hospitalResultStr) : null;
        String hospitalNotes = (String) body.get("hospitalNotes");
        return ApiResponse.success(riskEventService.updateFallDetails(id, location, companionStatus,
                injuryPhotos, hospitalResult, hospitalNotes));
    }

    @PostMapping("/{id}/review")
    public ApiResponse<RiskEvent> submitReview(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String reviewConclusion = (String) body.get("reviewConclusion");
        String patrolFrequencyAdjustment = (String) body.get("patrolFrequencyAdjustment");
        Boolean planAdjustment = body.get("planAdjustment") != null ? (Boolean) body.get("planAdjustment") : null;
        Boolean billingImpact = body.get("billingImpact") != null ? (Boolean) body.get("billingImpact") : null;
        return ApiResponse.success(riskEventService.submitReview(id, reviewConclusion, patrolFrequencyAdjustment,
                planAdjustment, billingImpact));
    }
}
