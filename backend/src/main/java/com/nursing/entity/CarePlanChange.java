package com.nursing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "care_plan_changes")
public class CarePlanChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long carePlanId;

    @Column(nullable = false)
    private LocalDate changeDate;

    @Column(nullable = false)
    private String changeReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReasonType reasonType;

    @Column(columnDefinition = "TEXT")
    private String beforeSnapshot;

    @Column(columnDefinition = "TEXT")
    private String afterSnapshot;
}
