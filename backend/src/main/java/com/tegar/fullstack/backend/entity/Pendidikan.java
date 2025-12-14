package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "pendidikan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pendidikan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kd_pendidikan")
    private Integer id;
    
    @Column(name = "nama_pendidikan", nullable = false, length = 50)
    private String nama;
}