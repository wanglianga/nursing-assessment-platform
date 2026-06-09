package com.nursing.controller;

import com.nursing.dto.ApiResponse;
import com.nursing.entity.Assessment;
import com.nursing.service.AssessmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping
    public ApiResponse<Assessment> create(@RequestBody Assessment assessment) {
        return ApiResponse.success(assessmentService.create(assessment));
    }

    @GetMapping("/elder/{elderId}")
    public ApiResponse<List<Assessment>> findByElderId(@PathVariable Long elderId) {
        return ApiResponse.success(assessmentService.findByElderId(elderId));
    }
}
