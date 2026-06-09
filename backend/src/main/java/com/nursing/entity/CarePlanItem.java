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
@Table(name = "care_plan_items")
public class CarePlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long carePlanId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CareItemType type;

    @Column(nullable = false)
    private String frequency;

    private String description;

    @Column(nullable = false)
    private Boolean isActive = true;

    private LocalDate effectiveDate;

    private LocalDate expiryDate;
}
