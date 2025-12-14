package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.JenisKelamin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JenisKelaminRepository extends JpaRepository<JenisKelamin, Integer> {
}
