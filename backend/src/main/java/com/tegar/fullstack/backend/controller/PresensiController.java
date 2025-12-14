package com.tegar.fullstack.backend.controller;

import com.tegar.fullstack.backend.dto.response.ComboResponse;
import com.tegar.fullstack.backend.dto.response.PresensiResponse;
import com.tegar.fullstack.backend.exception.BusinessException;
import com.tegar.fullstack.backend.service.PresensiService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/presensi")
@RequiredArgsConstructor
public class PresensiController {

    private final PresensiService presensiService;

    @GetMapping("/combo/status-absen")
    public ResponseEntity<?> comboStatusAbsen(
            @RequestParam Long tglAwal,
            @RequestParam Long tglAkhir) {

        try {
            List<ComboResponse> result = presensiService.getComboStatusAbsen(tglAwal, tglAkhir);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(501).body(List.of());
        }
    }

    @GetMapping("/daftar/admin")
    public ResponseEntity<?> daftarPresensiAdmin(
            @RequestParam Long tglAwal,
            @RequestParam Long tglAkhir,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized");
        }

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        if (!role.equals("ADMIN") && !role.equals("HRD")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Akses ditolak");
        }

        List<PresensiResponse> result = presensiService.getDaftarPresensiAdmin(tglAwal, tglAkhir);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/daftar/pegawai")
    public ResponseEntity<?> daftarPresensiPegawai(
            @RequestParam Long tglAwal,
            @RequestParam Long tglAkhir,
            Authentication authentication) {

        try {
            String userId = authentication.getName().split("\\|")[0];

            List<PresensiResponse> result = presensiService.getDaftarPresensiPegawai(userId, tglAwal, tglAkhir);
            return ResponseEntity.ok(result);

        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", "Gagal mengambil data presensi"));
        }
    }

    @GetMapping("/in")
    public ResponseEntity<?> checkIn(Authentication authentication) {
        try {
            String userId = authentication.getName().split("\\|")[0];
            String jamMasuk = presensiService.checkIn(userId);
            return ResponseEntity.ok(Map.of("jamMasuk", jamMasuk));

        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", "Gagal check in"));
        }
    }

    @GetMapping("/out")
    public ResponseEntity<?> checkOut(Authentication authentication) {
        try {
            String userId = authentication.getName().split("\\|")[0];
            String jamKeluar = presensiService.checkOut(userId);
            return ResponseEntity.ok(Map.of("jamKeluar", jamKeluar));

        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", "Gagal check out"));
        }
    }

    @PostMapping("/absen")
    public ResponseEntity<?> absen(
            @RequestParam Long tglAbsensi,
            @RequestParam Integer kdStatus,
            Authentication authentication) {

        try {
            String userId = authentication.getName().split("\\|")[0];
            presensiService.absen(userId, tglAbsensi, kdStatus);
            return ResponseEntity.ok(Map.of("message", "Absen berhasil dicatat"));

        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                    "status", 501,
                    "message", "Gagal mencatat absen"));
        }
    }
}