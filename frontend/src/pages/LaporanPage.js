// LaporanPage.js - Reports Page
import AuthService from '../services/auth.service.js';
import { PegawaiAPI } from '../api/pegawai.api.js';
import { PresensiAPI } from '../api/presensi.api.js';
import Loading from '../components/Loading.js';
import Alert from '../components/Alert.js';
import { formatDate, formatCurrency } from '../utils/formatters.js';

class LaporanPage {
    constructor() {
        this.user = AuthService.getUser();
        this.reportType = 'attendance'; // attendance, employee, summary
        this.filters = {
            tglAwal: null,
            tglAkhir: null,
            departemen: 'all',
            status: 'all'
        };
        this.reportData = [];
        this.summaryStats = {};
        this.employeeList = [];
    }

    async init() {
        await this.loadInitialData();
        this.render();
        this.bindEvents();
    }

    async loadInitialData() {
        Loading.show('Menyiapkan laporan...');
        
        try {
            // Set default date range (last month)
            const now = Math.floor(Date.now() / 1000);
            const lastMonth = now - (30 * 24 * 60 * 60);
            
            this.filters.tglAwal = lastMonth;
            this.filters.tglAkhir = now;
            
            // Load employee list for filters
            this.employeeList = await PegawaiAPI.getAllPegawai();
            
            // Load initial report data
            await this.generateReport();
        } catch (error) {
            console.error('Error loading report data:', error);
            Alert.error('Gagal Memuat Data', 'Tidak dapat memuat data laporan');
        } finally {
            Loading.hide();
        }
    }

    async generateReport() {
        try {
            Loading.show('Membuat laporan...');
            
            switch (this.reportType) {
                case 'attendance':
                    await this.generateAttendanceReport();
                    break;
                case 'employee':
                    await this.generateEmployeeReport();
                    break;
                case 'summary':
                    await this.generateSummaryReport();
                    break;
            }
            
            this.calculateSummaryStats();
        } catch (error) {
            console.error('Error generating report:', error);
            Alert.error('Gagal', 'Tidak dapat membuat laporan');
        } finally {
            Loading.hide();
        }
    }

    async generateAttendanceReport() {
        this.reportData = await PresensiAPI.getAttendanceAdmin(
            this.filters.tglAwal,
            this.filters.tglAkhir
        );
        
        // Apply additional filters
        if (this.filters.departemen !== 'all') {
            // Filter by department
            const employeesInDept = this.employeeList.filter(
                emp => emp.kdDepartemen === parseInt(this.filters.departemen)
            );
            const employeeIds = employeesInDept.map(emp => emp.idUser);
            
            this.reportData = this.reportData.filter(
                att => employeeIds.includes(att.idUser)
            );
        }
        
        if (this.filters.status !== 'all') {
            this.reportData = this.reportData.filter(att => {
                if (this.filters.status === 'hadir') return att.jamMasuk && !att.namaStatus;
                if (this.filters.status === 'tidak_hadir') return att.namaStatus;
                return att.namaStatus === this.filters.status;
            });
        }
        
        // Group by employee and date
        this.reportData.sort((a, b) => {
            if (a.namaLengkap === b.namaLengkap) {
                return b.tglAbsensi - a.tglAbsensi;
            }
            return a.namaLengkap.localeCompare(b.namaLengkap);
        });
    }

    async generateEmployeeReport() {
        // For employee report, show all employees with summary
        this.reportData = this.employeeList;
        
        // Get attendance data for each employee
        const attendancePromises = this.employeeList.map(async (employee) => {
            try {
                const attendance = await PresensiAPI.getAttendanceEmployee(
                    this.filters.tglAwal,
                    this.filters.tglAkhir,
                    employee.idUser
                );
                
                const presentDays = attendance.filter(a => a.jamMasuk && !a.namaStatus).length;
                const absentDays = attendance.filter(a => a.namaStatus).length;
                const totalDays = Math.ceil((this.filters.tglAkhir - this.filters.tglAwal) / (24 * 60 * 60));
                const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
                
                return {
                    ...employee,
                    presentDays,
                    absentDays,
                    totalDays,
                    attendanceRate: Math.round(attendanceRate)
                };
            } catch (error) {
                return {
                    ...employee,
                    presentDays: 0,
                    absentDays: 0,
                    totalDays: 0,
                    attendanceRate: 0
                };
            }
        });
        
        this.reportData = await Promise.all(attendancePromises);
        
        // Apply department filter
        if (this.filters.departemen !== 'all') {
            this.reportData = this.reportData.filter(
                emp => emp.kdDepartemen === parseInt(this.filters.departemen)
            );
        }
    }

    async generateSummaryReport() {
        // Generate summary statistics
        const attendanceData = await PresensiAPI.getAttendanceAdmin(
            this.filters.tglAwal,
            this.filters.tglAkhir
        );
        
        const totalDays = Math.ceil((this.filters.tglAkhir - this.filters.tglAwal) / (24 * 60 * 60));
        const uniqueDays = [...new Set(attendanceData.map(a => a.tglAbsensi))].length;
        
        // Group by employee
        const employeeMap = new Map();
        
        attendanceData.forEach(att => {
            if (!employeeMap.has(att.idUser)) {
                employeeMap.set(att.idUser, {
                    idUser: att.idUser,
                    namaLengkap: att.namaLengkap,
                    presentDays: 0,
                    absentDays: 0,
                    lateDays: 0
                });
            }
            
            const empData = employeeMap.get(att.idUser);
            
            if (att.jamMasuk && !att.namaStatus) {
                empData.presentDays++;
                
                // Check if late (after 9 AM)
                const [hours] = att.jamMasuk.split(':').map(Number);
                if (hours >= 9) {
                    empData.lateDays++;
                }
            } else if (att.namaStatus) {
                empData.absentDays++;
            }
        });
        
        this.reportData = Array.from(employeeMap.values());
        
        // Calculate overall statistics
        const totalEmployees = this.employeeList.length;
        const employeesWithData = this.reportData.length;
        const totalPresentDays = this.reportData.reduce((sum, emp) => sum + emp.presentDays, 0);
        const totalAbsentDays = this.reportData.reduce((sum, emp) => sum + emp.absentDays, 0);
        const totalLateDays = this.reportData.reduce((sum, emp) => sum + emp.lateDays, 0);
        
        this.summaryStats = {
            totalEmployees,
            employeesWithData,
            totalDays,
            uniqueDays,
            totalPresentDays,
            totalAbsentDays,
            totalLateDays,
            averageAttendance: employeesWithData > 0 ? 
                Math.round((totalPresentDays / (employeesWithData * uniqueDays)) * 100) : 0
        };
    }

    calculateSummaryStats() {
        switch (this.reportType) {
            case 'attendance':
                this.summaryStats = {
                    totalRecords: this.reportData.length,
                    uniqueEmployees: [...new Set(this.reportData.map(a => a.idUser))].length,
                    presentCount: this.reportData.filter(a => a.jamMasuk && !a.namaStatus).length,
                    absentCount: this.reportData.filter(a => a.namaStatus).length
                };
                break;
                
            case 'employee':
                this.summaryStats = {
                    totalEmployees: this.reportData.length,
                    averageAttendance: Math.round(
                        this.reportData.reduce((sum, emp) => sum + emp.attendanceRate, 0) / 
                        this.reportData.length
                    ),
                    bestAttendance: Math.max(...this.reportData.map(emp => emp.attendanceRate)),
                    worstAttendance: Math.min(...this.reportData.map(emp => emp.attendanceRate))
                };
                break;
        }
    }

    render() {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;
        
        const dateRangeText = this.getDateRangeText();
        
        pageContainer.innerHTML = `
            <div class="fade-in">
                <!-- Page Header -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2 class="mb-1">Laporan</h2>
                            <p class="text-muted mb-0">Analisis dan statistik kehadiran karyawan</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary" id="exportReportBtn">
                                <i class="bi bi-download me-2"></i>Ekspor
                            </button>
                            <button class="btn btn-primary" id="generateReportBtn">
                                <i class="bi bi-arrow-clockwise me-2"></i>Generate
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Report Type Selector -->
                <div class="card card-custom mb-4">
                    <div class="card-body-custom">
                        <div class="d-flex gap-2 mb-4">
                            <button class="btn ${this.reportType === 'attendance' ? 'btn-primary' : 'btn-outline-primary'}" 
                                    data-report-type="attendance">
                                <i class="bi bi-calendar-check me-2"></i>Laporan Presensi
                            </button>
                            <button class="btn ${this.reportType === 'employee' ? 'btn-primary' : 'btn-outline-primary'}" 
                                    data-report-type="employee">
                                <i class="bi bi-people me-2"></i>Laporan Pegawai
                            </button>
                            <button class="btn ${this.reportType === 'summary' ? 'btn-primary' : 'btn-outline-primary'}" 
                                    data-report-type="summary">
                                <i class="bi bi-bar-chart me-2"></i>Ringkasan Statistik
                            </button>
                        </div>
                        
                        <!-- Filters -->
                        <div class="row g-3">
                            <div class="col-md-3">
                                <label class="form-label-custom">Tanggal Awal</label>
                                <input type="date" 
                                       class="form-control-custom" 
                                       id="dateStart" 
                                       value="${this.filters.tglAwal ? new Date(this.filters.tglAwal * 1000).toISOString().split('T')[0] : ''}">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label-custom">Tanggal Akhir</label>
                                <input type="date" 
                                       class="form-control-custom" 
                                       id="dateEnd" 
                                       value="${this.filters.tglAkhir ? new Date(this.filters.tglAkhir * 1000).toISOString().split('T')[0] : ''}">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label-custom">Departemen</label>
                                <select class="form-control-custom form-select" id="deptFilter">
                                    <option value="all">Semua Departemen</option>
                                    ${this.getDepartmentOptions()}
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label-custom">Status</label>
                                <select class="form-control-custom form-select" id="statusFilter" 
                                        ${this.reportType !== 'attendance' ? 'disabled' : ''}>
                                    <option value="all">Semua Status</option>
                                    <option value="hadir" ${this.filters.status === 'hadir' ? 'selected' : ''}>Hadir</option>
                                    <option value="tidak_hadir" ${this.filters.status === 'tidak_hadir' ? 'selected' : ''}>Tidak Hadir</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Summary Statistics -->
                ${this.renderSummaryStats(dateRangeText)}
                
                <!-- Report Content -->
                <div class="card card-custom">
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-file-earmark-text me-2"></i>
                            ${this.getReportTitle()}
                            <span class="badge bg-primary ms-2">${this.reportData.length} data</span>
                        </h5>
                        <div class="text-muted small">
                            ${dateRangeText}
                        </div>
                    </div>
                    <div class="card-body-custom p-0">
                        ${this.reportData.length === 0 ? this.renderEmptyState() : this.renderReportContent()}
                    </div>
                </div>
            </div>
        `;
    }

    getDepartmentOptions() {
        const departments = [...new Set(this.employeeList.map(emp => emp.namaDepartemen).filter(Boolean))];
        return departments.map(dept => `
            <option value="${dept}" ${this.filters.departemen === dept ? 'selected' : ''}>
                ${dept}
            </option>
        `).join('');
    }

    getDateRangeText() {
        if (!this.filters.tglAwal || !this.filters.tglAkhir) return '';
        
        const startDate = formatDate(this.filters.tglAwal, 'DD MMM YYYY');
        const endDate = formatDate(this.filters.tglAkhir, 'DD MMM YYYY');
        
        return `${startDate} - ${endDate}`;
    }

    getReportTitle() {
        const titles = {
            attendance: 'Laporan Detail Presensi',
            employee: 'Laporan Performa Pegawai',
            summary: 'Ringkasan Statistik'
        };
        return titles[this.reportType] || 'Laporan';
    }

    renderSummaryStats(dateRangeText) {
        if (Object.keys(this.summaryStats).length === 0) return '';
        
        let statsHTML = '';
        
        switch (this.reportType) {
            case 'attendance':
                statsHTML = `
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card card-custom bg-primary text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Total Record</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.totalRecords}</h2>
                                    <small class="opacity-75">${dateRangeText}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-custom bg-success text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Hadir</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.presentCount}</h2>
                                    <small class="opacity-75">${this.summaryStats.totalRecords > 0 ? Math.round((this.summaryStats.presentCount / this.summaryStats.totalRecords) * 100) : 0}%</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-custom bg-warning text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Tidak Hadir</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.absentCount}</h2>
                                    <small class="opacity-75">${this.summaryStats.totalRecords > 0 ? Math.round((this.summaryStats.absentCount / this.summaryStats.totalRecords) * 100) : 0}%</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-custom bg-info text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Pegawai Unik</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.uniqueEmployees}</h2>
                                    <small class="opacity-75">Jumlah individu</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'employee':
                statsHTML = `
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card card-custom bg-primary text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Total Pegawai</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.totalEmployees}</h2>
                                    <small class="opacity-75">Dalam laporan</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-custom bg-success text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Rata-rata Kehadiran</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.averageAttendance || 0}%</h2>
                                    <small class="opacity-75">${dateRangeText}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-custom bg-warning text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Kehadiran Tertinggi</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.bestAttendance || 0}%</h2>
                                    <small class="opacity-75">Prestasi terbaik</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-custom bg-danger text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Kehadiran Terendah</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.worstAttendance || 0}%</h2>
                                    <small class="opacity-75">Perlu perhatian</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'summary':
                statsHTML = `
                    <div class="row mb-4">
                        <div class="col-md-2">
                            <div class="card card-custom bg-primary text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Total Pegawai</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.totalEmployees}</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card card-custom bg-success text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Hari Hadir</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.totalPresentDays}</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card card-custom bg-warning text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Hari Tidak Hadir</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.totalAbsentDays}</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card card-custom bg-danger text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Keterlambatan</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.totalLateDays}</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card card-custom bg-info text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Rata-rata Hadir</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.averageAttendance || 0}%</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card card-custom bg-secondary text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2 opacity-75">Periode</h6>
                                    <h2 class="card-title mb-0">${this.summaryStats.totalDays}</h2>
                                    <small class="opacity-75">hari</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        return statsHTML;
    }

    renderReportContent() {
        switch (this.reportType) {
            case 'attendance':
                return this.renderAttendanceReport();
            case 'employee':
                return this.renderEmployeeReport();
            case 'summary':
                return this.renderSummaryReport();
            default:
                return '';
        }
    }

    renderAttendanceReport() {
        return `
            <div class="table-responsive">
                <table class="table table-custom table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Pegawai</th>
                            <th>Departemen</th>
                            <th>Jam Masuk</th>
                            <th>Jam Keluar</th>
                            <th>Status</th>
                            <th>Durasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.reportData.map(att => {
                            const employee = this.employeeList.find(emp => emp.idUser === att.idUser);
                            const duration = this.calculateDuration(att.jamMasuk, att.jamKeluar);
                            
                            return `
                                <tr>
                                    <td>
                                        <div class="fw-bold">${formatDate(att.tglAbsensi, 'DD/MM/YYYY')}</div>
                                        <small class="text-muted">${formatDate(att.tglAbsensi, 'dddd')}</small>
                                    </td>
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
                                    <td>${employee?.namaDepartemen || '-'}</td>
                                    <td>
                                        ${att.jamMasuk ? `
                                            <span class="badge bg-success">${att.jamMasuk}</span>
                                        ` : '-'}
                                    </td>
                                    <td>
                                        ${att.jamKeluar ? `
                                            <span class="badge bg-warning">${att.jamKeluar}</span>
                                        ` : '-'}
                                    </td>
                                    <td>
                                        ${att.namaStatus ? `
                                            <span class="badge bg-info">${att.namaStatus}</span>
                                        ` : att.jamMasuk ? `
                                            <span class="badge bg-success">Hadir</span>
                                        ` : '-'}
                                    </td>
                                    <td>${duration || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderEmployeeReport() {
        return `
            <div class="table-responsive">
                <table class="table table-custom table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Pegawai</th>
                            <th>Departemen</th>
                            <th>Jabatan</th>
                            <th>Hari Hadir</th>
                            <th>Hari Tidak Hadir</th>
                            <th>Total Hari</th>
                            <th>Presentase Hadir</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.reportData.map(emp => {
                            const attendanceClass = emp.attendanceRate >= 80 ? 'bg-success' : 
                                                  emp.attendanceRate >= 60 ? 'bg-warning' : 'bg-danger';
                            
                            return `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" 
                                                 style="width: 32px; height: 32px;">
                                                ${emp.photo 
                                                    ? `<img src="./uploads/${emp.photo}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">`
                                                    : `<i class="bi bi-person text-muted"></i>`
                                                }
                                            </div>
                                            <div>
                                                <div class="fw-bold">${emp.namaLengkap}</div>
                                                <small class="text-muted">${emp.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${emp.namaDepartemen || '-'}</td>
                                    <td>${emp.namaJabatan || '-'}</td>
                                    <td>
                                        <span class="badge bg-success">${emp.presentDays}</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-warning">${emp.absentDays}</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-info">${emp.totalDays}</span>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                                <div class="progress-bar ${attendanceClass}" 
                                                     style="width: ${emp.attendanceRate}%"></div>
                                            </div>
                                            <span class="fw-bold">${emp.attendanceRate}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge ${attendanceClass}">
                                            ${emp.attendanceRate >= 80 ? 'Baik' : 
                                              emp.attendanceRate >= 60 ? 'Cukup' : 'Kurang'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderSummaryReport() {
        // For summary report, show charts (simplified for now)
        return `
            <div class="card-body-custom">
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="mb-3">Distribusi Kehadiran per Pegawai</h6>
                        <div class="chart-container" style="height: 300px;">
                            ${this.renderAttendanceChart()}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6 class="mb-3">Statistik per Departemen</h6>
                        <div class="chart-container" style="height: 300px;">
                            ${this.renderDepartmentChart()}
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <h6 class="mb-3">Top 5 Pegawai dengan Kehadiran Terbaik</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Peringkat</th>
                                    <th>Nama</th>
                                    <th>Departemen</th>
                                    <th>Hari Hadir</th>
                                    <th>Presentase</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderTopPerformers()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    renderAttendanceChart() {
        // Simple HTML-based chart (in real app, use Chart.js or similar)
        const employees = this.reportData.slice(0, 10); // Show top 10
        const maxDays = Math.max(...employees.map(emp => emp.presentDays), 1);
        
        return `
            <div class="simple-chart">
                ${employees.map((emp, index) => {
                    const width = (emp.presentDays / maxDays) * 100;
                    return `
                        <div class="d-flex align-items-center mb-2">
                            <div class="me-2" style="width: 120px;">
                                <small class="text-truncate d-block">${emp.namaLengkap}</small>
                            </div>
                            <div class="flex-grow-1">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar bg-success" 
                                         style="width: ${width}%"
                                         title="${emp.presentDays} hari">
                                        <span class="small">${emp.presentDays}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderDepartmentChart() {
        // Group by department
        const deptMap = new Map();
        
        this.reportData.forEach(emp => {
            const dept = emp.namaDepartemen || 'Unknown';
            if (!deptMap.has(dept)) {
                deptMap.set(dept, {
                    total: 0,
                    present: 0
                });
            }
            
            const deptData = deptMap.get(dept);
            deptData.total++;
            deptData.present += emp.presentDays;
        });
        
        const departments = Array.from(deptMap.entries());
        
        return `
            <div class="simple-chart">
                ${departments.map(([dept, data]) => {
                    const avgAttendance = data.total > 0 ? Math.round((data.present / (data.total * this.summaryStats.uniqueDays)) * 100) : 0;
                    return `
                        <div class="d-flex align-items-center mb-2">
                            <div class="me-2" style="width: 120px;">
                                <small class="text-truncate d-block">${dept}</small>
                            </div>
                            <div class="flex-grow-1">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar bg-info" 
                                         style="width: ${avgAttendance}%"
                                         title="Rata-rata: ${avgAttendance}%">
                                        <span class="small">${avgAttendance}%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ms-2">
                                <small class="text-muted">${data.total} orang</small>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderTopPerformers() {
        const sorted = [...this.reportData]
            .sort((a, b) => b.presentDays - a.presentDays)
            .slice(0, 5);
        
        return sorted.map((emp, index) => `
            <tr>
                <td>
                    <span class="badge bg-primary">#${index + 1}</span>
                </td>
                <td>${emp.namaLengkap}</td>
                <td>${emp.namaDepartemen || '-'}</td>
                <td>
                    <span class="badge bg-success">${emp.presentDays}</span>
                </td>
                <td>
                    <span class="fw-bold">${Math.round((emp.presentDays / emp.totalDays) * 100)}%</span>
                </td>
            </tr>
        `).join('');
    }

    renderEmptyState() {
        return `
            <div class="text-center py-5">
                <i class="bi bi-file-earmark-x display-1 text-muted"></i>
                <h5 class="mt-3">Tidak ada data laporan</h5>
                <p class="text-muted mb-4">
                    Tidak ada data yang sesuai dengan filter yang dipilih.
                </p>
                <button class="btn btn-outline-primary" id="resetFiltersBtn">
                    <i class="bi bi-arrow-clockwise me-2"></i>Reset Filter
                </button>
            </div>
        `;
    }

    calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return null;
        
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}j ${minutes}m`;
    }

    bindEvents() {
        // Report type selector
        document.querySelectorAll('[data-report-type]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.reportType = e.currentTarget.getAttribute('data-report-type');
                this.currentPage = 1;
                this.generateReport().then(() => {
                    this.render();
                    this.bindEvents();
                });
            });
        });
        
        // Filter inputs
        const dateStart = document.getElementById('dateStart');
        const dateEnd = document.getElementById('dateEnd');
        const deptFilter = document.getElementById('deptFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (dateStart) {
            dateStart.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.filters.tglAwal = Math.floor(new Date(e.target.value).getTime() / 1000);
                }
            });
        }
        
        if (dateEnd) {
            dateEnd.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.filters.tglAkhir = Math.floor(new Date(e.target.value).getTime() / 1000);
                }
            });
        }
        
        if (deptFilter) {
            deptFilter.addEventListener('change', (e) => {
                this.filters.departemen = e.target.value;
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
            });
        }
        
        // Generate report button
        const generateBtn = document.getElementById('generateReportBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateReport().then(() => {
                    this.render();
                    this.bindEvents();
                });
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportReportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }
        
        // Reset filters button
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    async resetFilters() {
        const now = Math.floor(Date.now() / 1000);
        const lastMonth = now - (30 * 24 * 60 * 60);
        
        this.filters = {
            tglAwal: lastMonth,
            tglAkhir: now,
            departemen: 'all',
            status: 'all'
        };
        
        await this.generateReport();
        this.render();
        this.bindEvents();
    }

    exportReport() {
        // Convert report data to CSV
        let csvContent = "data:text/csv;charset=utf-8,";
        
        switch (this.reportType) {
            case 'attendance':
                csvContent += "Tanggal,Pegawai,Departemen,Jam Masuk,Jam Keluar,Status,Durasi\n";
                this.reportData.forEach(att => {
                    const employee = this.employeeList.find(emp => emp.idUser === att.idUser);
                    const duration = this.calculateDuration(att.jamMasuk, att.jamKeluar);
                    const row = [
                        formatDate(att.tglAbsensi, 'DD/MM/YYYY'),
                        att.namaLengkap,
                        employee?.namaDepartemen || '-',
                        att.jamMasuk || '-',
                        att.jamKeluar || '-',
                        att.namaStatus || (att.jamMasuk ? 'Hadir' : '-'),
                        duration || '-'
                    ].map(field => `"${field}"`).join(',');
                    csvContent += row + "\n";
                });
                break;
                
            case 'employee':
                csvContent += "Pegawai,Email,Departemen,Jabatan,Hari Hadir,Hari Tidak Hadir,Total Hari,Presentase,Status\n";
                this.reportData.forEach(emp => {
                    const status = emp.attendanceRate >= 80 ? 'Baik' : 
                                 emp.attendanceRate >= 60 ? 'Cukup' : 'Kurang';
                    const row = [
                        emp.namaLengkap,
                        emp.email,
                        emp.namaDepartemen || '-',
                        emp.namaJabatan || '-',
                        emp.presentDays,
                        emp.absentDays,
                        emp.totalDays,
                        `${emp.attendanceRate}%`,
                        status
                    ].map(field => `"${field}"`).join(',');
                    csvContent += row + "\n";
                });
                break;
        }
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `laporan_${this.reportType}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.success('Berhasil', 'Laporan berhasil diekspor');
    }

    destroy() {
        // Cleanup
    }
}

export default LaporanPage;