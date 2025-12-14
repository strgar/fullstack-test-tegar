package com.tegar.fullstack.backend.config;

import com.tegar.fullstack.backend.entity.*;
import com.tegar.fullstack.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {
    
    @Bean
    @Transactional
    public CommandLineRunner initData(
            JabatanRepository jabatanRepository,
            DepartemenRepository departemenRepository,
            UnitKerjaRepository unitKerjaRepository,
            PendidikanRepository pendidikanRepository,
            JenisKelaminRepository jenisKelaminRepository,
            StatusAbsenRepository statusAbsenRepository) {
        
        return args -> {
            log.info("Initializing master data...");
            
            // Jenis Kelamin
            if (jenisKelaminRepository.count() == 0) {
                jenisKelaminRepository.save(JenisKelamin.builder().nama("Laki-laki").build());
                jenisKelaminRepository.save(JenisKelamin.builder().nama("Perempuan").build());
            }
            
            // Pendidikan
            if (pendidikanRepository.count() == 0) {
                pendidikanRepository.save(Pendidikan.builder().nama("SD").build());
                pendidikanRepository.save(Pendidikan.builder().nama("SMP").build());
                pendidikanRepository.save(Pendidikan.builder().nama("SMA").build());
                pendidikanRepository.save(Pendidikan.builder().nama("D3").build());
                pendidikanRepository.save(Pendidikan.builder().nama("S1").build());
                pendidikanRepository.save(Pendidikan.builder().nama("S2").build());
                pendidikanRepository.save(Pendidikan.builder().nama("S3").build());
            }
            
            // Departemen
            if (departemenRepository.count() == 0) {
                departemenRepository.save(Departemen.builder().nama("HRD").build());
                departemenRepository.save(Departemen.builder().nama("IT").build());
                departemenRepository.save(Departemen.builder().nama("Finance").build());
                departemenRepository.save(Departemen.builder().nama("Marketing").build());
                departemenRepository.save(Departemen.builder().nama("Operational").build());
            }
            
            // Jabatan
            if (jabatanRepository.count() == 0) {
                jabatanRepository.save(Jabatan.builder().nama("Manager").build());
                jabatanRepository.save(Jabatan.builder().nama("Supervisor").build());
                jabatanRepository.save(Jabatan.builder().nama("Staff").build());
                jabatanRepository.save(Jabatan.builder().nama("Administrasi").build());
                jabatanRepository.save(Jabatan.builder().nama("Operator").build());
            }
            
            // Unit Kerja
            if (unitKerjaRepository.count() == 0) {
                unitKerjaRepository.save(UnitKerja.builder().nama("Head Office").build());
                unitKerjaRepository.save(UnitKerja.builder().nama("Branch Office").build());
                unitKerjaRepository.save(UnitKerja.builder().nama("Site Project").build());
                unitKerjaRepository.save(UnitKerja.builder().nama("Warehouse").build());
            }
            
            // Status Absen
            if (statusAbsenRepository.count() == 0) {
                statusAbsenRepository.save(StatusAbsen.builder().nama("Izin").build());
                statusAbsenRepository.save(StatusAbsen.builder().nama("Sakit").build());
                statusAbsenRepository.save(StatusAbsen.builder().nama("Cuti").build());
                statusAbsenRepository.save(StatusAbsen.builder().nama("Dinas Luar").build());
            }
            
            log.info("Master data initialized successfully");
        };
    }
}