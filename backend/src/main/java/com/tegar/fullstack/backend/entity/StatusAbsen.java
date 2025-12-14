package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "status_absen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusAbsen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kd_status")
    private Integer id;
    
    @Column(name = "nama_status", nullable = false, length = 50)
    private String nama;
}