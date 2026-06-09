package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.CareRecord;
import com.nursing.entity.Complaint;
import com.nursing.entity.Elder;
import com.nursing.entity.LeaveRequest;
import com.nursing.service.FamilyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService familyService;

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
