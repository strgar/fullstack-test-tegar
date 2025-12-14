// DashboardPage.js - Dashboard Page
import AuthService from '../services/auth.service.js';
import { PegawaiAPI } from '../api/pegawai.api.js';
import { PresensiAPI } from '../api/presensi.api.js';
import Loading from '../components/Loading.js';
import { formatDate, formatRoleBadge } from '../utils/formatters.js';

class DashboardPage {
    constructor() {
        this.user = AuthService.getUser();
        this.stats = {};
        this.recentAttendance = [];
    }

    async init() {
        await this.loadData();
        this.render();
        this.bindEvents();
    }

    async loadData() {
        Loading.show('Memuat dashboard...');
        
        try {
            // Load dashboard statistics based on user role
            if (this.user.profile === 'ADMIN' || this.user.profile === 'HRD') {
                await this.loadAdminStats();
            } else {
                await this.loadEmployeeStats();
            }
            
            // Load recent attendance
            await this.loadRecentAttendance();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            Loading.hide();
        }
    }

    async loadAdminStats() {
        try {
            const now = Math.floor(Date.now() / 1000);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEpoch = Math.floor(today.getTime() / 1000);
            
            // Get all employees
            const employees = await PegawaiAPI.getAllPegawai();
            
            // Get today's attendance
            const todayAttendance = await PresensiAPI.getAttendanceAdmin(todayEpoch, now);
            
            // Calculate stats
            const totalEmployees = employees.length || 0;
            const presentToday = todayAttendance.filter(a => a.jamMasuk).length || 0;
            const absentToday = todayAttendance.filter(a => a.namaStatus).length || 0;
            const lateToday = todayAttendance.filter(a => {
                if (!a.jamMasuk) return false;
                const [hours] = a.jamMasuk.split(':').map(Number);
                return hours >= 9; // Late if check-in after 9 AM
            }).length || 0;
            
            this.stats = {
                totalEmployees,
                presentToday,
                absentToday,
                lateToday,
                attendancePercentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
            };
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    async loadEmployeeStats() {
        try {
            const now = Math.floor(Date.now() / 1000);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEpoch = Math.floor(today.getTime() / 1000);
            const thirtyDaysAgo = todayEpoch - (30 * 24 * 60 * 60);
            
            // Get employee attendance
            const attendance = await PresensiAPI.getAttendanceEmployee(thirtyDaysAgo, now);
            
            // Calculate stats
            const totalDays = 30;
            const presentDays = attendance.filter(a => a.jamMasuk && !a.namaStatus).length;
            const absentDays = attendance.filter(a => a.namaStatus).length;
            
            this.stats = {
                totalDays,
                presentDays,
                absentDays,
                attendancePercentage: Math.round((presentDays / totalDays) * 100),
                remainingLeave: 12 // Hardcoded for now
            };
        } catch (error) {
            console.error('Error loading employee stats:', error);
        }
    }

    async loadRecentAttendance() {
        try {
            const now = Math.floor(Date.now() / 1000);
            const sevenDaysAgo = now - (7 * 24 * 60 * 60);
            
            if (this.user.profile === 'ADMIN' || this.user.profile === 'HRD') {
                this.recentAttendance = await PresensiAPI.getAttendanceAdmin(sevenDaysAgo, now);
            } else {
                this.recentAttendance = await PresensiAPI.getAttendanceEmployee(sevenDaysAgo, now);
            }
            
            // Sort by date, newest first
            this.recentAttendance.sort((a, b) => b.tglAbsensi - a.tglAbsensi);
        } catch (error) {
            console.error('Error loading recent attendance:', error);
        }
    }

    render() {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;
        
        const roleBadge = formatRoleBadge(this.user.profile);
        
        pageContainer.innerHTML = `
            <div class="fade-in">
                <!-- Page Header -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2 class="mb-1">Dashboard</h2>
                            <p class="text-muted mb-0">
                                Selamat datang, <span class="fw-bold">${this.user.namaLengkap}</span>
                            </p>
                        </div>
                        <div class="text-end">
                            <div class="small text-muted">${formatDate(Math.floor(Date.now() / 1000), 'DD MMMM YYYY')}</div>
                            <div>${roleBadge}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Statistics Cards -->
                <div class="row mb-4">
                    ${this.renderStatsCards()}
                </div>
                
                <!-- Quick Actions -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card card-custom">
                            <div class="card-header-custom">
                                <h5 class="mb-0">
                                    <i class="bi bi-lightning-charge me-2"></i>Quick Actions
                                </h5>
                            </div>
                            <div class="card-body-custom">
                                <div class="row g-3">
                                    ${this.renderQuickActions()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="row">
                    <div class="col-12">
                        <div class="card card-custom">
                            <div class="card-header-custom d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="bi bi-clock-history me-2"></i>Recent Activity
                                </h5>
                                <button class="btn btn-sm btn-outline-primary" id="refreshAttendance">
                                    <i class="bi bi-arrow-clockwise"></i> Refresh
                                </button>
                            </div>
                            <div class="card-body-custom">
                                ${this.renderRecentActivity()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStatsCards() {
        if (this.user.profile === 'ADMIN' || this.user.profile === 'HRD') {
            return `
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card card-custom bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-subtitle mb-2 opacity-75">Total Pegawai</h6>
                                    <h2 class="card-title mb-0">${this.stats.totalEmployees || 0}</h2>
                                </div>
                                <i class="bi bi-people-fill display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card card-custom bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-subtitle mb-2 opacity-75">Hadir Hari Ini</h6>
                                    <h2 class="card-title mb-0">${this.stats.presentToday || 0}</h2>
                                </div>
                                <i class="bi bi-check-circle display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card card-custom bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-subtitle mb-2 opacity-75">Terlambat</h6>
                                    <h2 class="card-title mb-0">${this.stats.lateToday || 0}</h2>
                                </div>
                                <i class="bi bi-clock-history display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="card card-custom bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-subtitle mb-2 opacity-75">Kehadiran</h6>
                                    <h2 class="card-title mb-0">${this.stats.attendancePercentage || 0}%</h2>
                                </div>
                                <i class="bi bi-percent display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="col-md-4 col-sm-6 mb-3">
                    <div class="card card-custom bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-subtitle mb-2 opacity-75">Hari Hadir (30 hari)</h6>
                                    <h2 class="card-title mb-0">${this.stats.presentDays || 0}</h2>
                                </div>
                                <i class="bi bi-calendar-check display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 col-sm-6 mb-3">
                    <div class="card card-custom bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-subtitle mb-2 opacity-75">Kehadiran</h6>
                                    <h2 class="card-title mb-0">${this.stats.attendancePercentage || 0}%</h2>
                                </div>
                                <i class="bi bi-percent display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 col-sm-6 mb-3">
                    <div class="card card-custom bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-subtitle mb-2 opacity-75">Sisa Cuti</h6>
                                    <h2 class="card-title mb-0">${this.stats.remainingLeave || 0} hari</h2>
                                </div>
                                <i class="bi bi-airplane display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderQuickActions() {
        const actions = [];
        
        if (this.user.profile === 'ADMIN' || this.user.profile === 'HRD') {
            actions.push(
                {
                    icon: 'bi-person-plus',
                    label: 'Tambah Pegawai',
                    color: 'primary',
                    route: '#/pegawai?action=add'
                },
                {
                    icon: 'bi-file-earmark-text',
                    label: 'Buat Laporan',
                    color: 'success',
                    route: '#/laporan'
                },
                {
                    icon: 'bi-calendar-event',
                    label: 'Atur Jadwal',
                    color: 'warning',
                    action: 'schedule'
                },
                {
                    icon: 'bi-gear',
                    label: 'Pengaturan',
                    color: 'secondary',
                    route: '#/profile'
                }
            );
        } else {
            actions.push(
                {
                    icon: 'bi-calendar-plus',
                    label: 'Presensi Masuk',
                    color: 'success',
                    action: 'checkIn'
                },
                {
                    icon: 'bi-calendar-minus',
                    label: 'Presensi Keluar',
                    color: 'warning',
                    action: 'checkOut'
                },
                {
                    icon: 'bi-file-earmark-medical',
                    label: 'Ajukan Izin',
                    color: 'info',
                    action: 'requestLeave'
                },
                {
                    icon: 'bi-person',
                    label: 'Profile Saya',
                    color: 'primary',
                    route: '#/profile'
                }
            );
        }
        
        return actions.map(action => `
            <div class="col-md-3 col-sm-6">
                <a href="${action.route || '#'}" 
                   class="card card-custom text-decoration-none quick-action-card"
                   data-action="${action.action || ''}"
                   style="border-left: 4px solid var(--${action.color});">
                    <div class="card-body text-center py-4">
                        <div class="mb-3">
                            <i class="bi ${action.icon} display-4 text-${action.color}"></i>
                        </div>
                        <h6 class="card-title mb-0">${action.label}</h6>
                    </div>
                </a>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        if (this.recentAttendance.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="bi bi-calendar-x display-1 text-muted"></i>
                    <p class="mt-3 text-muted">Tidak ada aktivitas terbaru</p>
                </div>
            `;
        }
        
        const items = this.recentAttendance.slice(0, 10).map(attendance => {
            const status = attendance.namaStatus 
                ? `<span class="badge bg-warning">${attendance.namaStatus}</span>`
                : attendance.jamMasuk 
                    ? `<span class="badge bg-success">Hadir</span>`
                    : `<span class="badge bg-secondary">-</span>`;
            
            const timeInfo = attendance.jamMasuk 
                ? `<small class="text-muted">${attendance.jamMasuk}${attendance.jamKeluar ? ` - ${attendance.jamKeluar}` : ''}</small>`
                : '';
            
            return `
                <div class="d-flex align-items-center py-3 border-bottom">
                    <div class="flex-shrink-0 me-3">
                        <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" 
                             style="width: 40px; height: 40px;">
                            <i class="bi bi-calendar-day text-primary"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${attendance.namaLengkap || this.user.namaLengkap}</h6>
                                <p class="mb-0 small text-muted">
                                    ${formatDate(attendance.tglAbsensi, 'DD MMMM YYYY')}
                                    ${timeInfo}
                                </p>
                            </div>
                            ${status}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="recent-activity">
                ${items}
            </div>
        `;
    }

    bindEvents() {
        // Refresh attendance button
        const refreshBtn = document.getElementById('refreshAttendance');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadRecentAttendance();
                this.render();
                this.bindEvents();
            });
        }

        // Quick action cards
        document.querySelectorAll('.quick-action-card').forEach(card => {
            const action = card.getAttribute('data-action');
            if (action) {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleQuickAction(action);
                });
            }
        });
    }

    async handleQuickAction(action) {
        switch (action) {
            case 'checkIn':
                await this.handleCheckIn();
                break;
            case 'checkOut':
                await this.handleCheckOut();
                break;
            case 'requestLeave':
                this.requestLeave();
                break;
            case 'schedule':
                // Schedule action
                break;
        }
    }

    async handleCheckIn() {
        try {
            Loading.show('Melakukan presensi masuk...');
            const result = await PresensiAPI.checkIn();
            
            alert.success('Presensi Berhasil', `Jam masuk: ${result.jamMasuk}`);
            await this.loadData();
            this.render();
            this.bindEvents();
        } catch (error) {
            alert.error('Presensi Gagal', error.message || 'Gagal melakukan presensi');
        } finally {
            Loading.hide();
        }
    }

    async handleCheckOut() {
        try {
            Loading.show('Melakukan presensi keluar...');
            const result = await PresensiAPI.checkOut();
            
            alert.success('Presensi Berhasil', `Jam keluar: ${result.jamKeluar}`);
            await this.loadData();
            this.render();
            this.bindEvents();
        } catch (error) {
            alert.error('Presensi Gagal', error.message || 'Gagal melakukan presensi');
        } finally {
            Loading.hide();
        }
    }

    requestLeave() {
        // Show leave request modal
        // Implementation for leave request form
        console.log('Leave request functionality');
    }

    destroy() {
        // Cleanup event listeners if needed
    }
}

export default DashboardPage;