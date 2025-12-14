package com.tegar.fullstack.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginRequest {
    
    @NotBlank(message = "Email harus diisi")
    @Email(message = "Format email tidak valid")
    private String email;
    
    @NotBlank(message = "Password harus diisi")
    private String password;
    
    @NotBlank(message = "Profile harus diisi")
    private String profile; // ADMIN, HRD, PEGAWAI
}
