package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.*;
import com.nursing.repository.*;
import com.nursing.service.ElderService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/elders")
public class ElderController {

    private final ElderService elderService;
    private final AssessmentRepository assessmentRepository;
    private final CarePlanRepository carePlanRepository;
    private final CareRecordRepository careRecordRepository;
    private final RiskEventRepository riskEventRepository;
    private final BillRepository billRepository;

    public ElderController(ElderService elderService, AssessmentRepository assessmentRepository,
                           CarePlanRepository carePlanRepository, CareRecordRepository careRecordRepository,
                           RiskEventRepository riskEventRepository, BillRepository billRepository) {
        this.elderService = elderService;
        this.assessmentRepository = assessmentRepository;
        this.carePlanRepository = carePlanRepository;
        this.careRecordRepository = careRecordRepository;
        this.riskEventRepository = riskEventRepository;
        this.billRepository = billRepository;
    }

    @GetMapping
    public ApiResponse<List<Elder>> findAll() {
        return ApiResponse.success(elderService.findAll());
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.success(elderService.getStats());
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> findById(@PathVariable Long id) {
        Elder elder = elderService.findById(id);
        Map<String, Object> detail = new HashMap<>();
        detail.put("elder", elder);
        detail.put("assessments", assessmentRepository.findByElderIdOrderByAssessmentDateDesc(id));
        detail.put("carePlan", carePlanRepository.findByElderIdAndStatus(id, CarePlanStatus.ACTIVE).orElse(null));

        List<CareRecord> records = careRecordRepository.findByElderId(id);
        if (records.size() > 10) {
            records = records.subList(0, 10);
        }
        detail.put("recentRecords", records);

        detail.put("riskEvents", riskEventRepository.findByElderId(id));
        detail.put("bills", billRepository.findByElderId(id));

        return ApiResponse.success(detail);
    }

    @PostMapping
    public ApiResponse<Elder> create(@RequestBody Elder elder) {
        return ApiResponse.success(elderService.create(elder));
    }

    @PutMapping("/{id}")
    public ApiResponse<Elder> update(@PathVariable Long id, @RequestBody Elder elder) {
        return ApiResponse.success(elderService.update(id, elder));
    }
}
