package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.Pendidikan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PendidikanRepository extends JpaRepository<Pendidikan, Integer> {
}
