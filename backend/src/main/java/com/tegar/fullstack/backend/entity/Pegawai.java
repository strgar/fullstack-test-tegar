package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "pegawai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pegawai {

    @Id
    @Column(name = "id_user", length = 20)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_user")
    private User user;

    @Column(name = "nama_lengkap", nullable = false, length = 100)
    private String namaLengkap;

    @Column(name = "tempat_lahir", length = 50)
    private String tempatLahir;

    @Column(name = "tanggal_lahir")
    private Long tanggalLahir;

    @Column(name = "nik_user", unique = true, length = 20)
    private String nikUser;

    @Column(name = "photo", length = 255)
    private String photo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kd_jabatan")
    private Jabatan jabatan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kd_departemen")
    private Departemen departemen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kd_unit_kerja")
    private UnitKerja unitKerja;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kd_jenis_kelamin")
    private JenisKelamin jenisKelamin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kd_pendidikan")
    private Pendidikan pendidikan;

    @Column(name = "created_at_epoch")
    @Builder.Default
    private Long createdAtEpoch = Instant.now().getEpochSecond();

    @Column(name = "updated_at_epoch")
    private Long updatedAtEpoch;

    @PreUpdate
    public void preUpdate() {
        updatedAtEpoch = Instant.now().getEpochSecond();
    }
}