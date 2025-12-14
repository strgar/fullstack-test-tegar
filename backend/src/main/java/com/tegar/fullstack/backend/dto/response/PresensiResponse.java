package com.tegar.fullstack.backend.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PresensiResponse {
    private String idUser;
    private String namaLengkap;
    private Long tglAbsensi;
    private String jamMasuk;
    private String jamKeluar;
    private String namaStatus;
}
