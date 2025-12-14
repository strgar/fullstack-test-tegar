package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.UnitKerja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnitKerjaRepository extends JpaRepository<UnitKerja, Integer> {
}
