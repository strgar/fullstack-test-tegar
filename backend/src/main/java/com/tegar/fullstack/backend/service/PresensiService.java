package com.tegar.fullstack.backend.service;

import com.tegar.fullstack.backend.dto.response.ComboResponse;
import com.tegar.fullstack.backend.dto.response.PresensiResponse;
import com.tegar.fullstack.backend.entity.*;
import com.tegar.fullstack.backend.exception.BusinessException;
import com.tegar.fullstack.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PresensiService {
    
    private final PresensiRepository presensiRepository;
    private final PegawaiRepository pegawaiRepository;
    private final StatusAbsenRepository statusAbsenRepository;
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
    
    public List<ComboResponse> getComboStatusAbsen(Long tglAwal, Long tglAkhir) {
        return statusAbsenRepository.findAll().stream()
                .map(s -> ComboResponse.builder()
                        .kode(s.getId())
                        .nama(s.getNama())
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<PresensiResponse> getDaftarPresensiAdmin(Long tglAwal, Long tglAkhir) {
        return presensiRepository.findByTglAbsensiBetween(tglAwal, tglAkhir).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<PresensiResponse> getDaftarPresensiPegawai(String userId, Long tglAwal, Long tglAkhir) {
        Pegawai pegawai = pegawaiRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(501, "Pegawai tidak ditemukan"));
        
        return presensiRepository.findByPegawaiAndTglAbsensiBetween(pegawai, tglAwal, tglAkhir).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public String checkIn(String userId) {
        Pegawai pegawai = pegawaiRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(501, "Pegawai tidak ditemukan"));
        
        Long todayEpoch = getTodayEpoch();
        
        // Cek apakah sudah check in hari ini
        Presensi existing = presensiRepository.findByPegawaiAndTglAbsensi(pegawai, todayEpoch);
        if (existing != null && existing.getJamMasuk() != null) {
            throw new BusinessException(501, "Sudah check in hari ini");
        }
        
        String jamMasuk = getCurrentTime();
        
        if (existing == null) {
            // Buat presensi baru
            Presensi presensi = Presensi.builder()
                    .pegawai(pegawai)
                    .tglAbsensi(todayEpoch)
                    .jamMasuk(jamMasuk)
                    .createdAtEpoch(Instant.now().getEpochSecond())
                    .build();
            presensiRepository.save(presensi);
        } else {
            // Update jam masuk
            existing.setJamMasuk(jamMasuk);
            presensiRepository.save(existing);
        }
        
        return jamMasuk;
    }
    
    public String checkOut(String userId) {
        Pegawai pegawai = pegawaiRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(501, "Pegawai tidak ditemukan"));
        
        Long todayEpoch = getTodayEpoch();
        
        Presensi presensi = presensiRepository.findByPegawaiAndTglAbsensi(pegawai, todayEpoch);
        if (presensi == null || presensi.getJamMasuk() == null) {
            throw new BusinessException(501, "Belum check in hari ini");
        }
        
        if (presensi.getJamKeluar() != null) {
            throw new BusinessException(501, "Sudah check out hari ini");
        }
        
        String jamKeluar = getCurrentTime();
        presensi.setJamKeluar(jamKeluar);
        presensiRepository.save(presensi);
        
        return jamKeluar;
    }
    
    public void absen(String userId, Long tglAbsensi, Integer kdStatus) {
        Pegawai pegawai = pegawaiRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(501, "Pegawai tidak ditemukan"));
        
        StatusAbsen status = statusAbsenRepository.findById(kdStatus)
                .orElseThrow(() -> new BusinessException(501, "Status absen tidak ditemukan"));
        
        // Cek apakah sudah ada presensi di tanggal tersebut
        Presensi existing = presensiRepository.findByPegawaiAndTglAbsensi(pegawai, tglAbsensi);
        if (existing != null) {
            existing.setStatusAbsen(status);
            presensiRepository.save(existing);
        } else {
            Presensi presensi = Presensi.builder()
                    .pegawai(pegawai)
                    .tglAbsensi(tglAbsensi)
                    .statusAbsen(status)
                    .createdAtEpoch(Instant.now().getEpochSecond())
                    .build();
            presensiRepository.save(presensi);
        }
    }
    
    private Long getTodayEpoch() {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfDay = today.withHour(0).withMinute(0).withSecond(0).withNano(0);
        return startOfDay.atZone(ZoneId.systemDefault()).toEpochSecond();
    }
    
    private String getCurrentTime() {
        return LocalDateTime.now().format(timeFormatter);
    }
    
    private PresensiResponse convertToResponse(Presensi presensi) {
        return PresensiResponse.builder()
                .idUser(presensi.getPegawai().getId())
                .namaLengkap(presensi.getPegawai().getNamaLengkap())
                .tglAbsensi(presensi.getTglAbsensi())
                .jamMasuk(presensi.getJamMasuk())
                .jamKeluar(presensi.getJamKeluar())
                .namaStatus(presensi.getStatusAbsen() != null ? presensi.getStatusAbsen().getNama() : null)
                .build();
    }
}
