package com.nursing.repository;

import com.nursing.entity.Elder;
import com.nursing.entity.ElderStatus;
import com.nursing.entity.NursingLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ElderRepository extends JpaRepository<Elder, Long> {

    List<Elder> findByStatus(ElderStatus status);

    List<Elder> findByNursingLevel(NursingLevel nursingLevel);

    List<Elder> findByNameContaining(String name);

    long countByStatus(ElderStatus status);

    long countByNursingLevel(NursingLevel nursingLevel);
}
