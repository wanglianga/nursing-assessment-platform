package com.nursing.repository;

import com.nursing.entity.Complaint;
import com.nursing.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByElderId(Long elderId);

    List<Complaint> findByFamilyMemberId(Long familyMemberId);

    List<Complaint> findByStatus(ComplaintStatus status);
}
