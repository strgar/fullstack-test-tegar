// ProfilePage.js - User Profile Page
import AuthService from '../services/auth.service.js';
import { PegawaiAPI } from '../api/pegawai.api.js';
import { AuthAPI } from '../api/auth.api.js';
import Loading from '../components/Loading.js';
import Modal from '../components/Modal.js';
import Alert from '../components/Alert.js';
import { formatDate, getInitials } from '../utils/formatters.js';
import { validateEmail, validateRequired } from '../utils/validators.js';

class ProfilePage {
    constructor() {
        this.user = AuthService.getUser();
        this.profileData = null;
    }

    async init() {
        await this.loadProfileData();
        this.render();
        this.bindEvents();
    }

    async loadProfileData() {
        Loading.show('Memuat data profil...');
        
        try {
            // Get employee details from the list
            const employees = await PegawaiAPI.getAllPegawai();
            this.profileData = employees.find(emp => emp.idUser === this.user.idUser) || this.user;
        } catch (error) {
            console.error('Error loading profile:', error);
            this.profileData = this.user;
        } finally {
            Loading.hide();
        }
    }

    render() {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;
        
        pageContainer.innerHTML = `
            <div class="fade-in">
                <!-- Page Header -->
                <div class="mb-4">
                    <h2 class="mb-1">Profile</h2>
                    <p class="text-muted mb-0">Kelola informasi akun Anda</p>
                </div>
                
                <div class="row">
                    <!-- Left Column: Profile Info -->
                    <div class="col-md-4">
                        <!-- Profile Card -->
                        <div class="card card-custom mb-4">
                            <div class="card-body-custom text-center">
                                <!-- Profile Photo -->
                                <div class="mb-4">
                                    <div class="position-relative mx-auto" style="width: 150px; height: 150px;">
                                        ${this.profileData?.photo ? `
                                            <img src="./uploads/${this.profileData.photo}" 
                                                 class="rounded-circle border border-4 border-primary"
                                                 style="width: 150px; height: 150px; object-fit: cover;"
                                                 id="profilePhoto">
                                        ` : `
                                            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto"
                                                 style="width: 150px; height: 150px;">
                                                <span class="text-white display-4 fw-bold">${getInitials(this.user.namaLengkap)}</span>
                                            </div>
                                        `}
                                        <button class="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                                                style="width: 40px; height: 40px;"
                                                id="changePhotoBtn">
                                            <i class="bi bi-camera"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Basic Info -->
                                <h4 class="mb-1">${this.user.namaLengkap}</h4>
                                <p class="text-muted mb-3">
                                    <i class="bi bi-envelope me-1"></i>${this.user.email}
                                </p>
                                
                                <!-- Quick Stats -->
                                <div class="row text-center mb-4">
                                    <div class="col-4">
                                        <div class="fw-bold fs-5">${this.profileData?.kdJabatan ? 'Aktif' : '-'}</div>
                                        <small class="text-muted">Status</small>
                                    </div>
                                    <div class="col-4">
                                        <div class="fw-bold fs-5">${this.profileData?.namaJabatan || '-'}</div>
                                        <small class="text-muted">Jabatan</small>
                                    </div>
                                    <div class="col-4">
                                        <div class="fw-bold fs-5">${this.profileData?.namaDepartemen || '-'}</div>
                                        <small class="text-muted">Departemen</small>
                                    </div>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="d-grid gap-2">
                                    <button class="btn btn-outline-primary" id="editProfileBtn">
                                        <i class="bi bi-pencil me-2"></i>Edit Profile
                                    </button>
                                    <button class="btn btn-outline-warning" id="changePasswordBtn">
                                        <i class="bi bi-shield-lock me-2"></i>Ganti Password
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Account Settings -->
                        <div class="card card-custom">
                            <div class="card-header-custom">
                                <h6 class="mb-0">
                                    <i class="bi bi-gear me-2"></i>Pengaturan Akun
                                </h6>
                            </div>
                            <div class="card-body-custom">
                                <div class="list-group list-group-flush">
                                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            id="notificationSettings">
                                        <div>
                                            <i class="bi bi-bell me-2"></i>Notifikasi
                                        </div>
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            id="privacySettings">
                                        <div>
                                            <i class="bi bi-shield me-2"></i>Privasi & Keamanan
                                        </div>
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            id="themeSettings">
                                        <div>
                                            <i class="bi bi-palette me-2"></i>Tema
                                        </div>
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column: Detailed Info -->
                    <div class="col-md-8">
                        <!-- Personal Information -->
                        <div class="card card-custom mb-4">
                            <div class="card-header-custom d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="bi bi-person-badge me-2"></i>Informasi Pribadi
                                </h5>
                                <button class="btn btn-sm btn-outline-primary" id="editPersonalInfoBtn">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </div>
                            <div class="card-body-custom">
                                <div class="row">
                                    ${this.renderInfoField('Nama Lengkap', this.profileData?.namaLengkap || '-')}
                                    ${this.renderInfoField('Email', this.profileData?.email || '-')}
                                    ${this.renderInfoField('NIK', this.profileData?.nikUser || '-')}
                                    ${this.renderInfoField('Tempat Lahir', this.profileData?.tempatLahir || '-')}
                                    ${this.renderInfoField('Tanggal Lahir', 
                                        this.profileData?.tanggalLahir ? 
                                        formatDate(this.profileData.tanggalLahir, 'DD MMMM YYYY') : '-'
                                    )}
                                    ${this.renderInfoField('Jenis Kelamin', this.profileData?.namaJenisKelamin || '-')}
                                    ${this.renderInfoField('Pendidikan', this.profileData?.namaPendidikan || '-')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Work Information -->
                        <div class="card card-custom mb-4">
                            <div class="card-header-custom d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="bi bi-briefcase me-2"></i>Informasi Pekerjaan
                                </h5>
                                <button class="btn btn-sm btn-outline-primary" id="editWorkInfoBtn">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </div>
                            <div class="card-body-custom">
                                <div class="row">
                                    ${this.renderInfoField('Jabatan', this.profileData?.namaJabatan || '-')}
                                    ${this.renderInfoField('Departemen', this.profileData?.namaDepartemen || '-')}
                                    ${this.renderInfoField('Unit Kerja', this.profileData?.namaUnitKerja || '-')}
                                    ${this.renderInfoField('Tanggal Bergabung', 
                                        this.profileData?.createdAtEpoch ? 
                                        formatDate(this.profileData.createdAtEpoch, 'DD MMMM YYYY') : '-'
                                    )}
                                    ${this.renderInfoField('Status', this.profileData?.profile ? 'Aktif' : '-')}
                                    ${this.renderInfoField('ID Pegawai', this.profileData?.idUser || '-')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Account Activity -->
                        <div class="card card-custom">
                            <div class="card-header-custom">
                                <h5 class="mb-0">
                                    <i class="bi bi-clock-history me-2"></i>Aktivitas Akun
                                </h5>
                            </div>
                            <div class="card-body-custom">
                                <div class="list-group list-group-flush">
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <i class="bi bi-box-arrow-in-right text-success me-2"></i>
                                            <span>Login Terakhir</span>
                                        </div>
                                        <small class="text-muted">${formatDate(Math.floor(Date.now() / 1000), 'DD MMMM YYYY HH:mm')}</small>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <i class="bi bi-person-plus text-primary me-2"></i>
                                            <span>Akun Dibuat</span>
                                        </div>
                                        <small class="text-muted">${formatDate(this.profileData?.createdAtEpoch || Math.floor(Date.now() / 1000), 'DD MMMM YYYY')}</small>
                                    </div>
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <i class="bi bi-shield-check text-warning me-2"></i>
                                            <span>Keamanan Akun</span>
                                        </div>
                                        <span class="badge bg-success">Aman</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderInfoField(label, value) {
        return `
            <div class="col-md-6 mb-3">
                <label class="text-muted small">${label}</label>
                <div class="fw-bold">${value}</div>
            </div>
        `;
    }

    renderEditProfileForm() {
        return `
            <form id="editProfileForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Nama Lengkap *</label>
                        <input type="text" 
                               class="form-control-custom" 
                               name="namaLengkap" 
                               value="${this.profileData?.namaLengkap || ''}" 
                               required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Email *</label>
                        <input type="email" 
                               class="form-control-custom" 
                               name="email" 
                               value="${this.profileData?.email || ''}" 
                               required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">NIK</label>
                        <input type="text" 
                               class="form-control-custom" 
                               name="nikUser" 
                               value="${this.profileData?.nikUser || ''}" 
                               maxlength="16">
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Tempat Lahir</label>
                        <input type="text" 
                               class="form-control-custom" 
                               name="tempatLahir" 
                               value="${this.profileData?.tempatLahir || ''}">
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Tanggal Lahir</label>
                        <input type="date" 
                               class="form-control-custom" 
                               name="tanggalLahir" 
                               value="${this.profileData?.tanggalLahir ? new Date(this.profileData.tanggalLahir * 1000).toISOString().split('T')[0] : ''}">
                    </div>
                </div>
                
                <div class="alert alert-info mt-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Perubahan akan diterapkan setelah disetujui oleh admin/HRD.
                </div>
            </form>
        `;
    }

    renderChangePasswordForm() {
        return `
            <form id="changePasswordForm">
                <div class="mb-3">
                    <label class="form-label-custom">Password Saat Ini *</label>
                    <input type="password" 
                           class="form-control-custom" 
                           name="passwordAsli" 
                           required>
                </div>
                
                <div class="mb-3">
                    <label class="form-label-custom">Password Baru *</label>
                    <input type="password" 
                           class="form-control-custom" 
                           name="passwordBaru1" 
                           required 
                           minlength="6">
                    <div class="form-text">Minimal 6 karakter</div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label-custom">Konfirmasi Password Baru *</label>
                    <input type="password" 
                           class="form-control-custom" 
                           name="passwordBaru2" 
                           required 
                           minlength="6">
                </div>
                
                <div class="alert alert-warning mt-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Pastikan password baru Anda kuat dan mudah diingat.
                </div>
            </form>
        `;
    }

    bindEvents() {
        // Change photo button
        const changePhotoBtn = document.getElementById('changePhotoBtn');
        if (changePhotoBtn) {
            changePhotoBtn.addEventListener('click', () => this.handlePhotoChange());
        }
        
        // Edit profile button
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editPersonalInfoBtn = document.getElementById('editPersonalInfoBtn');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        }
        
        if (editPersonalInfoBtn) {
            editPersonalInfoBtn.addEventListener('click', () => this.showEditProfileModal());
        }
        
        // Edit work info button
        const editWorkInfoBtn = document.getElementById('editWorkInfoBtn');
        if (editWorkInfoBtn) {
            editWorkInfoBtn.addEventListener('click', () => {
                Alert.info('Info', 'Untuk mengubah informasi pekerjaan, hubungi admin/HRD');
            });
        }
        
        // Change password button
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showChangePasswordModal());
        }
        
        // Settings buttons
        const notificationSettings = document.getElementById('notificationSettings');
        const privacySettings = document.getElementById('privacySettings');
        const themeSettings = document.getElementById('themeSettings');
        
        if (notificationSettings) {
            notificationSettings.addEventListener('click', () => {
                Alert.info('Coming Soon', 'Fitur notifikasi akan segera tersedia');
            });
        }
        
        if (privacySettings) {
            privacySettings.addEventListener('click', () => {
                Alert.info('Coming Soon', 'Fitur privasi akan segera tersedia');
            });
        }
        
        if (themeSettings) {
            themeSettings.addEventListener('click', () => {
                this.showThemeSettings();
            });
        }
    }

    async handlePhotoChange() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file
            if (!file.type.match('image.*')) {
                Alert.error('File Tidak Valid', 'Hanya file gambar yang diizinkan');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB
                Alert.error('File Terlalu Besar', 'Ukuran file maksimal 5MB');
                return;
            }
            
            try {
                Loading.show('Mengunggah foto...');
                
                const formData = new FormData();
                formData.append('files', file);
                
                await PegawaiAPI.updateOwnPhoto(formData);
                
                Alert.success('Berhasil', 'Foto profil berhasil diubah');
                await this.loadProfileData();
                this.render();
                this.bindEvents();
            } catch (error) {
                Alert.error('Gagal', error.message || 'Gagal mengubah foto profil');
            } finally {
                Loading.hide();
            }
        };
        
        input.click();
    }

    showEditProfileModal() {
        const modal = Modal.create({
            title: 'Edit Profile',
            content: this.renderEditProfileForm(),
            size: 'lg',
            showFooter: true,
            submitText: 'Simpan Perubahan',
            cancelText: 'Batal',
            onSubmit: () => this.handleEditProfile()
        });
        
        Modal.show(modal);
    }

    async handleEditProfile() {
        const form = document.getElementById('editProfileForm');
        if (!form || !form.checkValidity()) {
            Alert.error('Validasi Gagal', 'Harap isi semua field yang wajib diisi');
            return;
        }

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (value) data[key] = value;
        });

        // Validation
        if (data.email && !validateEmail(data.email)) {
            Alert.error('Validasi Gagal', 'Format email tidak valid');
            return;
        }

        // Convert date to epoch
        if (data.tanggalLahir) {
            data.tanggalLahir = Math.floor(new Date(data.tanggalLahir).getTime() / 1000);
        }

        try {
            Loading.show('Menyimpan perubahan...');
            
            // Update employee data
            await PegawaiAPI.updatePegawai(this.user.idUser, data);
            
            // Update user data in storage
            const updatedUser = {
                ...this.user,
                namaLengkap: data.namaLengkap || this.user.namaLengkap,
                email: data.email || this.user.email
            };
            
            AuthService.setUser(updatedUser);
            
            Alert.success('Berhasil', 'Profile berhasil diperbarui');
            Modal.hide(Modal.getCurrentModal());
            
            await this.loadProfileData();
            this.render();
            this.bindEvents();
        } catch (error) {
            Alert.error('Gagal', error.message || 'Gagal memperbarui profile');
        } finally {
            Loading.hide();
        }
    }

    showChangePasswordModal() {
        const modal = Modal.create({
            title: 'Ganti Password',
            content: this.renderChangePasswordForm(),
            size: 'md',
            showFooter: true,
            submitText: 'Ganti Password',
            cancelText: 'Batal',
            onSubmit: () => this.handleChangePassword()
        });
        
        Modal.show(modal);
    }

    async handleChangePassword() {
        const form = document.getElementById('changePasswordForm');
        if (!form || !form.checkValidity()) {
            Alert.error('Validasi Gagal', 'Harap isi semua field yang wajib diisi');
            return;
        }

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Validation
        if (data.passwordBaru1 !== data.passwordBaru2) {
            Alert.error('Validasi Gagal', 'Password baru tidak sama');
            return;
        }

        if (data.passwordBaru1.length < 6) {
            Alert.error('Validasi Gagal', 'Password baru minimal 6 karakter');
            return;
        }

        try {
            Loading.show('Mengganti password...');
            
            await AuthAPI.changePassword(data);
            
            Alert.success('Berhasil', 'Password berhasil diubah');
            Modal.hide(Modal.getCurrentModal());
            
            // Clear form
            form.reset();
        } catch (error) {
            Alert.error('Gagal', error.message || 'Gagal mengganti password');
        } finally {
            Loading.hide();
        }
    }

    showThemeSettings() {
        const currentTheme = localStorage.getItem('hr-theme') || 'light';
        
        const modal = Modal.create({
            title: 'Pengaturan Tema',
            content: `
                <div class="theme-settings">
                    <div class="mb-3">
                        <h6>Pilih Tema</h6>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary theme-option ${currentTheme === 'light' ? 'active' : ''}"
                                    data-theme="light">
                                <i class="bi bi-sun me-2"></i>Terang
                            </button>
                            <button class="btn btn-outline-primary theme-option ${currentTheme === 'dark' ? 'active' : ''}"
                                    data-theme="dark">
                                <i class="bi bi-moon me-2"></i>Gelap
                            </button>
                            <button class="btn btn-outline-primary theme-option ${currentTheme === 'system' ? 'active' : ''}"
                                    data-theme="system">
                                <i class="bi bi-laptop me-2"></i>Sistem
                            </button>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        Tema akan diterapkan setelah halaman direfresh.
                    </div>
                </div>
            `,
            size: 'md',
            showFooter: false
        });
        
        Modal.show(modal);
        
        // Bind theme option clicks
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.getAttribute('data-theme');
                this.setTheme(theme);
                
                // Update active state
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });
    }

    setTheme(theme) {
        localStorage.setItem('hr-theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);
    }

    destroy() {
        // Cleanup
    }
}

export default ProfilePage;