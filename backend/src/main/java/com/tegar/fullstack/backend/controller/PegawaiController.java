package com.tegar.fullstack.backend.controller;

import com.tegar.fullstack.backend.dto.request.TambahPegawaiRequest;
import com.tegar.fullstack.backend.dto.request.UbahPegawaiRequest;
import com.tegar.fullstack.backend.dto.response.ComboResponse;
import com.tegar.fullstack.backend.dto.response.PegawaiResponse;
import com.tegar.fullstack.backend.exception.BusinessException;
import com.tegar.fullstack.backend.service.PegawaiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pegawai")
@RequiredArgsConstructor
public class PegawaiController {
    
    private final PegawaiService pegawaiService;
    
    private static final String UPLOAD_DIR = "./uploads/";
    
    // ========== COMBO ENDPOINTS ==========
    
    @GetMapping("/combo/jabatan")
    public ResponseEntity<?> comboJabatan() {
        try {
            List<ComboResponse> result = pegawaiService.getComboJabatan();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(501).body(List.of());
        }
    }
    
    @GetMapping("/combo/departemen")
    public ResponseEntity<?> comboDepartemen() {
        try {
            List<ComboResponse> result = pegawaiService.getComboDepartemen();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(501).body(List.of());
        }
    }
    
    @GetMapping("/combo/unit-kerja")
    public ResponseEntity<?> comboUnitKerja() {
        try {
            List<ComboResponse> result = pegawaiService.getComboUnitKerja();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(501).body(List.of());
        }
    }
    
    @GetMapping("/combo/pendidikan")
    public ResponseEntity<?> comboPendidikan() {
        try {
            List<ComboResponse> result = pegawaiService.getComboPendidikan();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(501).body(List.of());
        }
    }
    
    @GetMapping("/combo/jenis-kelamin")
    public ResponseEntity<?> comboJenisKelamin() {
        try {
            List<ComboResponse> result = pegawaiService.getComboJenisKelamin();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(501).body(List.of());
        }
    }
    
    @GetMapping("/combo/departemen-hrd")
    public ResponseEntity<?> comboDepartemenHrd() {
        try {
            List<Object[]> result = pegawaiService.getComboDepartemenHrd();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(501).body(List.of());
        }
    }
    
    // ========== PEGAWAI ENDPOINTS ==========
    
    @GetMapping("/daftar")
    public ResponseEntity<?> daftarPegawai(Authentication authentication) {
        try {
            String profile = authentication.getAuthorities().iterator().next().getAuthority();
            if (!profile.equals("ADMIN") && !profile.equals("HRD")) {
                return ResponseEntity.status(403).body(Map.of(
                    "status", 403,
                    "message", "Akses ditolak"
                ));
            }
            
            List<PegawaiResponse> result = pegawaiService.getAllPegawai();
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", "Gagal mengambil data pegawai"
            ));
        }
    }
    
    @PostMapping("/admin-tambah-pegawai")
    public ResponseEntity<?> adminTambahPegawai(
            @Valid @RequestBody TambahPegawaiRequest request,
            Authentication authentication) {
        
        try {
            String profile = authentication.getAuthorities().iterator().next().getAuthority();
            if (!profile.equals("ADMIN") && !profile.equals("HRD")) {
                return ResponseEntity.status(403).body(Map.of(
                    "status", 403,
                    "message", "Akses ditolak"
                ));
            }
            
            pegawaiService.tambahPegawai(request);
            return ResponseEntity.ok(Map.of("message", "Pegawai berhasil ditambahkan"));
            
        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", "Gagal menambahkan pegawai"
            ));
        }
    }
    
    @PostMapping("/admin-ubah-pegawai")
    public ResponseEntity<?> adminUbahPegawai(
            @RequestParam String idUser,
            @Valid @RequestBody UbahPegawaiRequest request,
            Authentication authentication) {
        
        try {
            String profile = authentication.getAuthorities().iterator().next().getAuthority();
            if (!profile.equals("ADMIN") && !profile.equals("HRD")) {
                return ResponseEntity.status(403).body(Map.of(
                    "status", 403,
                    "message", "Akses ditolak"
                ));
            }
            
            pegawaiService.ubahPegawai(idUser, request);
            return ResponseEntity.ok(Map.of("message", "Pegawai berhasil diubah"));
            
        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", "Gagal mengubah pegawai"
            ));
        }
    }
    
    @PostMapping("/admin-ubah-photo")
    public ResponseEntity<?> adminUbahPhoto(
            @RequestParam String idUser,
            @RequestParam("files") MultipartFile file) {
        
        try {
            // Validasi file
            if (file.isEmpty()) {
                throw new BusinessException(501, "File tidak boleh kosong");
            }
            
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            
            if (!fileExtension.matches("\\.(jpg|jpeg|png|gif)$")) {
                throw new BusinessException(501, "Format file tidak didukung");
            }
            
            // Buat directory jika belum ada
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // Generate nama file unik
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            
            // Simpan file
            Files.copy(file.getInputStream(), filePath);
            
            // Update photo di database
            pegawaiService.ubahPhotoPegawai(idUser, fileName);
            
            return ResponseEntity.ok(Map.of(
                "message", "Foto berhasil diubah",
                "fileName", fileName
            ));
            
        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", "Gagal menyimpan file"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", "Gagal mengubah foto"
            ));
        }
    }
    
    @PostMapping("/ubah-photo")
    public ResponseEntity<?> ubahPhoto(
            @RequestParam("files") MultipartFile file,
            Authentication authentication) {
        
        try {
            String userId = authentication.getName().split("\\|")[0];
            
            // Validasi file
            if (file.isEmpty()) {
                throw new BusinessException(501, "File tidak boleh kosong");
            }
            
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            
            if (!fileExtension.matches("\\.(jpg|jpeg|png|gif)$")) {
                throw new BusinessException(501, "Format file tidak didukung");
            }
            
            // Buat directory jika belum ada
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // Generate nama file unik
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            
            // Simpan file
            Files.copy(file.getInputStream(), filePath);
            
            // Update photo di database
            pegawaiService.ubahPhotoSendiri(userId, fileName);
            
            return ResponseEntity.ok(Map.of(
                "message", "Foto berhasil diubah",
                "fileName", fileName
            ));
            
        } catch (BusinessException e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", "Gagal menyimpan file"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(501).body(Map.of(
                "status", 501,
                "message", "Gagal mengubah foto"
            ));
        }
    }
}
