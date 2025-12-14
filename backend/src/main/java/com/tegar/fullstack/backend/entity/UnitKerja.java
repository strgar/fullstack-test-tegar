package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "unit_kerja")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UnitKerja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kd_unit_kerja")
    private Integer id;
    
    @Column(name = "nama_unit_kerja", nullable = false, length = 50)
    private String nama;
}