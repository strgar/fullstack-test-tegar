package com.tegar.fullstack.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InitDataRequest {
    
    @NotBlank(message = "Nama admin harus diisi")
    @Size(min = 3, max = 100, message = "Nama admin 3-100 karakter")
    private String namaAdmin;
    
    @NotBlank(message = "Nama perusahaan harus diisi")
    @Size(min = 2, max = 100, message = "Nama perusahaan 2-100 karakter")
    private String perusahaan;
}