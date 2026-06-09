package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.Bill;
import com.nursing.entity.BillStatus;
import com.nursing.service.BillingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping
    public ApiResponse<List<Bill>> findAll() {
        return ApiResponse.success(billingService.findAll());
    }

    @GetMapping("/elder/{elderId}")
    public ApiResponse<List<Bill>> findByElderId(@PathVariable Long elderId) {
        return ApiResponse.success(billingService.findByElderId(elderId));
    }

    @GetMapping("/{id}")
    public ApiResponse<Bill> findById(@PathVariable Long id) {
        return ApiResponse.success(billingService.findById(id));
    }

    @PostMapping("/generate/{period}")
    public ApiResponse<List<Bill>> generateBill(@PathVariable String period) {
        return ApiResponse.success(billingService.generateBill(period));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Bill> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        BillStatus status = BillStatus.valueOf(statusStr);
        return ApiResponse.success(billingService.updateStatus(id, status));
    }
}
