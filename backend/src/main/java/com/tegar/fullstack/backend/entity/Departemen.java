package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "departemen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Departemen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kd_departemen")
    private Integer id;
    
    @Column(name = "nama_departemen", nullable = false, length = 50)
    private String nama;
}