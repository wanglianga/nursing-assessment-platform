package com.nursing.service;

import com.nursing.entity.*;
import com.nursing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FamilyService {

    private final ElderRepository elderRepository;
    private final CareRecordRepository careRecordRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final CarePlanRepository carePlanRepository;

    public FamilyService(ElderRepository elderRepository, CareRecordRepository careRecordRepository,
                         LeaveRequestRepository leaveRequestRepository, ComplaintRepository complaintRepository,
                         UserRepository userRepository, CarePlanRepository carePlanRepository) {
        this.elderRepository = elderRepository;
        this.careRecordRepository = careRecordRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.carePlanRepository = carePlanRepository;
    }

    public List<Elder> getElderRecords(Long familyMemberId) {
        List<Elder> allElders = elderRepository.findAll();
        List<Elder> result = new ArrayList<>();
        for (Elder elder : allElders) {
            if (elder.getContactName() != null) {
                User family = userRepository.findById(familyMemberId).orElse(null);
                if (family != null && elder.getContactName().contains(family.getName())) {
                    result.add(elder);
                }
            }
        }
        return result;
    }

    public List<CareRecord> getCareRecords(Long familyMemberId, Long elderId) {
        return careRecordRepository.findByElderId(elderId);
    }

    public List<LeaveRequest> getLeaveRequests(Long familyMemberId) {
        return leaveRequestRepository.findByFamilyMemberId(familyMemberId);
    }

    @Transactional
    public LeaveRequest createLeaveRequest(Long familyMemberId, LeaveRequest request) {
        User family = userRepository.findById(familyMemberId)
                .orElseThrow(() -> new RuntimeException("家属用户未找到"));
        Elder elder = elderRepository.findById(request.getElderId())
                .orElseThrow(() -> new RuntimeException("老人信息未找到"));

        request.setFamilyMemberId(familyMemberId);
        request.setFamilyMemberName(family.getName());
        request.setElderName(elder.getName());
        request.setStatus(LeaveRequestStatus.PENDING);
        if (request.getRiskAcknowledged() == null) request.setRiskAcknowledged(false);
        if (request.getBillingSuspended() == null) request.setBillingSuspended(false);
        if (request.getHealthReconfirmStatus() == null) {
            request.setHealthReconfirmStatus(HealthReconfirmStatus.PENDING);
        }

        if (request.getStartDate() != null && request.getEndDate() != null) {
            request.setLeaveDays((int) java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1);
        }

        return leaveRequestRepository.save(request);
    }

    @Transactional
    public LeaveRequest approveLeaveRequest(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("请假申请未找到"));
        request.setStatus(LeaveRequestStatus.APPROVED);
        request.setApprovedBy("系统管理员");

        Elder elder = elderRepository.findById(request.getElderId()).orElse(null);
        if (elder != null) {
            elder.setStatus(ElderStatus.ON_LEAVE);
            elderRepository.save(elder);
        }

        return leaveRequestRepository.save(request);
    }

    @Transactional
    public LeaveRequest rejectLeaveRequest(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("请假申请未找到"));
        request.setStatus(LeaveRequestStatus.REJECTED);
        return leaveRequestRepository.save(request);
    }

    @Transactional
    public LeaveRequest recordPickup(Long leaveId, LocalDateTime pickupTime, String medicationHandover,
                                     Boolean riskAcknowledged, LocalDateTime expectedReturnTime) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("请假申请未找到"));

        request.setPickupTime(pickupTime != null ? pickupTime : LocalDateTime.now());
        request.setMedicationHandover(medicationHandover);
        request.setRiskAcknowledged(riskAcknowledged != null ? riskAcknowledged : true);
        if (riskAcknowledged != null && riskAcknowledged) {
            request.setRiskAcknowledgedTime(LocalDateTime.now());
        }
        request.setExpectedReturnTime(expectedReturnTime);
        request.setStatus(LeaveRequestStatus.ON_LEAVE);
        request.setBillingSuspended(true);

        CarePlan activePlan = carePlanRepository.findByElderIdAndStatus(request.getElderId(), CarePlanStatus.ACTIVE).orElse(null);
        if (activePlan != null) {
            CarePlanChange change = new CarePlanChange();
            change.setCarePlanId(activePlan.getId());
            change.setChangeDate(java.time.LocalDate.now());
            change.setChangeReason("家属临时接回(LEAVE_ID=" + leaveId + ")，请假期间护理费用暂停");
            change.setReasonType(ReasonType.FAMILY_LEAVE);
            activePlan.getChanges().add(change);
            carePlanRepository.save(activePlan);
        }

        return leaveRequestRepository.save(request);
    }

    @Transactional
    public LeaveRequest recordReturn(Long leaveId, LocalDateTime actualReturnTime) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("请假申请未找到"));

        request.setActualReturnTime(actualReturnTime != null ? actualReturnTime : LocalDateTime.now());
        request.setStatus(LeaveRequestStatus.RETURNED);
        request.setHealthReconfirmStatus(HealthReconfirmStatus.PENDING);
        request.setBillingSuspended(false);

        Elder elder = elderRepository.findById(request.getElderId()).orElse(null);
        if (elder != null) {
            elder.setStatus(ElderStatus.ACTIVE);
            elderRepository.save(elder);
        }

        return leaveRequestRepository.save(request);
    }

    @Transactional
    public LeaveRequest confirmHealthOnReturn(Long leaveId, HealthReconfirmStatus status, String notes) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("请假申请未找到"));

        request.setHealthReconfirmStatus(status);
        request.setHealthReconfirmNotes(notes);
        request.setHealthReconfirmTime(LocalDateTime.now());

        if (status == HealthReconfirmStatus.CONFIRMED_NORMAL || status == HealthReconfirmStatus.CONFIRMED_ABNORMAL) {
            request.setStatus(LeaveRequestStatus.COMPLETED);
        }

        return leaveRequestRepository.save(request);
    }

    public List<Complaint> getComplaints(Long familyMemberId) {
        return complaintRepository.findByFamilyMemberId(familyMemberId);
    }

    @Transactional
    public Complaint createComplaint(Long familyMemberId, Complaint complaint) {
        User family = userRepository.findById(familyMemberId)
                .orElseThrow(() -> new RuntimeException("家属用户未找到"));
        Elder elder = elderRepository.findById(complaint.getElderId())
                .orElseThrow(() -> new RuntimeException("老人信息未找到"));

        complaint.setFamilyMemberId(familyMemberId);
        complaint.setFamilyMemberName(family.getName());
        complaint.setElderName(elder.getName());
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint resolveComplaint(Long id, String response) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("投诉未找到"));
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResponse(response);
        complaint.setResolvedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }
}
