// PresensiPage.js - Attendance Management Page
import AuthService from '../services/auth.service.js';
import { PresensiAPI } from '../api/presensi.api.js';
import Loading from '../components/Loading.js';
import Modal from '../components/Modal.js';
import Alert from '../components/Alert.js';
import { formatDate, formatRoleBadge } from '../utils/formatters.js';

class PresensiPage {
    constructor() {
        this.user = AuthService.getUser();
        this.attendance = [];
        this.statusOptions = [];
        this.filter = {
            tglAwal: null,
            tglAkhir: null,
            status: 'all'
        };
        this.currentPage = 1;
        this.pageSize = 10;
    }

    async init() {
        await this.loadData();
        this.render();
        this.bindEvents();
    }

    async loadData() {
        Loading.show('Memuat data presensi...');
        
        try {
            // Set default date range (last 30 days)
            const now = Math.floor(Date.now() / 1000);
            const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
            
            this.filter.tglAwal = thirtyDaysAgo;
            this.filter.tglAkhir = now;
            
            // Load status options
            this.statusOptions = await PresensiAPI.getStatusCombo(thirtyDaysAgo, now);
            
            // Load attendance based on role
            if (this.user.profile === 'ADMIN' || this.user.profile === 'HRD') {
                this.attendance = await PresensiAPI.getAttendanceAdmin(thirtyDaysAgo, now);
            } else {
                this.attendance = await PresensiAPI.getAttendanceEmployee(thirtyDaysAgo, now);
            }
            
            // Sort by date, newest first
            this.attendance.sort((a, b) => b.tglAbsensi - a.tglAbsensi);
        } catch (error) {
            console.error('Error loading attendance:', error);
            Alert.error('Gagal Memuat Data', 'Tidak dapat memuat data presensi');
        } finally {
            Loading.hide();
        }
    }

    getFilteredAttendance() {
        let filtered = this.attendance;
        
        // Apply status filter
        if (this.filter.status !== 'all') {
            filtered = filtered.filter(att => {
                if (this.filter.status === 'hadir') return att.jamMasuk && !att.namaStatus;
                if (this.filter.status === 'tidak_hadir') return att.namaStatus;
                return att.namaStatus === this.filter.status;
            });
        }
        
        // Apply date range filter
        if (this.filter.tglAwal && this.filter.tglAkhir) {
            filtered = filtered.filter(att => 
                att.tglAbsensi >= this.filter.tglAwal && 
                att.tglAbsensi <= this.filter.tglAkhir
            );
        }
        
        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        
        return {
            list: filtered.slice(startIndex, endIndex),
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / this.pageSize)
        };
    }

    render() {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;
        
        const { list: attendance, total, totalPages } = this.getFilteredAttendance();
        const todayEpoch = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
        const todayAttendance = this.attendance.find(att => att.tglAbsensi === todayEpoch);
        
        pageContainer.innerHTML = `
            <div class="fade-in">
                <!-- Page Header -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2 class="mb-1">Presensi</h2>
                            <p class="text-muted mb-0">Kelola kehadiran karyawan</p>
                        </div>
                        ${this.user.profile !== 'ADMIN' && this.user.profile !== 'HRD' ? `
                            <div class="d-flex gap-2">
                                <button class="btn btn-success" id="checkInBtn" ${todayAttendance?.jamMasuk ? 'disabled' : ''}>
                                    <i class="bi bi-box-arrow-in-right me-2"></i>Presensi Masuk
                                </button>
                                <button class="btn btn-warning" id="checkOutBtn" ${!todayAttendance?.jamMasuk || todayAttendance?.jamKeluar ? 'disabled' : ''}>
                                    <i class="bi bi-box-arrow-right me-2"></i>Presensi Keluar
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Attendance Summary -->
                ${this.user.profile !== 'ADMIN' && this.user.profile !== 'HRD' ? this.renderEmployeeSummary(todayAttendance) : ''}
                
                <!-- Filters -->
                <div class="card card-custom mb-4">
                    <div class="card-body-custom">
                        <div class="row g-3">
                            <div class="col-md-3">
                                <label class="form-label-custom">Tanggal Awal</label>
                                <input type="date" 
                                       class="form-control-custom" 
                                       id="dateStart" 
                                       value="${this.filter.tglAwal ? new Date(this.filter.tglAwal * 1000).toISOString().split('T')[0] : ''}">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label-custom">Tanggal Akhir</label>
                                <input type="date" 
                                       class="form-control-custom" 
                                       id="dateEnd" 
                                       value="${this.filter.tglAkhir ? new Date(this.filter.tglAkhir * 1000).toISOString().split('T')[0] : ''}">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label-custom">Status</label>
                                <select class="form-control-custom form-select" id="statusFilter">
                                    <option value="all">Semua Status</option>
                                    <option value="hadir" ${this.filter.status === 'hadir' ? 'selected' : ''}>Hadir</option>
                                    <option value="tidak_hadir" ${this.filter.status === 'tidak_hadir' ? 'selected' : ''}>Tidak Hadir</option>
                                    ${this.statusOptions.map(status => `
                                        <option value="${status.nama}" ${this.filter.status === status.nama ? 'selected' : ''}>
                                            ${status.nama}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="col-md-3 d-flex align-items-end">
                                <button class="btn btn-primary w-100" id="applyFilterBtn">
                                    <i class="bi bi-funnel me-2"></i>Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Attendance Table -->
                <div class="card card-custom">
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-calendar-check me-2"></i>Riwayat Presensi
                            <span class="badge bg-primary ms-2">${total} entri</span>
                        </h5>
                        ${this.user.profile !== 'ADMIN' && this.user.profile !== 'HRD' ? `
                            <button class="btn btn-outline-primary btn-sm" id="requestAbsenceBtn">
                                <i class="bi bi-plus-circle me-1"></i>Ajukan Absen
                            </button>
                        ` : ''}
                    </div>
                    <div class="card-body-custom p-0">
                        ${attendance.length === 0 ? this.renderEmptyState() : this.renderAttendanceTable(attendance)}
                    </div>
                    ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
                </div>
            </div>
        `;
    }

    renderEmployeeSummary(todayAttendance) {
        const today = formatDate(Math.floor(Date.now() / 1000), 'DD MMMM YYYY');
        
        return `
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card card-custom bg-light">
                        <div class="card-body-custom">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h5 class="mb-2">Status Hari Ini (${today})</h5>
                                    ${todayAttendance ? `
                                        <div class="d-flex align-items-center">
                                            <div class="me-3">
                                                ${todayAttendance.jamMasuk ? `
                                                    <span class="badge bg-success me-2">
                                                        <i class="bi bi-check-circle me-1"></i>Sudah Masuk
                                                    </span>
                                                ` : ''}
                                                ${todayAttendance.jamKeluar ? `
                                                    <span class="badge bg-warning me-2">
                                                        <i class="bi bi-check-circle me-1"></i>Sudah Keluar
                                                    </span>
                                                ` : ''}
                                                ${todayAttendance.namaStatus ? `
                                                    <span class="badge bg-info">
                                                        <i class="bi bi-info-circle me-1"></i>${todayAttendance.namaStatus}
                                                    </span>
                                                ` : ''}
                                            </div>
                                            <div>
                                                ${todayAttendance.jamMasuk ? `
                                                    <small class="text-muted">
                                                        Masuk: ${todayAttendance.jamMasuk}
                                                        ${todayAttendance.jamKeluar ? ` | Keluar: ${todayAttendance.jamKeluar}` : ''}
                                                    </small>
                                                ` : todayAttendance.namaStatus ? `
                                                    <small class="text-muted">Status: ${todayAttendance.namaStatus}</small>
                                                ` : `
                                                    <small class="text-muted">Belum melakukan presensi hari ini</small>
                                                `}
                                            </div>
                                        </div>
                                    ` : `
                                        <div class="d-flex align-items-center">
                                            <span class="badge bg-secondary me-2">
                                                <i class="bi bi-clock me-1"></i>Belum Presensi
                                            </span>
                                            <small class="text-muted">Silakan lakukan presensi masuk</small>
                                        </div>
                                    `}
                                </div>
                                <div class="col-md-4 text-end">
                                    <div class="d-flex justify-content-end gap-2">
                                        ${todayAttendance?.jamMasuk && !todayAttendance?.jamKeluar ? `
                                            <button class="btn btn-warning" id="quickCheckOutBtn">
                                                <i class="bi bi-box-arrow-right me-1"></i>Keluar Sekarang
                                            </button>
                                        ` : !todayAttendance?.jamMasuk ? `
                                            <button class="btn btn-success" id="quickCheckInBtn">
                                                <i class="bi bi-box-arrow-in-right me-1"></i>Masuk Sekarang
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAttendanceTable(attendance) {
        return `
            <div class="table-responsive">
                <table class="table table-custom table-hover mb-0">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            ${this.user.profile === 'ADMIN' || this.user.profile === 'HRD' ? '<th>Nama Pegawai</th>' : ''}
                            <th>Tanggal</th>
                            <th>Jam Masuk</th>
                            <th>Jam Keluar</th>
                            <th>Status</th>
                            <th>Durasi</th>
                            ${this.user.profile === 'ADMIN' || this.user.profile === 'HRD' ? '<th style="width: 100px;">Aksi</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${attendance.map((att, index) => {
                            const startIndex = (this.currentPage - 1) * this.pageSize;
                            const duration = this.calculateDuration(att.jamMasuk, att.jamKeluar);
                            
                            return `
                                <tr>
                                    <td>${startIndex + index + 1}</td>
                                    ${this.user.profile === 'ADMIN' || this.user.profile === 'HRD' ? `
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" 
                                                     style="width: 32px; height: 32px;">
                                                    <i class="bi bi-person text-muted"></i>
                                                </div>
                                                <div>
                                                    <div class="fw-bold">${att.namaLengkap}</div>
                                                    <small class="text-muted">${att.idUser}</small>
                                                </div>
                                            </div>
                                        </td>
                                    ` : ''}
                                    <td>
                                        <div class="fw-bold">${formatDate(att.tglAbsensi, 'DD/MM/YYYY')}</div>
                                        <small class="text-muted">${formatDate(att.tglAbsensi, 'dddd')}</small>
                                    </td>
                                    <td>
                                        ${att.jamMasuk ? `
                                            <span class="badge bg-success">
                                                ${att.jamMasuk}
                                            </span>
                                        ` : '-'}
                                    </td>
                                    <td>
                                        ${att.jamKeluar ? `
                                            <span class="badge bg-warning">
                                                ${att.jamKeluar}
                                            </span>
                                        ` : '-'}
                                    </td>
                                    <td>
                                        ${att.namaStatus ? `
                                            <span class="badge bg-info">${att.namaStatus}</span>
                                        ` : att.jamMasuk ? `
                                            <span class="badge bg-success">Hadir</span>
                                        ` : '-'}
                                    </td>
                                    <td>
                                        ${duration || '-'}
                                    </td>
                                    ${this.user.profile === 'ADMIN' || this.user.profile === 'HRD' ? `
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${att.id}">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                        </td>
                                    ` : ''}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="text-center py-5">
                <i class="bi bi-calendar-x display-1 text-muted"></i>
                <h5 class="mt-3">Tidak ada data presensi</h5>
                <p class="text-muted mb-4">
                    Tidak ada data presensi dalam periode yang dipilih.
                </p>
                <button class="btn btn-outline-primary" id="resetFilterBtn">
                    <i class="bi bi-arrow-clockwise me-2"></i>Reset Filter
                </button>
            </div>
        `;
    }

    renderPagination(totalPages) {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return `
            <div class="card-footer-custom">
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center mb-0">
                        <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                            <button class="page-link" data-page="first">
                                <i class="bi bi-chevron-double-left"></i>
                            </button>
                        </li>
                        <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                            <button class="page-link" data-page="prev">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        
                        ${pages.map(page => `
                            <li class="page-item ${page === this.currentPage ? 'active' : ''}">
                                <button class="page-link" data-page="${page}">${page}</button>
                            </li>
                        `).join('')}
                        
                        <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                            <button class="page-link" data-page="next">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </li>
                        <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                            <button class="page-link" data-page="last">
                                <i class="bi bi-chevron-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        `;
    }

    calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return null;
        
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60; // Handle overnight shifts
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours} jam ${minutes} menit`;
    }

    renderAbsenceForm() {
        return `
            <form id="absenceForm">
                <div class="mb-3">
                    <label class="form-label-custom">Tanggal Absen *</label>
                    <input type="date" 
                           class="form-control-custom" 
                           name="tglAbsensi" 
                           required
                           min="${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
                           max="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="mb-3">
                    <label class="form-label-custom">Keterangan Absen *</label>
                    <select class="form-control-custom form-select" name="kdStatus" required>
                        <option value="">Pilih Keterangan</option>
                        ${this.statusOptions.map(status => `
                            <option value="${status.kode}">${status.nama}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="mb-3">
                    <label class="form-label-custom">Keterangan Tambahan</label>
                    <textarea class="form-control-custom" 
                              name="keterangan" 
                              rows="3" 
                              placeholder="Opsional..."></textarea>
                </div>
                
                <div class="alert alert-info mt-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Pengajuan absen akan diverifikasi oleh HRD.
                </div>
            </form>
        `;
    }

    bindEvents() {
        // Filter functionality
        const applyFilterBtn = document.getElementById('applyFilterBtn');
        const resetFilterBtn = document.getElementById('resetFilterBtn');
        
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => this.applyFilters());
        }
        
        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // Date inputs
        const dateStart = document.getElementById('dateStart');
        const dateEnd = document.getElementById('dateEnd');
        const statusFilter = document.getElementById('statusFilter');
        
        if (dateStart) {
            dateStart.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.filter.tglAwal = Math.floor(new Date(e.target.value).getTime() / 1000);
                }
            });
        }
        
        if (dateEnd) {
            dateEnd.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.filter.tglAkhir = Math.floor(new Date(e.target.value).getTime() / 1000);
                }
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filter.status = e.target.value;
            });
        }
        
        // Check-in/out buttons
        const checkInBtn = document.getElementById('checkInBtn');
        const checkOutBtn = document.getElementById('checkOutBtn');
        const quickCheckInBtn = document.getElementById('quickCheckInBtn');
        const quickCheckOutBtn = document.getElementById('quickCheckOutBtn');
        
        if (checkInBtn) checkInBtn.addEventListener('click', () => this.handleCheckIn());
        if (checkOutBtn) checkOutBtn.addEventListener('click', () => this.handleCheckOut());
        if (quickCheckInBtn) quickCheckInBtn.addEventListener('click', () => this.handleCheckIn());
        if (quickCheckOutBtn) quickCheckOutBtn.addEventListener('click', () => this.handleCheckOut());
        
        // Request absence
        const requestAbsenceBtn = document.getElementById('requestAbsenceBtn');
        if (requestAbsenceBtn) {
            requestAbsenceBtn.addEventListener('click', () => this.showAbsenceForm());
        }
        
        // Pagination
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = link.getAttribute('data-page');
                
                switch (action) {
                    case 'first':
                        this.currentPage = 1;
                        break;
                    case 'prev':
                        this.currentPage = Math.max(1, this.currentPage - 1);
                        break;
                    case 'next':
                        const { totalPages } = this.getFilteredAttendance();
                        this.currentPage = Math.min(totalPages, this.currentPage + 1);
                        break;
                    case 'last':
                        const { totalPages: lastTotalPages } = this.getFilteredAttendance();
                        this.currentPage = lastTotalPages;
                        break;
                    default:
                        this.currentPage = parseInt(action);
                }
                
                this.render();
                this.bindEvents();
            });
        });
        
        // Edit attendance (admin/HRD only)
        document.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = button.getAttribute('data-id');
                this.editAttendance(id);
            });
        });
    }

    async applyFilters() {
        this.currentPage = 1;
        await this.loadFilteredData();
        this.render();
        this.bindEvents();
    }

    async resetFilters() {
        const now = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
        
        this.filter = {
            tglAwal: thirtyDaysAgo,
            tglAkhir: now,
            status: 'all'
        };
        
        this.currentPage = 1;
        await this.loadFilteredData();
        this.render();
        this.bindEvents();
    }

    async loadFilteredData() {
        Loading.show('Memuat data...');
        
        try {
            if (this.user.profile === 'ADMIN' || this.user.profile === 'HRD') {
                this.attendance = await PresensiAPI.getAttendanceAdmin(
                    this.filter.tglAwal,
                    this.filter.tglAkhir
                );
            } else {
                this.attendance = await PresensiAPI.getAttendanceEmployee(
                    this.filter.tglAwal,
                    this.filter.tglAkhir
                );
            }
            
            // Sort by date, newest first
            this.attendance.sort((a, b) => b.tglAbsensi - a.tglAbsensi);
        } catch (error) {
            console.error('Error loading filtered attendance:', error);
            Alert.error('Gagal Memuat Data', 'Tidak dapat memuat data presensi');
        } finally {
            Loading.hide();
        }
    }

    async handleCheckIn() {
        try {
            Loading.show('Melakukan presensi masuk...');
            const result = await PresensiAPI.checkIn();
            
            Alert.success('Presensi Berhasil', `Jam masuk: ${result.jamMasuk}`);
            await this.loadData();
            this.render();
            this.bindEvents();
        } catch (error) {
            Alert.error('Presensi Gagal', error.message || 'Gagal melakukan presensi');
        } finally {
            Loading.hide();
        }
    }

    async handleCheckOut() {
        try {
            Loading.show('Melakukan presensi keluar...');
            const result = await PresensiAPI.checkOut();
            
            Alert.success('Presensi Berhasil', `Jam keluar: ${result.jamKeluar}`);
            await this.loadData();
            this.render();
            this.bindEvents();
        } catch (error) {
            Alert.error('Presensi Gagal', error.message || 'Gagal melakukan presensi');
        } finally {
            Loading.hide();
        }
    }

    showAbsenceForm() {
        const modal = Modal.create({
            title: 'Ajukan Absen',
            content: this.renderAbsenceForm(),
            size: 'md',
            showFooter: true,
            submitText: 'Ajukan',
            cancelText: 'Batal',
            onSubmit: () => this.handleAbsenceRequest()
        });
        
        Modal.show(modal);
    }

    async handleAbsenceRequest() {
        const form = document.getElementById('absenceForm');
        if (!form || !form.checkValidity()) {
            Alert.error('Validasi Gagal', 'Harap isi semua field yang wajib diisi');
            return;
        }

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Convert date to epoch
        if (data.tglAbsensi) {
            data.tglAbsensi = Math.floor(new Date(data.tglAbsensi).getTime() / 1000);
        }

        try {
            Loading.show('Mengajukan absen...');
            await PresensiAPI.submitAbsence(data);
            
            Alert.success('Berhasil', 'Pengajuan absen berhasil dikirim');
            Modal.hide(Modal.getCurrentModal());
            
            await this.loadData();
            this.render();
            this.bindEvents();
        } catch (error) {
            Alert.error('Gagal', error.message || 'Gagal mengajukan absen');
        } finally {
            Loading.hide();
        }
    }

    editAttendance(id) {
        // Implementation for editing attendance (admin/HRD only)
        console.log('Edit attendance:', id);
    }

    destroy() {
        // Cleanup
    }
}

export default PresensiPage;