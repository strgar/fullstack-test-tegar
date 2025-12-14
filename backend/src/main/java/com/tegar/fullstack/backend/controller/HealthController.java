package com.tegar.fullstack.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {
    
    @GetMapping("/")
    public ResponseEntity<?> root() {
        return ResponseEntity.ok(Map.of(
            "message", "HR System API is running",
            "status", "OK"
        ));
    }
    
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "hr-system-backend",
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    @GetMapping("/api/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "API is working",
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    @GetMapping("/api/auth/test")
    public ResponseEntity<?> authTest() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Auth endpoint is working",
            "timestamp", System.currentTimeMillis()
        ));
    }
}