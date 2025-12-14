package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "jenis_kelamin")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JenisKelamin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kd_jenis_kelamin")
    private Integer id;
    
    @Column(name = "nama_jenis_kelamin", nullable = false, length = 10)
    private String nama;
}