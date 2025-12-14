package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.Jabatan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JabatanRepository extends JpaRepository<Jabatan, Integer> {
}