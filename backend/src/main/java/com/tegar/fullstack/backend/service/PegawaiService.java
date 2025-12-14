package com.tegar.fullstack.backend.service;

import com.tegar.fullstack.backend.dto.request.TambahPegawaiRequest;
import com.tegar.fullstack.backend.dto.request.UbahPegawaiRequest;
import com.tegar.fullstack.backend.dto.response.ComboResponse;
import com.tegar.fullstack.backend.dto.response.PegawaiResponse;
import com.tegar.fullstack.backend.entity.*;
import com.tegar.fullstack.backend.exception.BusinessException;
import com.tegar.fullstack.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PegawaiService {
    
    private final PegawaiRepository pegawaiRepository;
    private final UserRepository userRepository;
    private final JabatanRepository jabatanRepository;
    private final DepartemenRepository departemenRepository;
    private final UnitKerjaRepository unitKerjaRepository;
    private final PendidikanRepository pendidikanRepository;
    private final JenisKelaminRepository jenisKelaminRepository;
    private final PasswordEncoder passwordEncoder;
    
    // ========== COMBO METHODS ==========
    
    public List<ComboResponse> getComboJabatan() {
        return jabatanRepository.findAll().stream()
                .map(j -> ComboResponse.builder()
                        .kode(j.getId())
                        .nama(j.getNama())
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<ComboResponse> getComboDepartemen() {
        return departemenRepository.findAll().stream()
                .map(d -> ComboResponse.builder()
                        .kode(d.getId())
                        .nama(d.getNama())
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<ComboResponse> getComboUnitKerja() {
        return unitKerjaRepository.findAll().stream()
                .map(u -> ComboResponse.builder()
                        .kode(u.getId())
                        .nama(u.getNama())
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<ComboResponse> getComboPendidikan() {
        return pendidikanRepository.findAll().stream()
                .map(p -> ComboResponse.builder()
                        .kode(p.getId())
                        .nama(p.getNama())
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<ComboResponse> getComboJenisKelamin() {
        return jenisKelaminRepository.findAll().stream()
                .map(jk -> ComboResponse.builder()
                        .kode(jk.getId())
                        .nama(jk.getNama())
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<Object[]> getComboDepartemenHrd() {
        // Mendapatkan pegawai di departemen HRD
        Departemen hrd = departemenRepository.findByNama("HRD")
                .orElseThrow(() -> new BusinessException(501, "Departemen HRD tidak ditemukan"));
        
        return pegawaiRepository.findByDepartemen(hrd).stream()
                .map(p -> new Object[]{
                    p.getNamaLengkap(),
                    p.getJabatan() != null ? p.getJabatan().getId() : null,
                    p.getJabatan() != null ? p.getJabatan().getNama() : null
                })
                .collect(Collectors.toList());
    }
    
    // ========== PEGAWAI CRUD ==========
    
    public List<PegawaiResponse> getAllPegawai() {
        return pegawaiRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public void tambahPegawai(TambahPegawaiRequest request) {
        // Validasi
        if (!request.getPassword().equals(request.getPasswordC())) {
            throw new BusinessException(501, "Password tidak sama");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(501, "Email sudah terdaftar");
        }
        
        // Generate ID
        String userId = "USR" + String.format("%03d", userRepository.count() + 1);
        
        // Create User
        User user = User.builder()
                .id(userId)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .profile("PEGAWAI")
                .active(true)
                .createdAtEpoch(Instant.now().getEpochSecond())
                .build();
        
        userRepository.save(user);
        
        // Get master data
        Jabatan jabatan = jabatanRepository.findById(request.getKdJabatan())
                .orElseThrow(() -> new BusinessException(501, "Jabatan tidak ditemukan"));
        
        Departemen departemen = departemenRepository.findById(request.getKdDepartemen())
                .orElseThrow(() -> new BusinessException(501, "Departemen tidak ditemukan"));
        
        UnitKerja unitKerja = unitKerjaRepository.findById(request.getKdUnitKerja())
                .orElseThrow(() -> new BusinessException(501, "Unit kerja tidak ditemukan"));
        
        Pendidikan pendidikan = pendidikanRepository.findById(request.getKdPendidikan())
                .orElseThrow(() -> new BusinessException(501, "Pendidikan tidak ditemukan"));
        
        JenisKelamin jenisKelamin = jenisKelaminRepository.findById(request.getKdJenisKelamin())
                .orElseThrow(() -> new BusinessException(501, "Jenis kelamin tidak ditemukan"));
        
        // Create Pegawai
        Pegawai pegawai = Pegawai.builder()
                .id(userId)
                .user(user)
                .namaLengkap(request.getNamaLengkap())
                .tempatLahir(request.getTempatLahir())
                .tanggalLahir(request.getTanggalLahir())
                .nikUser(request.getNikUser())
                .jabatan(jabatan)
                .departemen(departemen)
                .unitKerja(unitKerja)
                .pendidikan(pendidikan)
                .jenisKelamin(jenisKelamin)
                .createdAtEpoch(Instant.now().getEpochSecond())
                .build();
        
        pegawaiRepository.save(pegawai);
    }
    
    public void ubahPegawai(String idUser, UbahPegawaiRequest request) {
        Pegawai pegawai = pegawaiRepository.findById(idUser)
                .orElseThrow(() -> new BusinessException(501, "Pegawai tidak ditemukan"));
        
        User user = pegawai.getUser();
        
        // Update user jika email berubah
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException(501, "Email sudah digunakan");
            }
            user.setEmail(request.getEmail());
        }
        
        // Update password jika diisi
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (!request.getPassword().equals(request.getPasswordC())) {
                throw new BusinessException(501, "Password tidak sama");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        userRepository.save(user);
        
        // Update pegawai
        pegawai.setNamaLengkap(request.getNamaLengkap());
        pegawai.setTempatLahir(request.getTempatLahir());
        pegawai.setTanggalLahir(request.getTanggalLahir());
        pegawai.setNikUser(request.getNikUser());
        
        // Update master data
        pegawai.setJabatan(jabatanRepository.findById(request.getKdJabatan())
                .orElseThrow(() -> new BusinessException(501, "Jabatan tidak ditemukan")));
        
        pegawai.setDepartemen(departemenRepository.findById(request.getKdDepartemen())
                .orElseThrow(() -> new BusinessException(501, "Departemen tidak ditemukan")));
        
        pegawai.setUnitKerja(unitKerjaRepository.findById(request.getKdUnitKerja())
                .orElseThrow(() -> new BusinessException(501, "Unit kerja tidak ditemukan")));
        
        pegawai.setPendidikan(pendidikanRepository.findById(request.getKdPendidikan())
                .orElseThrow(() -> new BusinessException(501, "Pendidikan tidak ditemukan")));
        
        pegawai.setJenisKelamin(jenisKelaminRepository.findById(request.getKdJenisKelamin())
                .orElseThrow(() -> new BusinessException(501, "Jenis kelamin tidak ditemukan")));
        
        pegawai.setUpdatedAtEpoch(Instant.now().getEpochSecond());
        
        pegawaiRepository.save(pegawai);
    }
    
    public void ubahPhotoPegawai(String idUser, String fileName) {
        Pegawai pegawai = pegawaiRepository.findById(idUser)
                .orElseThrow(() -> new BusinessException(501, "Pegawai tidak ditemukan"));
        
        pegawai.setPhoto(fileName);
        pegawai.setUpdatedAtEpoch(Instant.now().getEpochSecond());
        
        pegawaiRepository.save(pegawai);
    }
    
    public void ubahPhotoSendiri(String currentUserId, String fileName) {
        Pegawai pegawai = pegawaiRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(501, "Pegawai tidak ditemukan"));
        
        pegawai.setPhoto(fileName);
        pegawai.setUpdatedAtEpoch(Instant.now().getEpochSecond());
        
        pegawaiRepository.save(pegawai);
    }
    
    private PegawaiResponse convertToResponse(Pegawai pegawai) {
        User user = pegawai.getUser();
        
        return PegawaiResponse.builder()
                .profile(user.getProfile())
                .idUser(user.getId())
                .namaLengkap(pegawai.getNamaLengkap())
                .tempatLahir(pegawai.getTempatLahir())
                .tanggalLahir(pegawai.getTanggalLahir())
                .email(user.getEmail())
                .nikUser(pegawai.getNikUser())
                .kdJabatan(pegawai.getJabatan() != null ? pegawai.getJabatan().getId() : null)
                .namaJabatan(pegawai.getJabatan() != null ? pegawai.getJabatan().getNama() : null)
                .kdDepartemen(pegawai.getDepartemen() != null ? pegawai.getDepartemen().getId() : null)
                .namaDepartemen(pegawai.getDepartemen() != null ? pegawai.getDepartemen().getNama() : null)
                .kdUnitKerja(pegawai.getUnitKerja() != null ? pegawai.getUnitKerja().getId() : null)
                .namaUnitKerja(pegawai.getUnitKerja() != null ? pegawai.getUnitKerja().getNama() : null)
                .kdJenisKelamin(pegawai.getJenisKelamin() != null ? pegawai.getJenisKelamin().getId() : null)
                .namaJenisKelamin(pegawai.getJenisKelamin() != null ? pegawai.getJenisKelamin().getNama() : null)
                .kdPendidikan(pegawai.getPendidikan() != null ? pegawai.getPendidikan().getId() : null)
                .namaPendidikan(pegawai.getPendidikan() != null ? pegawai.getPendidikan().getNama() : null)
                .photo(pegawai.getPhoto())
                .build();
    }
}