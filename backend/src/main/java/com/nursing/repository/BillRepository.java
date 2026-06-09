package com.nursing.repository;

import com.nursing.entity.Bill;
import com.nursing.entity.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByElderId(Long elderId);

    List<Bill> findByPeriod(String period);

    List<Bill> findByStatus(BillStatus status);
}
