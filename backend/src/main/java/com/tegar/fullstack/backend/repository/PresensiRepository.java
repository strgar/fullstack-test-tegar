package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.Pegawai;
import com.tegar.fullstack.backend.entity.Presensi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresensiRepository extends JpaRepository<Presensi, Long> {
    
    Presensi findByPegawaiAndTglAbsensi(Pegawai pegawai, Long tglAbsensi);
    
    List<Presensi> findByPegawaiAndTglAbsensiBetween(Pegawai pegawai, Long tglAwal, Long tglAkhir);
    
    @Query("SELECT p FROM Presensi p WHERE p.tglAbsensi BETWEEN :tglAwal AND :tglAkhir")
    List<Presensi> findByTglAbsensiBetween(Long tglAwal, Long tglAkhir);
}
