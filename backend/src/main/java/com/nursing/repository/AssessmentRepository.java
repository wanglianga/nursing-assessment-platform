package com.nursing.repository;

import com.nursing.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByElderId(Long elderId);

    List<Assessment> findByElderIdOrderByAssessmentDateDesc(Long elderId);
}
