package com.nursing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "risk_events")
public class RiskEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long elderId;

    private String elderName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskEventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false)
    private LocalDateTime eventTime;

    private String discoverer;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskEventStatus status;

    @Column(nullable = false)
    private Boolean planAdjustment = false;

    @Column(nullable = false)
    private Boolean billingImpact = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "riskEventId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HandlingRecord> handlingRecords = new ArrayList<>();

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
