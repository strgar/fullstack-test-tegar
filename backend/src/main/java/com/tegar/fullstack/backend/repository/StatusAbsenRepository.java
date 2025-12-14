package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.StatusAbsen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatusAbsenRepository extends JpaRepository<StatusAbsen, Integer> {
}
