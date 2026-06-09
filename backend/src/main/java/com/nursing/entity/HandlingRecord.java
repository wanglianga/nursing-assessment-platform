package com.nursing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "handling_records")
public class HandlingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long riskEventId;

    @Column(nullable = false)
    private String handler;

    private String handlerRole;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private LocalDateTime actionTime;

    private String result;
}
