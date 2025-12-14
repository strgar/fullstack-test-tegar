package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.Departemen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartemenRepository extends JpaRepository<Departemen, Integer> {
    Optional<Departemen> findByNama(String nama);
}
