package com.tegar.fullstack.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_user", updatable = false, nullable = false)
    private String id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 20)
    private String profile;

    @Column(name = "nama_admin", length = 100)
    private String namaAdmin;

    @Column(length = 100)
    private String perusahaan;

    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "created_at_epoch")
    private Long createdAtEpoch = Instant.now().getEpochSecond();

    @Column(name = "last_login_epoch")
    private Long lastLoginEpoch;

    // 🔥 PARENT → CHILD (PEGawai ikut tersimpan)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Pegawai pegawai;
}
