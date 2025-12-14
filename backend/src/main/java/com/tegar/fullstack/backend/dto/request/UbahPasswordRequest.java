package com.tegar.fullstack.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UbahPasswordRequest {
    
    @NotBlank(message = "Password asli harus diisi")
    private String passwordAsli;
    
    @NotBlank(message = "Password baru harus diisi")
    @Size(min = 6, message = "Password baru minimal 6 karakter")
    private String passwordBaru1;
    
    @NotBlank(message = "Konfirmasi password harus diisi")
    private String passwordBaru2;
}