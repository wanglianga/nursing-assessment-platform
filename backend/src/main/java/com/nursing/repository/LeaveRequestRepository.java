package com.nursing.repository;

import com.nursing.entity.LeaveRequest;
import com.nursing.entity.LeaveRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByElderId(Long elderId);

    List<LeaveRequest> findByFamilyMemberId(Long familyMemberId);

    List<LeaveRequest> findByStatus(LeaveRequestStatus status);
}
