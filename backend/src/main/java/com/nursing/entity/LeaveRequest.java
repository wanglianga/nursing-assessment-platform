package com.nursing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long elderId;

    private String elderName;

    @Column(nullable = false)
    private Long familyMemberId;

    private String familyMemberName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveRequestStatus status;

    private String approvedBy;

    private Integer leaveDays;

    private LocalDateTime pickupTime;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String medicationHandover;

    private Boolean riskAcknowledged = false;

    private LocalDateTime riskAcknowledgedTime;

    private LocalDateTime expectedReturnTime;

    private LocalDateTime actualReturnTime;

    @Enumerated(EnumType.STRING)
    private HealthReconfirmStatus healthReconfirmStatus;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String healthReconfirmNotes;

    private LocalDateTime healthReconfirmTime;

    private Boolean billingSuspended = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
