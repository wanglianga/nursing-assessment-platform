package com.nursing.service;

import com.nursing.entity.*;
import com.nursing.repository.BillRepository;
import com.nursing.repository.ElderRepository;
import com.nursing.repository.LeaveRequestRepository;
import com.nursing.repository.RiskEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final ElderRepository elderRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final RiskEventRepository riskEventRepository;

    private static final Map<NursingLevel, BigDecimal> NURSING_LEVEL_FEES = Map.of(
            NursingLevel.SELF_CARE, new BigDecimal("2000"),
            NursingLevel.LEVEL_3, new BigDecimal("3500"),
            NursingLevel.LEVEL_2, new BigDecimal("5000"),
            NursingLevel.LEVEL_1, new BigDecimal("7000"),
            NursingLevel.SPECIAL, new BigDecimal("9000")
    );

    public BillingService(BillRepository billRepository, ElderRepository elderRepository,
                          LeaveRequestRepository leaveRequestRepository, RiskEventRepository riskEventRepository) {
        this.billRepository = billRepository;
        this.elderRepository = elderRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.riskEventRepository = riskEventRepository;
    }

    public List<Bill> findAll() {
        return billRepository.findAll();
    }

    public List<Bill> findByElderId(Long elderId) {
        return billRepository.findByElderId(elderId);
    }

    public Bill findById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("账单未找到: " + id));
    }

    public List<Bill> findByPeriod(String period) {
        return billRepository.findByPeriod(period);
    }

    public BigDecimal calculateNursingLevelFee(NursingLevel level) {
        return NURSING_LEVEL_FEES.getOrDefault(level, BigDecimal.ZERO);
    }

    public BigDecimal calculateLeaveDeduction(Long elderId, String period) {
        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findByStatus(LeaveRequestStatus.APPROVED);
        BigDecimal deduction = BigDecimal.ZERO;
        BigDecimal dailyRate = BigDecimal.ZERO;

        Elder elder = elderRepository.findById(elderId).orElse(null);
        if (elder != null) {
            dailyRate = NURSING_LEVEL_FEES.getOrDefault(elder.getNursingLevel(), BigDecimal.ZERO)
                    .divide(new BigDecimal("30"), 2, BigDecimal.ROUND_HALF_UP);
        }

        for (LeaveRequest lr : approvedLeaves) {
            if (lr.getElderId().equals(elderId) && lr.getLeaveDays() != null) {
                deduction = deduction.add(dailyRate.multiply(new BigDecimal(lr.getLeaveDays())));
            }
        }

        return deduction;
    }

    public BigDecimal calculateRiskAdjustment(Long elderId, String period) {
        List<RiskEvent> events = riskEventRepository.findByElderId(elderId);
        BigDecimal adjustment = BigDecimal.ZERO;
        for (RiskEvent event : events) {
            if (event.getBillingImpact()) {
                switch (event.getSeverity()) {
                    case LOW -> adjustment = adjustment.add(new BigDecimal("200"));
                    case MEDIUM -> adjustment = adjustment.add(new BigDecimal("500"));
                    case HIGH -> adjustment = adjustment.add(new BigDecimal("1000"));
                    case CRITICAL -> adjustment = adjustment.add(new BigDecimal("2000"));
                }
            }
        }
        return adjustment;
    }

    @Transactional
    public List<Bill> generateBill(String period) {
        List<Elder> activeElders = elderRepository.findByStatus(ElderStatus.ACTIVE);
        List<Bill> bills = new ArrayList<>();

        for (Elder elder : activeElders) {
            BigDecimal nursingFee = calculateNursingLevelFee(elder.getNursingLevel());
            BigDecimal valueAddedFee = new BigDecimal("500");
            BigDecimal leaveDeduction = calculateLeaveDeduction(elder.getId(), period);
            BigDecimal riskAdjustment = calculateRiskAdjustment(elder.getId(), period);

            BigDecimal total = nursingFee.add(valueAddedFee).subtract(leaveDeduction).add(riskAdjustment);

            Bill bill = new Bill();
            bill.setElderId(elder.getId());
            bill.setElderName(elder.getName());
            bill.setPeriod(period);
            bill.setNursingLevelFee(nursingFee);
            bill.setValueAddedFee(valueAddedFee);
            bill.setLeaveDeduction(leaveDeduction);
            bill.setRiskAdjustment(riskAdjustment);
            bill.setTotalAmount(total);
            bill.setStatus(BillStatus.DRAFT);

            BillDetail nursingDetail = new BillDetail();
            nursingDetail.setCategory(BillDetailCategory.NURSING_LEVEL);
            nursingDetail.setDescription(elder.getNursingLevel().name() + " 等级护理费");
            nursingDetail.setAmount(nursingFee);
            nursingDetail.setQuantity(1);
            nursingDetail.setUnitPrice(nursingFee);
            nursingDetail.setDetailDate(LocalDate.now());
            bill.getDetails().add(nursingDetail);

            BillDetail valueAddedDetail = new BillDetail();
            valueAddedDetail.setCategory(BillDetailCategory.VALUE_ADDED);
            valueAddedDetail.setDescription("增值服务费");
            valueAddedDetail.setAmount(valueAddedFee);
            valueAddedDetail.setQuantity(1);
            valueAddedDetail.setUnitPrice(valueAddedFee);
            valueAddedDetail.setDetailDate(LocalDate.now());
            bill.getDetails().add(valueAddedDetail);

            if (leaveDeduction.compareTo(BigDecimal.ZERO) > 0) {
                BillDetail leaveDetail = new BillDetail();
                leaveDetail.setCategory(BillDetailCategory.LEAVE_DEDUCTION);
                leaveDetail.setDescription("请假扣减");
                leaveDetail.setAmount(leaveDeduction);
                leaveDetail.setDetailDate(LocalDate.now());
                bill.getDetails().add(leaveDetail);
            }

            if (riskAdjustment.compareTo(BigDecimal.ZERO) > 0) {
                BillDetail riskDetail = new BillDetail();
                riskDetail.setCategory(BillDetailCategory.RISK_ADJUSTMENT);
                riskDetail.setDescription("风险事件调整");
                riskDetail.setAmount(riskAdjustment);
                riskDetail.setDetailDate(LocalDate.now());
                bill.getDetails().add(riskDetail);
            }

            bills.add(billRepository.save(bill));
        }

        return bills;
    }

    @Transactional
    public Bill updateStatus(Long id, BillStatus status) {
        Bill bill = findById(id);
        bill.setStatus(status);
        return billRepository.save(bill);
    }
}
