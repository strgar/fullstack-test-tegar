package com.tegar.fullstack.backend.repository;

import com.tegar.fullstack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailAndProfile(String email, String profile);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
