package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.CarePlan;
import com.nursing.entity.CarePlanChange;
import com.nursing.entity.CarePlanItem;
import com.nursing.entity.CarePlanStatus;
import com.nursing.service.CarePlanService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/care-plans")
public class CarePlanController {

    private final CarePlanService carePlanService;

    public CarePlanController(CarePlanService carePlanService) {
        this.carePlanService = carePlanService;
    }

    @GetMapping("/elder/{elderId}")
    public ApiResponse<CarePlan> findByElderId(@PathVariable Long elderId) {
        return ApiResponse.success(carePlanService.findByElderId(elderId));
    }

    @PostMapping("/elder/{elderId}/items")
    public ApiResponse<CarePlanItem> addItem(@PathVariable Long elderId, @RequestBody CarePlanItem item) {
        CarePlan plan = carePlanService.findByElderId(elderId);
        if (plan == null) {
            return ApiResponse.error("未找到活跃的护理方案");
        }
        return ApiResponse.success(carePlanService.addItem(plan.getId(), item));
    }

    @PutMapping("/items/{id}")
    public ApiResponse<CarePlanItem> updateItem(@PathVariable Long id, @RequestBody CarePlanItem item) {
        return ApiResponse.success(carePlanService.updateItem(id, item));
    }

    @PostMapping("/{id}/changes")
    public ApiResponse<CarePlanChange> addChange(@PathVariable Long id, @RequestBody CarePlanChange change) {
        return ApiResponse.success(carePlanService.addChange(id, change));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<CarePlan> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String action = body.get("action");
        if ("suspend".equals(action)) {
            return ApiResponse.success(carePlanService.suspendPlan(id));
        } else if ("activate".equals(action)) {
            return ApiResponse.success(carePlanService.activatePlan(id));
        }
        return ApiResponse.error("无效的操作: " + action);
    }
}
