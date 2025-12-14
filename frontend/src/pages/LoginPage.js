// LoginPage.js - FIXED FINAL VERSION
import AuthService from '../services/auth.service.js';
import NotificationService from '../services/notification.service.js';
import Loading from '../components/Loading.js';
import { validateEmail, validateRequired } from '../utils/validators.js';

class LoginPage {
    constructor() {
        this.form = null;
        this.initForm = null;
        this.alertContainer = null;
        this.initSection = null;
        this.loginSection = null;
        this.passwordToggle = null;
        this.isProcessing = false;
    }

    async init() {
        this.render();
        this.bindEvents();
        await this.checkInitialization();
        this.applyTheme();
    }

    render() {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;

        pageContainer.innerHTML = `
            <div id="login-page" class="fade-in">
                <div class="container">
                    <div class="row justify-content-center align-items-center min-vh-100">
                        <div class="col-md-8 col-lg-6 col-xl-5">
                            <div class="card shadow-lg border-0">

                                <div class="card-header text-center pt-4 pb-2">
                                    <h2 class="fw-bold mb-1">HR Management System</h2>
                                    <p class="text-muted">Employee & Attendance Management</p>
                                </div>

                                <div class="card-body px-4">

                                    <!-- INIT SECTION -->
                                    <div id="init-section" class="d-none">
                                        <h4 class="fw-bold text-center mb-3">System Initialization</h4>

                                        <form id="init-form" novalidate>
                                            <div class="mb-3">
                                                <label class="form-label">Nama Admin *</label>
                                                <input type="text" id="namaAdmin" class="form-control" required>
                                            </div>

                                            <div class="mb-3">
                                                <label class="form-label">Nama Perusahaan *</label>
                                                <input type="text" id="perusahaan" class="form-control" required>
                                            </div>

                                            <button class="btn btn-primary w-100" id="init-submit">
                                                Mulai Inisialisasi
                                            </button>
                                        </form>
                                    </div>

                                    <!-- LOGIN SECTION -->
                                    <div id="login-section">
                                        <h4 class="fw-bold text-center mb-3">Login</h4>

                                        <form id="login-form" novalidate>

                                            <div class="mb-3">
                                                <label class="form-label">Email *</label>
                                                <input type="email" id="email" class="form-control" required>
                                            </div>

                                            <div class="mb-3">
                                                <label class="form-label">Password *</label>
                                                <div class="input-group">
                                                    <input type="password" id="password" class="form-control" required>
                                                    <button class="btn btn-outline-secondary" id="toggle-password" type="button">
                                                        <i class="bi bi-eye"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div class="mb-3">
                                                <label class="form-label">Role *</label>
                                                <select id="profile" class="form-select" required>
                                                    <option value="">Pilih Role</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="HRD">HRD</option>
                                                    <option value="PEGAWAI">Pegawai</option>
                                                    <option value="MANAGER">Manager</option>
                                                </select>
                                            </div>

                                            <button class="btn btn-success w-100" id="login-submit">
                                                Login
                                            </button>
                                        </form>
                                    </div>

                                    <div id="login-alert" class="mt-3"></div>

                                </div>

                                <div class="card-footer text-center pb-3">
                                    <small class="text-muted">© 2025 HR System</small>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Cache elements
        this.form = document.getElementById('login-form');
        this.initForm = document.getElementById('init-form');
        this.alertContainer = document.getElementById('login-alert');
        this.initSection = document.getElementById('init-section');
        this.loginSection = document.getElementById('login-section');
        this.passwordToggle = document.getElementById('toggle-password');
    }

    applyTheme() {
        // Theme + Remember-me is preserved but optional
        const savedEmail = localStorage.getItem('hr-saved-email');
        const savedProfile = localStorage.getItem('hr-saved-profile');

        if (savedEmail) document.getElementById('email').value = savedEmail;
        if (savedProfile) document.getElementById('profile').value = savedProfile;
    }

    async checkInitialization() {
        try {
            Loading.show("Memeriksa sistem...");
            const initialized = await AuthService.checkInitialization();

            if (initialized) {
                this.initSection.classList.add("d-none");
                this.loginSection.classList.remove("d-none");
            } else {
                this.initSection.classList.remove("d-none");
                this.loginSection.classList.add("d-none");
            }
        } finally {
            Loading.hide();
        }
    }


    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        }

        if (this.initForm) {
            this.initForm.addEventListener('submit', (e) => this.handleInitSubmit(e));
        }

        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    togglePasswordVisibility() {
        const pass = document.getElementById('password');
        const icon = this.passwordToggle.querySelector('i');

        if (pass.type === 'password') {
            pass.type = 'text';
            icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            pass.type = 'password';
            icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
    }

    async handleInitSubmit(e) {
        e.preventDefault();

        const namaAdmin = document.getElementById("namaAdmin").value.trim();
        const perusahaan = document.getElementById("perusahaan").value.trim();

        if (!namaAdmin || !perusahaan) {
            this.showAlert("Semua field harus diisi.", "warning");
            return;
        }

        try {
            Loading.show("Menginisialisasi sistem...");

            const result = await AuthService.initializeSystem({
                namaAdmin,
                perusahaan
            });

            this.showAlert(
                `Inisialisasi berhasil!<br>Email admin: ${result.email}<br>Password: ${result.password}`,
                "success"
            );

            setTimeout(() => {
                this.initSection.classList.add("d-none");
                this.loginSection.classList.remove("d-none");

                document.getElementById("email").value = result.email;
            }, 1500);

        } catch (err) {
            this.showAlert("Gagal inisialisasi sistem", "danger");
        } finally {
            Loading.hide();
        }
    }


    async handleLoginSubmit(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const profile = document.getElementById('profile').value;

        if (!validateEmail(email) || !validateRequired(password) || !profile) {
            this.showAlert("Harap isi data dengan benar.", "warning");
            return;
        }

        try {
            Loading.show("Sedang masuk…");

            const user = await AuthService.login({ email, password, profile });

            this.showAlert("Login berhasil! Mengalihkan…", "success");

            setTimeout(() => {
                window.location.hash = "#/dashboard";
            }, 700);

        } catch (err) {
            this.showAlert("Email atau password salah.", "danger");
        } finally {
            Loading.hide();
        }
    }

    showAlert(message, type = "danger") {
        this.alertContainer.innerHTML = `
            <div class="alert alert-${type}">${message}</div>
        `;
    }
}

export default LoginPage;
