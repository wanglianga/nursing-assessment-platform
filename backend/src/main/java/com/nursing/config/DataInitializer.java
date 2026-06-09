package com.nursing.config;

import com.nursing.entity.*;
import com.nursing.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ElderRepository elderRepository;
    private final AssessmentRepository assessmentRepository;
    private final CarePlanRepository carePlanRepository;
    private final CareRecordRepository careRecordRepository;
    private final RiskEventRepository riskEventRepository;
    private final BillRepository billRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ElderRepository elderRepository,
                           AssessmentRepository assessmentRepository, CarePlanRepository carePlanRepository,
                           CareRecordRepository careRecordRepository, RiskEventRepository riskEventRepository,
                           BillRepository billRepository, LeaveRequestRepository leaveRequestRepository,
                           ComplaintRepository complaintRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.elderRepository = elderRepository;
        this.assessmentRepository = assessmentRepository;
        this.carePlanRepository = carePlanRepository;
        this.careRecordRepository = careRecordRepository;
        this.riskEventRepository = riskEventRepository;
        this.billRepository = billRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.complaintRepository = complaintRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initUsers();
        List<Elder> elders = initElders();
        initAssessments(elders);
        initCarePlans(elders);
        initCareRecords(elders);
        initRiskEvents(elders);
        initBills(elders);
        initLeaveRequests(elders);
        initComplaints(elders);
    }

    private void initUsers() {
        if (userRepository.count() > 0) return;

        userRepository.save(new User(null, "admin", passwordEncoder.encode("admin123"), Role.ADMIN, "张管理", "13800000001", null, null));
        userRepository.save(new User(null, "doctor1", passwordEncoder.encode("doc123"), Role.DOCTOR, "李医生", "13800000002", null, null));
        userRepository.save(new User(null, "caregiver1", passwordEncoder.encode("care123"), Role.CAREGIVER, "王护理", "13800000003", null, null));
        userRepository.save(new User(null, "family1", passwordEncoder.encode("fam123"), Role.FAMILY, "赵家属", "13800000004", null, null));
    }

    private List<Elder> initElders() {
        if (elderRepository.count() > 0) return elderRepository.findAll();

        List<Elder> elders = new ArrayList<>();

        elders.add(createElder("张秀兰", Gender.FEMALE, 82, "310101194401011234", NursingLevel.SPECIAL, ElderStatus.ACTIVE, "赵家属", "13800000004", "青霉素", "高血压/糖尿病", "降压药/胰岛素"));
        elders.add(createElder("李志强", Gender.MALE, 78, "310101194805052345", NursingLevel.LEVEL_1, ElderStatus.ACTIVE, "李小明", "13800000005", null, "冠心病", "阿司匹林"));
        elders.add(createElder("王淑芬", Gender.FEMALE, 85, "310101194103033456", NursingLevel.LEVEL_2, ElderStatus.ACTIVE, "王建国", "13800000006", "磺胺类", "骨质疏松/高血压", null));
        elders.add(createElder("刘德明", Gender.MALE, 76, "310101195007074567", NursingLevel.LEVEL_3, ElderStatus.ACTIVE, "刘芳", "13800000007", null, "糖尿病", null));
        elders.add(createElder("陈玉兰", Gender.FEMALE, 90, "310101193609095678", NursingLevel.SPECIAL, ElderStatus.ACTIVE, "陈志远", "13800000008", null, "阿尔茨海默病/高血压", "美金刚/降压药"));
        elders.add(createElder("赵国华", Gender.MALE, 73, "310101195311116789", NursingLevel.SELF_CARE, ElderStatus.ACTIVE, "赵丽", "13800000009", null, "轻度高血糖", null));
        elders.add(createElder("孙美华", Gender.FEMALE, 88, "310101193803037890", NursingLevel.LEVEL_1, ElderStatus.ON_LEAVE, "孙伟", "13800000010", null, "帕金森/骨质疏松", null));
        elders.add(createElder("周建国", Gender.MALE, 81, "310101194506068901", NursingLevel.LEVEL_2, ElderStatus.ACTIVE, "周晓红", "13800000011", "头孢类", "慢性支气管炎/高血压", null));

        return elders;
    }

    private Elder createElder(String name, Gender gender, int age, String idCard, NursingLevel level, ElderStatus status, String contactName, String contactPhone, String allergies, String chronicDiseases, String medications) {
        Elder elder = new Elder();
        elder.setName(name);
        elder.setGender(gender);
        elder.setAge(age);
        elder.setIdCard(idCard);
        elder.setAdmissionDate(LocalDate.now().minusMonths(6));
        elder.setNursingLevel(level);
        elder.setContactName(contactName);
        elder.setContactPhone(contactPhone);
        elder.setStatus(status);
        elder.setAllergies(allergies);
        elder.setChronicDiseases(chronicDiseases);
        elder.setCurrentMedications(medications);
        return elderRepository.save(elder);
    }

    private void initAssessments(List<Elder> elders) {
        if (assessmentRepository.count() > 0) return;

        int[][] scores = {
                {18, 20, 18, 15, 15},
                {15, 16, 14, 12, 10},
                {12, 14, 12, 10, 8},
                {8, 10, 8, 8, 7},
                {19, 20, 19, 16, 16},
                {3, 4, 3, 3, 3},
                {16, 18, 15, 13, 12},
                {13, 15, 13, 11, 9}
        };

        for (int i = 0; i < elders.size(); i++) {
            Elder elder = elders.get(i);
            int[] s = scores[i];
            int total = s[0] + s[1] + s[2] + s[3] + s[4];

            NursingLevel level;
            if (total <= 20) level = NursingLevel.SELF_CARE;
            else if (total <= 40) level = NursingLevel.LEVEL_3;
            else if (total <= 60) level = NursingLevel.LEVEL_2;
            else if (total <= 80) level = NursingLevel.LEVEL_1;
            else level = NursingLevel.SPECIAL;

            Assessment assessment = new Assessment();
            assessment.setElderId(elder.getId());
            assessment.setAssessorId(2L);
            assessment.setType(AssessmentType.ADMISSION);
            assessment.setSelfCareScore(s[0]);
            assessment.setCognitiveScore(s[1]);
            assessment.setChronicDiseaseScore(s[2]);
            assessment.setFallRiskScore(s[3]);
            assessment.setMedicationScore(s[4]);
            assessment.setTotalScore(total);
            assessment.setNursingLevel(level);
            assessment.setAssessorName("李医生");
            assessment.setAssessmentDate(LocalDate.now().minusMonths(6));
            assessment.setNotes("入院评估");
            assessmentRepository.save(assessment);
        }
    }

    private void initCarePlans(List<Elder> elders) {
        if (carePlanRepository.count() > 0) return;

        for (Elder elder : elders) {
            CarePlan plan = new CarePlan();
            plan.setElderId(elder.getId());
            plan.setNursingLevel(elder.getNursingLevel());
            plan.setEffectiveDate(LocalDate.now().minusMonths(6));
            plan.setStatus(CarePlanStatus.ACTIVE);

            CarePlan savedPlan = carePlanRepository.save(plan);

            List<CarePlanItem> items = generateCarePlanItems(elder.getNursingLevel());
            for (CarePlanItem item : items) {
                item.setCarePlanId(savedPlan.getId());
            }
            savedPlan.setItems(items);
            carePlanRepository.save(savedPlan);
        }
    }

    private List<CarePlanItem> generateCarePlanItems(NursingLevel level) {
        List<CarePlanItem> items = new ArrayList<>();

        switch (level) {
            case SPECIAL -> {
                items.add(createItem(CareItemType.TURN_OVER, "每2小时一次", "定时翻身防压疮"));
                items.add(createItem(CareItemType.FEEDING, "每日3次", "协助进食"));
                items.add(createItem(CareItemType.BATHING, "每日1次", "全身擦浴"));
                items.add(createItem(CareItemType.REHABILITATION, "每日2次", "被动康复训练"));
                items.add(createItem(CareItemType.NIGHT_PATROL, "每2小时一次", "夜间巡护"));
            }
            case LEVEL_1 -> {
                items.add(createItem(CareItemType.TURN_OVER, "每3小时一次", "定时翻身"));
                items.add(createItem(CareItemType.FEEDING, "每日3次", "协助进食"));
                items.add(createItem(CareItemType.BATHING, "每日1次", "协助洗浴"));
                items.add(createItem(CareItemType.REHABILITATION, "每日1次", "康复训练"));
                items.add(createItem(CareItemType.NIGHT_PATROL, "每3小时一次", "夜间巡护"));
            }
            case LEVEL_2 -> {
                items.add(createItem(CareItemType.TURN_OVER, "每4小时一次", "协助翻身"));
                items.add(createItem(CareItemType.FEEDING, "每日3次", "协助进食"));
                items.add(createItem(CareItemType.BATHING, "隔日1次", "协助洗浴"));
                items.add(createItem(CareItemType.REHABILITATION, "每日1次", "康复训练"));
            }
            case LEVEL_3 -> {
                items.add(createItem(CareItemType.FEEDING, "每日3次", "监督进食"));
                items.add(createItem(CareItemType.BATHING, "每周3次", "协助洗浴"));
                items.add(createItem(CareItemType.REHABILITATION, "每周3次", "康复指导"));
            }
            case SELF_CARE -> {
                items.add(createItem(CareItemType.BATHING, "每周2次", "洗浴辅助"));
                items.add(createItem(CareItemType.OTHER, "每日1次", "日常巡访"));
            }
        }

        return items;
    }

    private CarePlanItem createItem(CareItemType type, String frequency, String description) {
        CarePlanItem item = new CarePlanItem();
        item.setType(type);
        item.setFrequency(frequency);
        item.setDescription(description);
        item.setIsActive(true);
        return item;
    }

    private void initCareRecords(List<Elder> elders) {
        if (careRecordRepository.count() > 0) return;

        for (Elder elder : elders) {
            if (elder.getStatus() == ElderStatus.ON_LEAVE) continue;

            for (int day = 0; day < 3; day++) {
                LocalDate date = LocalDate.now().minusDays(day);

                CareRecord turnOver = new CareRecord();
                turnOver.setElderId(elder.getId());
                turnOver.setCaregiverId(3L);
                turnOver.setCaregiverName("王护理");
                turnOver.setType(CareItemType.TURN_OVER);
                turnOver.setRecordTime(date.atTime(8, 0));
                turnOver.setDescription("完成翻身护理");
                turnOver.setNotes("皮肤完好");
                careRecordRepository.save(turnOver);

                CareRecord feeding = new CareRecord();
                feeding.setElderId(elder.getId());
                feeding.setCaregiverId(3L);
                feeding.setCaregiverName("王护理");
                feeding.setType(CareItemType.FEEDING);
                feeding.setRecordTime(date.atTime(12, 0));
                feeding.setDescription("完成午餐喂食");
                feeding.setNotes("进食正常");
                careRecordRepository.save(feeding);

                CareRecord bathing = new CareRecord();
                bathing.setElderId(elder.getId());
                bathing.setCaregiverId(3L);
                bathing.setCaregiverName("王护理");
                bathing.setType(CareItemType.BATHING);
                bathing.setRecordTime(date.atTime(15, 0));
                bathing.setDescription("完成擦浴");
                bathing.setNotes("无异常");
                careRecordRepository.save(bathing);
            }
        }
    }

    private void initRiskEvents(List<Elder> elders) {
        if (riskEventRepository.count() > 0) return;

        if (elders.size() >= 1) {
            RiskEvent fall = new RiskEvent();
            fall.setElderId(elders.get(0).getId());
            fall.setElderName(elders.get(0).getName());
            fall.setType(RiskEventType.FALL);
            fall.setSeverity(Severity.HIGH);
            fall.setEventTime(LocalDateTime.now().minusDays(2));
            fall.setDiscoverer("王护理");
            fall.setDescription("老人在卫生间滑倒，左髋部疼痛");
            fall.setStatus(RiskEventStatus.PROCESSING);
            fall.setPlanAdjustment(true);
            fall.setBillingImpact(true);

            RiskEvent savedFall = riskEventRepository.save(fall);

            HandlingRecord hr = new HandlingRecord();
            hr.setRiskEventId(savedFall.getId());
            hr.setHandler("李医生");
            hr.setHandlerRole("DOCTOR");
            hr.setAction("紧急检查，安排X光检查");
            hr.setActionTime(LocalDateTime.now().minusDays(2).plusHours(1));
            hr.setResult("无骨折，软组织挫伤");
            savedFall.getHandlingRecords().add(hr);
            riskEventRepository.save(savedFall);
        }

        if (elders.size() >= 4) {
            RiskEvent pressureSore = new RiskEvent();
            pressureSore.setElderId(elders.get(3).getId());
            pressureSore.setElderName(elders.get(3).getName());
            pressureSore.setType(RiskEventType.PRESSURE_SORE);
            pressureSore.setSeverity(Severity.MEDIUM);
            pressureSore.setEventTime(LocalDateTime.now().minusDays(1));
            pressureSore.setDiscoverer("王护理");
            pressureSore.setDescription("骶尾部发现一期压疮");
            pressureSore.setStatus(RiskEventStatus.REPORTED);
            pressureSore.setPlanAdjustment(true);
            pressureSore.setBillingImpact(false);
            riskEventRepository.save(pressureSore);
        }

        if (elders.size() >= 7) {
            RiskEvent pickup = new RiskEvent();
            pickup.setElderId(elders.get(6).getId());
            pickup.setElderName(elders.get(6).getName());
            pickup.setType(RiskEventType.FAMILY_PICKUP);
            pickup.setSeverity(Severity.LOW);
            pickup.setEventTime(LocalDateTime.now().minusDays(3));
            pickup.setDiscoverer("前台");
            pickup.setDescription("家属接老人外出探亲");
            pickup.setStatus(RiskEventStatus.RESOLVED);
            pickup.setPlanAdjustment(false);
            pickup.setBillingImpact(false);
            riskEventRepository.save(pickup);
        }
    }

    private void initBills(List<Elder> elders) {
        if (billRepository.count() > 0) return;

        String period = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        for (Elder elder : elders) {
            if (elder.getStatus() == ElderStatus.DISCHARGED) continue;

            BigDecimal nursingFee = switch (elder.getNursingLevel()) {
                case SPECIAL -> new BigDecimal("9000");
                case LEVEL_1 -> new BigDecimal("7000");
                case LEVEL_2 -> new BigDecimal("5000");
                case LEVEL_3 -> new BigDecimal("3500");
                case SELF_CARE -> new BigDecimal("2000");
            };

            BigDecimal valueAdded = new BigDecimal("500");
            BigDecimal leaveDeduction = BigDecimal.ZERO;
            BigDecimal riskAdj = BigDecimal.ZERO;

            if (elder.getStatus() == ElderStatus.ON_LEAVE) {
                leaveDeduction = nursingFee.divide(new BigDecimal("30"), 2, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("3"));
            }

            BigDecimal total = nursingFee.add(valueAdded).subtract(leaveDeduction).add(riskAdj);

            Bill bill = new Bill();
            bill.setElderId(elder.getId());
            bill.setElderName(elder.getName());
            bill.setPeriod(period);
            bill.setNursingLevelFee(nursingFee);
            bill.setValueAddedFee(valueAdded);
            bill.setLeaveDeduction(leaveDeduction);
            bill.setRiskAdjustment(riskAdj);
            bill.setTotalAmount(total);
            bill.setStatus(BillStatus.DRAFT);

            Bill savedBill = billRepository.save(bill);

            BillDetail nursingDetail = new BillDetail();
            nursingDetail.setBillId(savedBill.getId());
            nursingDetail.setCategory(BillDetailCategory.NURSING_LEVEL);
            nursingDetail.setDescription(elder.getNursingLevel().name() + " 等级护理费");
            nursingDetail.setAmount(nursingFee);
            nursingDetail.setQuantity(1);
            nursingDetail.setUnitPrice(nursingFee);
            nursingDetail.setDetailDate(LocalDate.now());
            savedBill.getDetails().add(nursingDetail);

            BillDetail valueDetail = new BillDetail();
            valueDetail.setBillId(savedBill.getId());
            valueDetail.setCategory(BillDetailCategory.VALUE_ADDED);
            valueDetail.setDescription("增值服务费");
            valueDetail.setAmount(valueAdded);
            valueDetail.setQuantity(1);
            valueDetail.setUnitPrice(valueAdded);
            valueDetail.setDetailDate(LocalDate.now());
            savedBill.getDetails().add(valueDetail);

            billRepository.save(savedBill);
        }
    }

    private void initLeaveRequests(List<Elder> elders) {
        if (leaveRequestRepository.count() > 0) return;

        if (elders.size() >= 7) {
            LeaveRequest lr = new LeaveRequest();
            lr.setElderId(elders.get(6).getId());
            lr.setElderName(elders.get(6).getName());
            lr.setFamilyMemberId(4L);
            lr.setFamilyMemberName("赵家属");
            lr.setStartDate(LocalDate.now().minusDays(3));
            lr.setEndDate(LocalDate.now().minusDays(1));
            lr.setReason("回家探亲");
            lr.setStatus(LeaveRequestStatus.APPROVED);
            lr.setApprovedBy("张管理");
            lr.setLeaveDays(3);
            leaveRequestRepository.save(lr);
        }

        LeaveRequest pending = new LeaveRequest();
        pending.setElderId(elders.get(0).getId());
        pending.setElderName(elders.get(0).getName());
        pending.setFamilyMemberId(4L);
        pending.setFamilyMemberName("赵家属");
        pending.setStartDate(LocalDate.now().plusDays(5));
        pending.setEndDate(LocalDate.now().plusDays(7));
        pending.setReason("家庭聚餐");
        pending.setStatus(LeaveRequestStatus.PENDING);
        pending.setLeaveDays(3);
        leaveRequestRepository.save(pending);
    }

    private void initComplaints(List<Elder> elders) {
        if (complaintRepository.count() > 0) return;

        Complaint complaint = new Complaint();
        complaint.setElderId(elders.get(0).getId());
        complaint.setElderName(elders.get(0).getName());
        complaint.setFamilyMemberId(4L);
        complaint.setFamilyMemberName("赵家属");
        complaint.setType(ComplaintType.SERVICE_QUALITY);
        complaint.setDescription("近日护理服务不够及时，翻身护理有延误");
        complaint.setStatus(ComplaintStatus.PROCESSING);
        complaintRepository.save(complaint);

        Complaint complaint2 = new Complaint();
        complaint2.setElderId(elders.get(2).getId());
        complaint2.setElderName(elders.get(2).getName());
        complaint2.setFamilyMemberId(4L);
        complaint2.setFamilyMemberName("赵家属");
        complaint2.setType(ComplaintType.FEE_DISPUTE);
        complaint2.setDescription("对上月账单中的增值服务费有疑问");
        complaint2.setStatus(ComplaintStatus.SUBMITTED);
        complaintRepository.save(complaint2);
    }
}
