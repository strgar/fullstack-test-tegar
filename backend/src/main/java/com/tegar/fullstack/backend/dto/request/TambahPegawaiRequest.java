package com.tegar.fullstack.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TambahPegawaiRequest {
    
    @NotBlank(message = "Nama lengkap harus diisi")
    private String namaLengkap;
    
    @NotBlank(message = "Email harus diisi")
    @Email(message = "Format email tidak valid")
    private String email;
    
    @NotBlank(message = "Tempat lahir harus diisi")
    private String tempatLahir;
    
    @NotNull(message = "Tanggal lahir harus diisi")
    private Long tanggalLahir;
    
    @NotNull(message = "Jenis kelamin harus diisi")
    private Integer kdJenisKelamin;
    
    @NotNull(message = "Pendidikan harus diisi")
    private Integer kdPendidikan;
    
    @NotNull(message = "Jabatan harus diisi")
    private Integer kdJabatan;
    
    @NotNull(message = "Departemen harus diisi")
    private Integer kdDepartemen;
    
    @NotNull(message = "Unit kerja harus diisi")
    private Integer kdUnitKerja;
    
    @NotBlank(message = "Password harus diisi")
    @Size(min = 6, message = "Password minimal 6 karakter")
    private String password;
    
    @NotBlank(message = "Konfirmasi password harus diisi")
    private String passwordC;
    
    private String nikUser;
}
