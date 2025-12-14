package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "presensi")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Presensi {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    private Pegawai pegawai;
    
    @Column(name = "tgl_absensi", nullable = false)
    private Long tglAbsensi; // epoch seconds
    
    @Column(name = "jam_masuk", length = 8)
    private String jamMasuk; // HH:mm:ss
    
    @Column(name = "jam_keluar", length = 8)
    private String jamKeluar; // HH:mm:ss
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kd_status")
    private StatusAbsen statusAbsen;
    
    @Column(name = "created_at_epoch")
    @Builder.Default
    private Long createdAtEpoch = Instant.now().getEpochSecond();
}
