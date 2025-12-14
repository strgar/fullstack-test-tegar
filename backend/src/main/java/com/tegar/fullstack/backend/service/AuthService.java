package com.tegar.fullstack.backend.service;

import com.tegar.fullstack.backend.dto.request.InitDataRequest;
import com.tegar.fullstack.backend.dto.request.LoginRequest;
import com.tegar.fullstack.backend.dto.request.UbahPasswordRequest;
import com.tegar.fullstack.backend.dto.response.LoginResponse;
import com.tegar.fullstack.backend.entity.*;
import com.tegar.fullstack.backend.exception.BusinessException;
import com.tegar.fullstack.backend.repository.*;
import com.tegar.fullstack.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PegawaiRepository pegawaiRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public Map<String, String> initData(InitDataRequest request) {

        if (userRepository.count() > 0) {
            throw new BusinessException(501, "Data sudah diinisialisasi");
        }

        String rawPassword = generateRandomPassword();
        String email = generateAdminEmail(request.getPerusahaan());

        User admin = new User();
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(rawPassword));
        admin.setProfile("ADMIN");
        admin.setNamaAdmin(request.getNamaAdmin());
        admin.setPerusahaan(request.getPerusahaan());
        admin.setActive(true);
        admin.setCreatedAtEpoch(Instant.now().getEpochSecond());

        userRepository.saveAndFlush(admin);

        Pegawai pegawai = new Pegawai();
        pegawai.setUser(admin);
        pegawai.setNamaLengkap(request.getNamaAdmin());
        pegawai.setCreatedAtEpoch(Instant.now().getEpochSecond());

        pegawaiRepository.saveAndFlush(pegawai);

        return Map.of(
                "email", email,
                "password", rawPassword,
                "profile", "ADMIN");
    }

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BusinessException(401, "User tidak ditemukan"));

            user.setLastLoginEpoch(Instant.now().getEpochSecond());
            userRepository.save(user);

            Pegawai pegawai = pegawaiRepository.findByUser(user)
                    .orElseThrow(() -> new BusinessException(501, "Data pegawai tidak ditemukan"));

            String token = jwtTokenProvider.generateToken(user);

            LoginResponse.Info info = buildUserInfo(user, pegawai);

            return LoginResponse.builder()
                    .hasil(LoginResponse.Hasil.builder()
                            .token(token)
                            .info(info)
                            .build())
                    .build();

        } catch (Exception e) {
            throw new BusinessException(501, "Email atau password salah");
        }
    }

    public void ubahPasswordSendiri(UbahPasswordRequest request, String currentEmail) {
        if (!request.getPasswordBaru1().equals(request.getPasswordBaru2())) {
            throw new BusinessException(501, "Password baru tidak sama");
        }

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new BusinessException(501, "User tidak ditemukan"));

        if (!passwordEncoder.matches(request.getPasswordAsli(), user.getPassword())) {
            throw new BusinessException(501, "Password asli salah");
        }

        user.setPassword(passwordEncoder.encode(request.getPasswordBaru1()));
        userRepository.save(user);
    }

    private String generateAdminEmail(String perusahaan) {
        String clean = perusahaan.toLowerCase()
                .replaceAll("[^a-z0-9]", "")
                .replaceAll("\\s+", "");
        return "admin@" + clean + ".com";
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private LoginResponse.Info buildUserInfo(User user, Pegawai pegawai) {
        return LoginResponse.Info.builder()
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