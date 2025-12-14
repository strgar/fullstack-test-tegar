package com.tegar.fullstack.backend.controller;

import com.tegar.fullstack.backend.dto.request.InitDataRequest;
import com.tegar.fullstack.backend.dto.request.LoginRequest;
import com.tegar.fullstack.backend.dto.request.UbahPasswordRequest;
import com.tegar.fullstack.backend.dto.response.LoginResponse;
import com.tegar.fullstack.backend.exception.BusinessException;
import com.tegar.fullstack.backend.repository.UserRepository;
import com.tegar.fullstack.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/init-data")
    public ResponseEntity<?> initData(@Valid @RequestBody InitDataRequest request) {
        Map<String, String> result = authService.initData(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(Map.of("hasil", response.getHasil()));
        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", "Login gagal"));
        }
    }

    @PostMapping("/ubah-password-sendiri")
    public ResponseEntity<?> ubahPasswordSendiri(
            @RequestParam String passwordAsli,
            @RequestParam String passwordBaru1,
            @RequestParam String passwordBaru2,
            Authentication authentication) {

        try {
            String currentEmail = authentication.getName().split("\\|")[0];

            UbahPasswordRequest request = UbahPasswordRequest.builder()
                    .passwordAsli(passwordAsli)
                    .passwordBaru1(passwordBaru1)
                    .passwordBaru2(passwordBaru2)
                    .build();

            authService.ubahPasswordSendiri(request, currentEmail);

            return ResponseEntity.ok(Map.of("message", "Password berhasil diubah"));

        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", "Gagal mengubah password"));
        }
    }

    @GetMapping("/check-init")
    public ResponseEntity<?> checkInit() {
        boolean initialized = userRepository.count() > 0;
        return ResponseEntity.ok(Map.of("initialized", initialized));
    }

}
