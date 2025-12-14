package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "jabatan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Jabatan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kd_jabatan")
    private Integer id;
    
    @Column(name = "nama_jabatan", nullable = false, length = 50)
    private String nama;
}

