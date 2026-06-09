package com.nursing.service;

import com.nursing.entity.*;
import com.nursing.repository.BillRepository;
import com.nursing.repository.CarePlanRepository;
import com.nursing.repository.CareRecordRepository;
import com.nursing.repository.ElderRepository;
import com.nursing.repository.LeaveRequestRepository;
import com.nursing.repository.RiskEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final ElderRepository elderRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final RiskEventRepository riskEventRepository;
    private final CarePlanRepository carePlanRepository;
    private final CareRecordRepository careRecordRepository;

    private static final Map<NursingLevel, BigDecimal> NURSING_LEVEL_FEES = Map.of(
            NursingLevel.SELF_CARE, new BigDecimal("2000"),
            NursingLevel.LEVEL_3, new BigDecimal("3500"),
            NursingLevel.LEVEL_2, new BigDecimal("5000"),
            NursingLevel.LEVEL_1, new BigDecimal("7000"),
            NursingLevel.SPECIAL, new BigDecimal("9000")
    );

    private static final BigDecimal BASIC_SERVICE_DAILY = new BigDecimal("30");
    private static final BigDecimal VALUE_ADDED_MONTHLY = new BigDecimal("500");

    public BillingService(BillRepository billRepository, ElderRepository elderRepository,
                          LeaveRequestRepository leaveRequestRepository, RiskEventRepository riskEventRepository,
                          CarePlanRepository carePlanRepository, CareRecordRepository careRecordRepository) {
        this.billRepository = billRepository;
        this.elderRepository = elderRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.riskEventRepository = riskEventRepository;
        this.carePlanRepository = carePlanRepository;
        this.careRecordRepository = careRecordRepository;
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

    @Transactional
    public List<Bill> generateBill(String period) {
        List<Elder> activeElders = elderRepository.findByStatus(ElderStatus.ACTIVE);
        List<Bill> bills = new ArrayList<>();

        YearMonth ym = YearMonth.parse(period);
        LocalDate periodStart = ym.atDay(1);
        LocalDate periodEnd = ym.atEndOfMonth();
        int totalDays = ym.lengthOfMonth();

        for (Elder elder : activeElders) {
            Bill bill = new Bill();
            bill.setElderId(elder.getId());
            bill.setElderName(elder.getName());
            bill.setPeriod(period);
            bill.setStatus(BillStatus.DRAFT);

            List<CarePlan> plans = carePlanRepository.findByElderIdEffectiveInRange(elder.getId(), periodStart, periodEnd);

            BigDecimal totalNursingFee = BigDecimal.ZERO;
            BigDecimal totalBasicServiceFee = BigDecimal.ZERO;

            for (CarePlan plan : plans) {
                LocalDate planStart = plan.getEffectiveDate().isBefore(periodStart) ? periodStart : plan.getEffectiveDate();
                LocalDate planEnd = plan.getExpiryDate() == null || plan.getExpiryDate().isAfter(periodEnd) ? periodEnd : plan.getExpiryDate();

                if (planStart.isAfter(planEnd)) continue;

                long daysInPlan = java.time.temporal.ChronoUnit.DAYS.between(planStart, planEnd) + 1;
                BigDecimal dailyRate = NURSING_LEVEL_FEES.getOrDefault(plan.getNursingLevel(), BigDecimal.ZERO)
                        .divide(new BigDecimal(totalDays), 4, RoundingMode.HALF_UP);
                BigDecimal segmentFee = dailyRate.multiply(new BigDecimal(daysInPlan)).setScale(2, RoundingMode.HALF_UP);
                totalNursingFee = totalNursingFee.add(segmentFee);

                BillDetail nursingDetail = new BillDetail();
                nursingDetail.setCategory(BillDetailCategory.NURSING_LEVEL);
                nursingDetail.setDescription(plan.getNursingLevel().name() + " 等级护理费 (" + planStart + " ~ " + planEnd + ")");
                nursingDetail.setAmount(segmentFee);
                nursingDetail.setQuantity((int) daysInPlan);
                nursingDetail.setUnitPrice(dailyRate.setScale(2, RoundingMode.HALF_UP));
                nursingDetail.setDetailDate(LocalDate.now());
                nursingDetail.setEffectiveStartDate(planStart);
                nursingDetail.setEffectiveEndDate(planEnd);
                bill.getDetails().add(nursingDetail);

                BigDecimal segmentBasicService = BASIC_SERVICE_DAILY.multiply(new BigDecimal(daysInPlan)).setScale(2, RoundingMode.HALF_UP);
                totalBasicServiceFee = totalBasicServiceFee.add(segmentBasicService);

                BillDetail basicDetail = new BillDetail();
                basicDetail.setCategory(BillDetailCategory.BASIC_SERVICE);
                basicDetail.setDescription("基础护理服务 (" + planStart + " ~ " + planEnd + ")");
                basicDetail.setAmount(segmentBasicService);
                basicDetail.setQuantity((int) daysInPlan);
                basicDetail.setUnitPrice(BASIC_SERVICE_DAILY);
                basicDetail.setDetailDate(LocalDate.now());
                basicDetail.setEffectiveStartDate(planStart);
                basicDetail.setEffectiveEndDate(planEnd);
                bill.getDetails().add(basicDetail);
            }

            if (plans.isEmpty()) {
                BigDecimal nursingFee = NURSING_LEVEL_FEES.getOrDefault(elder.getNursingLevel(), BigDecimal.ZERO);
                totalNursingFee = nursingFee;
                totalBasicServiceFee = BASIC_SERVICE_DAILY.multiply(new BigDecimal(totalDays)).setScale(2, RoundingMode.HALF_UP);

                BillDetail nursingDetail = new BillDetail();
                nursingDetail.setCategory(BillDetailCategory.NURSING_LEVEL);
                nursingDetail.setDescription(elder.getNursingLevel().name() + " 等级护理费");
                nursingDetail.setAmount(nursingFee);
                nursingDetail.setQuantity(1);
                nursingDetail.setUnitPrice(nursingFee);
                nursingDetail.setDetailDate(LocalDate.now());
                nursingDetail.setEffectiveStartDate(periodStart);
                nursingDetail.setEffectiveEndDate(periodEnd);
                bill.getDetails().add(nursingDetail);

                BillDetail basicDetail = new BillDetail();
                basicDetail.setCategory(BillDetailCategory.BASIC_SERVICE);
                basicDetail.setDescription("基础护理服务");
                basicDetail.setAmount(totalBasicServiceFee);
                basicDetail.setQuantity(totalDays);
                basicDetail.setUnitPrice(BASIC_SERVICE_DAILY);
                basicDetail.setDetailDate(LocalDate.now());
                basicDetail.setEffectiveStartDate(periodStart);
                basicDetail.setEffectiveEndDate(periodEnd);
                bill.getDetails().add(basicDetail);
            }

            BigDecimal valueAddedFee = VALUE_ADDED_MONTHLY;
            BillDetail valueAddedDetail = new BillDetail();
            valueAddedDetail.setCategory(BillDetailCategory.VALUE_ADDED);
            valueAddedDetail.setDescription("增值服务费");
            valueAddedDetail.setAmount(valueAddedFee);
            valueAddedDetail.setQuantity(1);
            valueAddedDetail.setUnitPrice(valueAddedFee);
            valueAddedDetail.setDetailDate(LocalDate.now());
            bill.getDetails().add(valueAddedDetail);

            BigDecimal leaveDeduction = calculateLeaveDeduction(elder.getId(), period);
            if (leaveDeduction.compareTo(BigDecimal.ZERO) > 0) {
                BillDetail leaveDetail = new BillDetail();
                leaveDetail.setCategory(BillDetailCategory.LEAVE_DEDUCTION);
                leaveDetail.setDescription("请假扣减");
                leaveDetail.setAmount(leaveDeduction);
                leaveDetail.setDetailDate(LocalDate.now());
                addLeaveServiceRecordLinks(elder.getId(), period, leaveDetail);
                bill.getDetails().add(leaveDetail);
            }

            BigDecimal riskCareFee = calculateRiskCareFee(elder.getId(), period);
            if (riskCareFee.compareTo(BigDecimal.ZERO) > 0) {
                BillDetail riskDetail = new BillDetail();
                riskDetail.setCategory(BillDetailCategory.RISK_CARE);
                riskDetail.setDescription("风险护理费");
                riskDetail.setAmount(riskCareFee);
                riskDetail.setDetailDate(LocalDate.now());
                addRiskServiceRecordLinks(elder.getId(), period, riskDetail);
                bill.getDetails().add(riskDetail);
            }

            BigDecimal medicalSupplyFee = calculateMedicalSupplyFee(elder.getId(), period);
            if (medicalSupplyFee.compareTo(BigDecimal.ZERO) > 0) {
                BillDetail medicalDetail = new BillDetail();
                medicalDetail.setCategory(BillDetailCategory.MEDICAL_SUPPLY);
                medicalDetail.setDescription("医嘱用品费");
                medicalDetail.setAmount(medicalSupplyFee);
                medicalDetail.setDetailDate(LocalDate.now());
                addMedicalServiceRecordLinks(elder.getId(), period, medicalDetail);
                bill.getDetails().add(medicalDetail);
            }

            bill.setNursingLevelFee(totalNursingFee);
            bill.setBasicServiceFee(totalBasicServiceFee);
            bill.setValueAddedFee(valueAddedFee);
            bill.setLeaveDeduction(leaveDeduction);
            bill.setRiskCareFee(riskCareFee);
            bill.setMedicalSupplyFee(medicalSupplyFee);

            BigDecimal total = totalNursingFee.add(totalBasicServiceFee).add(valueAddedFee)
                    .subtract(leaveDeduction).add(riskCareFee).add(medicalSupplyFee);
            bill.setTotalAmount(total);

            bills.add(billRepository.save(bill));
        }

        return bills;
    }

    public Map<String, Object> getFeeExplanation(Long billId) {
        Bill bill = findById(billId);
        Map<String, Object> explanation = new HashMap<>();
        explanation.put("bill", bill);

        Map<String, List<Map<String, Object>>> categoryBreakdown = new HashMap<>();

        for (BillDetail detail : bill.getDetails()) {
            String categoryKey = detail.getCategory().name();
            List<Map<String, Object>> items = categoryBreakdown.computeIfAbsent(categoryKey, k -> new ArrayList<>());

            Map<String, Object> item = new HashMap<>();
            item.put("id", detail.getId());
            item.put("description", detail.getDescription());
            item.put("amount", detail.getAmount());
            item.put("quantity", detail.getQuantity());
            item.put("unitPrice", detail.getUnitPrice());
            item.put("effectiveStartDate", detail.getEffectiveStartDate());
            item.put("effectiveEndDate", detail.getEffectiveEndDate());
            item.put("serviceRecordId", detail.getServiceRecordId());

            if (detail.getServiceRecordId() != null) {
                try {
                    CareRecord record = careRecordRepository.findById(detail.getServiceRecordId()).orElse(null);
                    if (record != null) {
                        Map<String, Object> serviceRecord = new HashMap<>();
                        serviceRecord.put("id", record.getId());
                        serviceRecord.put("type", record.getType().name());
                        serviceRecord.put("recordTime", record.getRecordTime());
                        serviceRecord.put("caregiverName", record.getCaregiverName());
                        serviceRecord.put("description", record.getDescription());
                        item.put("serviceRecord", serviceRecord);
                    }
                } catch (Exception ignored) {
                }
            }

            items.add(item);
        }
        explanation.put("breakdown", categoryBreakdown);
        return explanation;
    }

    public BigDecimal calculateLeaveDeduction(Long elderId, String period) {
        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findByStatus(LeaveRequestStatus.APPROVED);
        BigDecimal deduction = BigDecimal.ZERO;

        Elder elder = elderRepository.findById(elderId).orElse(null);
        if (elder == null) return deduction;

        BigDecimal dailyRate = NURSING_LEVEL_FEES.getOrDefault(elder.getNursingLevel(), BigDecimal.ZERO)
                .add(BASIC_SERVICE_DAILY)
                .divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);

        for (LeaveRequest lr : approvedLeaves) {
            if (lr.getElderId().equals(elderId) && lr.getLeaveDays() != null) {
                deduction = deduction.add(dailyRate.multiply(new BigDecimal(lr.getLeaveDays())));
            }
        }

        return deduction;
    }

    public BigDecimal calculateRiskCareFee(Long elderId, String period) {
        List<RiskEvent> events = riskEventRepository.findByElderId(elderId);
        BigDecimal fee = BigDecimal.ZERO;
        for (RiskEvent event : events) {
            if (event.getBillingImpact()) {
                switch (event.getSeverity()) {
                    case LOW -> fee = fee.add(new BigDecimal("200"));
                    case MEDIUM -> fee = fee.add(new BigDecimal("500"));
                    case HIGH -> fee = fee.add(new BigDecimal("1000"));
                    case CRITICAL -> fee = fee.add(new BigDecimal("2000"));
                }
            }
        }
        return fee;
    }

    public BigDecimal calculateMedicalSupplyFee(Long elderId, String period) {
        return BigDecimal.ZERO;
    }

    private void addLeaveServiceRecordLinks(Long elderId, String period, BillDetail detail) {
        List<CareRecord> records = careRecordRepository.findByElderId(elderId);
        if (!records.isEmpty()) {
            detail.setServiceRecordId(records.get(0).getId());
        }
    }

    private void addRiskServiceRecordLinks(Long elderId, String period, BillDetail detail) {
        List<CareRecord> records = careRecordRepository.findByElderId(elderId);
        if (!records.isEmpty()) {
            detail.setServiceRecordId(records.get(0).getId());
        }
    }

    private void addMedicalServiceRecordLinks(Long elderId, String period, BillDetail detail) {
        List<CareRecord> records = careRecordRepository.findByElderId(elderId);
        if (!records.isEmpty()) {
            detail.setServiceRecordId(records.get(0).getId());
        }
    }

    @Transactional
    public Bill updateStatus(Long id, BillStatus status) {
        Bill bill = findById(id);
        bill.setStatus(status);
        return billRepository.save(bill);
    }
}
