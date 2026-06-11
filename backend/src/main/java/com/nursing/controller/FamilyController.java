package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.*;
import com.nursing.service.FamilyService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService familyService;
    private static final DateTimeFormatter DTF = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @GetMapping("/{familyMemberId}/elders")
    public ApiResponse<List<Elder>> getElderRecords(@PathVariable Long familyMemberId) {
        return ApiResponse.success(familyService.getElderRecords(familyMemberId));
    }

    @GetMapping("/{familyMemberId}/records/{elderId}")
    public ApiResponse<List<CareRecord>> getCareRecords(@PathVariable Long familyMemberId, @PathVariable Long elderId) {
        return ApiResponse.success(familyService.getCareRecords(familyMemberId, elderId));
    }

    @GetMapping("/{familyMemberId}/leave-requests")
    public ApiResponse<List<LeaveRequest>> getLeaveRequests(@PathVariable Long familyMemberId) {
        return ApiResponse.success(familyService.getLeaveRequests(familyMemberId));
    }

    @PostMapping("/{familyMemberId}/leave-requests")
    public ApiResponse<LeaveRequest> createLeaveRequest(@PathVariable Long familyMemberId, @RequestBody LeaveRequest request) {
        return ApiResponse.success(familyService.createLeaveRequest(familyMemberId, request));
    }

    @PutMapping("/leave-requests/{id}/approve")
    public ApiResponse<LeaveRequest> approveLeaveRequest(@PathVariable Long id) {
        return ApiResponse.success(familyService.approveLeaveRequest(id));
    }

    @PutMapping("/leave-requests/{id}/reject")
    public ApiResponse<LeaveRequest> rejectLeaveRequest(@PathVariable Long id) {
        return ApiResponse.success(familyService.rejectLeaveRequest(id));
    }

    @PutMapping("/leave-requests/{id}/pickup")
    public ApiResponse<LeaveRequest> recordPickup(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String pickupTimeStr = (String) body.get("pickupTime");
        LocalDateTime pickupTime = pickupTimeStr != null ? LocalDateTime.parse(pickupTimeStr, DTF) : null;
        String medicationHandover = (String) body.get("medicationHandover");
        Boolean riskAcknowledged = body.get("riskAcknowledged") != null ? (Boolean) body.get("riskAcknowledged") : null;
        String expectedReturnTimeStr = (String) body.get("expectedReturnTime");
        LocalDateTime expectedReturnTime = expectedReturnTimeStr != null ? LocalDateTime.parse(expectedReturnTimeStr, DTF) : null;
        return ApiResponse.success(familyService.recordPickup(id, pickupTime, medicationHandover,
                riskAcknowledged, expectedReturnTime));
    }

    @PutMapping("/leave-requests/{id}/return")
    public ApiResponse<LeaveRequest> recordReturn(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        LocalDateTime actualReturnTime = null;
        if (body != null) {
            String returnTimeStr = (String) body.get("actualReturnTime");
            actualReturnTime = returnTimeStr != null ? LocalDateTime.parse(returnTimeStr, DTF) : null;
        }
        return ApiResponse.success(familyService.recordReturn(id, actualReturnTime));
    }

    @PutMapping("/leave-requests/{id}/health-confirm")
    public ApiResponse<LeaveRequest> confirmHealthOnReturn(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String statusStr = (String) body.get("status");
        HealthReconfirmStatus status = statusStr != null ? HealthReconfirmStatus.valueOf(statusStr) : HealthReconfirmStatus.PENDING;
        String notes = (String) body.get("notes");
        return ApiResponse.success(familyService.confirmHealthOnReturn(id, status, notes));
    }

    @GetMapping("/{familyMemberId}/complaints")
    public ApiResponse<List<Complaint>> getComplaints(@PathVariable Long familyMemberId) {
        return ApiResponse.success(familyService.getComplaints(familyMemberId));
    }

    @PostMapping("/{familyMemberId}/complaints")
    public ApiResponse<Complaint> createComplaint(@PathVariable Long familyMemberId, @RequestBody Complaint complaint) {
        return ApiResponse.success(familyService.createComplaint(familyMemberId, complaint));
    }

    @PutMapping("/complaints/{id}/resolve")
    public ApiResponse<Complaint> resolveComplaint(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.success(familyService.resolveComplaint(id, body.get("response")));
    }
}
