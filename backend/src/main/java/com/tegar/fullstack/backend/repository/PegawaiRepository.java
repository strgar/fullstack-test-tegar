package com.tegar.fullstack.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tegar.fullstack.backend.entity.Departemen;
import com.tegar.fullstack.backend.entity.Pegawai;
import com.tegar.fullstack.backend.entity.User;

public interface PegawaiRepository extends JpaRepository<Pegawai, String> {

    Optional<Pegawai> findByUser(User user);
    List<Pegawai> findByDepartemen(Departemen departemen);

}
