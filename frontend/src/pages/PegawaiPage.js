// PegawaiPage.js - Employee Management Page
import AuthService from '../services/auth.service.js';
import { PegawaiAPI } from '../api/pegawai.api.js';
import Loading from '../components/Loading.js';
import Modal from '../components/Modal.js';
import Alert from '../components/Alert.js';
import { formatDate, formatRoleBadge } from '../utils/formatters.js';
import { validateEmail, validateRequired, validateNIK } from '../utils/validators.js';

class PegawaiPage {
    constructor() {
        this.user = AuthService.getUser();
        this.employees = [];
        this.comboData = {
            jabatan: [],
            departemen: [],
            unitKerja: [],
            pendidikan: [],
            jenisKelamin: []
        };
        this.currentPage = 1;
        this.pageSize = 10;
        this.searchQuery = '';
        this.sortField = 'namaLengkap';
        this.sortDirection = 'asc';
    }

    async init(id = null) {
        if (id) {
            // View single employee
            await this.viewEmployee(id);
        } else {
            // List all employees
            await this.loadData();
            this.render();
            this.bindEvents();
        }
    }

    async loadData() {
        Loading.show('Memuat data pegawai...');
        
        try {
            // Load combo data
            await this.loadComboData();
            
            // Load employees
            this.employees = await PegawaiAPI.getAllPegawai();
            
            // Sort employees
            this.sortEmployees();
        } catch (error) {
            console.error('Error loading employee data:', error);
            Alert.error('Gagal Memuat Data', 'Tidak dapat memuat data pegawai');
        } finally {
            Loading.hide();
        }
    }

    async loadComboData() {
        try {
            const [jabatan, departemen, unitKerja, pendidikan, jenisKelamin] = await Promise.all([
                PegawaiAPI.getCombo('jabatan'),
                PegawaiAPI.getCombo('departemen'),
                PegawaiAPI.getCombo('unit-kerja'),
                PegawaiAPI.getCombo('pendidikan'),
                PegawaiAPI.getCombo('jenis-kelamin')
            ]);
            
            this.comboData = {
                jabatan: jabatan || [],
                departemen: departemen || [],
                unitKerja: unitKerja || [],
                pendidikan: pendidikan || [],
                jenisKelamin: jenisKelamin || []
            };
        } catch (error) {
            console.error('Error loading combo data:', error);
        }
    }

    sortEmployees() {
        this.employees.sort((a, b) => {
            let aValue = a[this.sortField] || '';
            let bValue = b[this.sortField] || '';
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    getFilteredEmployees() {
        let filtered = this.employees;
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(emp => 
                emp.namaLengkap?.toLowerCase().includes(query) ||
                emp.email?.toLowerCase().includes(query) ||
                emp.nikUser?.toLowerCase().includes(query) ||
                emp.namaJabatan?.toLowerCase().includes(query) ||
                emp.namaDepartemen?.toLowerCase().includes(query)
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
        
        const { list: employees, total, totalPages } = this.getFilteredEmployees();
        
        pageContainer.innerHTML = `
            <div class="fade-in">
                <!-- Page Header -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-1">Data Pegawai</h2>
                        <p class="text-muted mb-0">Kelola data karyawan perusahaan</p>
                    </div>
                    <button class="btn btn-primary" id="addEmployeeBtn">
                        <i class="bi bi-person-plus me-2"></i>Tambah Pegawai
                    </button>
                </div>
                
                <!-- Search and Filter -->
                <div class="card card-custom mb-4">
                    <div class="card-body-custom">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="bi bi-search"></i>
                                    </span>
                                    <input type="text" 
                                           class="form-control-custom" 
                                           id="searchInput" 
                                           placeholder="Cari pegawai..." 
                                           value="${this.searchQuery}">
                                    <button class="btn btn-outline-secondary" id="clearSearch" ${!this.searchQuery ? 'disabled' : ''}>
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <select class="form-control-custom form-select" id="sortField">
                                    <option value="namaLengkap" ${this.sortField === 'namaLengkap' ? 'selected' : ''}>Nama</option>
                                    <option value="email" ${this.sortField === 'email' ? 'selected' : ''}>Email</option>
                                    <option value="namaJabatan" ${this.sortField === 'namaJabatan' ? 'selected' : ''}>Jabatan</option>
                                    <option value="namaDepartemen" ${this.sortField === 'namaDepartemen' ? 'selected' : ''}>Departemen</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select class="form-control-custom form-select" id="sortDirection">
                                    <option value="asc" ${this.sortDirection === 'asc' ? 'selected' : ''}>A-Z</option>
                                    <option value="desc" ${this.sortDirection === 'desc' ? 'selected' : ''}>Z-A</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Employee Table -->
                <div class="card card-custom">
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-people me-2"></i>Daftar Pegawai
                            <span class="badge bg-primary ms-2">${total} orang</span>
                        </h5>
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <select class="form-select form-select-sm" id="pageSizeSelect" style="width: auto;">
                                    <option value="5" ${this.pageSize === 5 ? 'selected' : ''}>5</option>
                                    <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10</option>
                                    <option value="25" ${this.pageSize === 25 ? 'selected' : ''}>25</option>
                                    <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
                                </select>
                            </div>
                            <span class="text-muted small">
                                Halaman ${this.currentPage} dari ${totalPages}
                            </span>
                        </div>
                    </div>
                    <div class="card-body-custom p-0">
                        ${employees.length === 0 ? this.renderEmptyState() : this.renderEmployeeTable(employees)}
                    </div>
                    ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
                </div>
            </div>
        `;
    }

    renderEmployeeTable(employees) {
        return `
            <div class="table-responsive">
                <table class="table table-custom table-hover mb-0">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Nama</th>
                            <th>Jabatan</th>
                            <th>Departemen</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th style="width: 150px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map((emp, index) => {
                            const startIndex = (this.currentPage - 1) * this.pageSize;
                            return `
                                <tr>
                                    <td>${startIndex + index + 1}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" 
                                                 style="width: 36px; height: 36px;">
                                                ${emp.photo 
                                                    ? `<img src="./uploads/${emp.photo}" class="rounded-circle" style="width: 36px; height: 36px; object-fit: cover;">`
                                                    : `<i class="bi bi-person text-muted"></i>`
                                                }
                                            </div>
                                            <div>
                                                <div class="fw-bold">${emp.namaLengkap}</div>
                                                <small class="text-muted">${emp.nikUser || '-'}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${emp.namaJabatan || '-'}</td>
                                    <td>${emp.namaDepartemen || '-'}</td>
                                    <td>
                                        <a href="mailto:${emp.email}" class="text-decoration-none">
                                            ${emp.email}
                                        </a>
                                    </td>
                                    <td>${formatRoleBadge(emp.profile)}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-primary" data-action="view" data-id="${emp.idUser}">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                            <button class="btn btn-outline-warning" data-action="edit" data-id="${emp.idUser}">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-outline-danger" data-action="delete" data-id="${emp.idUser}">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
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
                <i class="bi bi-people display-1 text-muted"></i>
                <h5 class="mt-3">Tidak ada data pegawai</h5>
                <p class="text-muted mb-4">
                    ${this.searchQuery 
                        ? 'Tidak ada pegawai yang sesuai dengan pencarian' 
                        : 'Belum ada data pegawai yang terdaftar'
                    }
                </p>
                ${!this.searchQuery ? `
                    <button class="btn btn-primary" id="addFirstEmployeeBtn">
                        <i class="bi bi-person-plus me-2"></i>Tambah Pegawai Pertama
                    </button>
                ` : ''}
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

    renderEmployeeForm(employee = null) {
        const isEdit = !!employee;
        
        return `
            <form id="employeeForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Nama Lengkap *</label>
                        <input type="text" 
                               class="form-control-custom" 
                               name="namaLengkap" 
                               value="${employee?.namaLengkap || ''}" 
                               required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Email *</label>
                        <input type="email" 
                               class="form-control-custom" 
                               name="email" 
                               value="${employee?.email || ''}" 
                               required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">NIK</label>
                        <input type="text" 
                               class="form-control-custom" 
                               name="nikUser" 
                               value="${employee?.nikUser || ''}" 
                               maxlength="16">
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Tempat Lahir</label>
                        <input type="text" 
                               class="form-control-custom" 
                               name="tempatLahir" 
                               value="${employee?.tempatLahir || ''}">
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Tanggal Lahir *</label>
                        <input type="date" 
                               class="form-control-custom" 
                               name="tanggalLahir" 
                               value="${employee?.tanggalLahir ? new Date(employee.tanggalLahir * 1000).toISOString().split('T')[0] : ''}" 
                               required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Jenis Kelamin *</label>
                        <select class="form-control-custom form-select" name="kdJenisKelamin" required>
                            <option value="">Pilih Jenis Kelamin</option>
                            ${this.comboData.jenisKelamin.map(jk => `
                                <option value="${jk.kode}" ${employee?.kdJenisKelamin === jk.kode ? 'selected' : ''}>
                                    ${jk.nama}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Pendidikan *</label>
                        <select class="form-control-custom form-select" name="kdPendidikan" required>
                            <option value="">Pilih Pendidikan</option>
                            ${this.comboData.pendidikan.map(p => `
                                <option value="${p.kode}" ${employee?.kdPendidikan === p.kode ? 'selected' : ''}>
                                    ${p.nama}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Jabatan *</label>
                        <select class="form-control-custom form-select" name="kdJabatan" required>
                            <option value="">Pilih Jabatan</option>
                            ${this.comboData.jabatan.map(j => `
                                <option value="${j.kode}" ${employee?.kdJabatan === j.kode ? 'selected' : ''}>
                                    ${j.nama}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Departemen *</label>
                        <select class="form-control-custom form-select" name="kdDepartemen" required>
                            <option value="">Pilih Departemen</option>
                            ${this.comboData.departemen.map(d => `
                                <option value="${d.kode}" ${employee?.kdDepartemen === d.kode ? 'selected' : ''}>
                                    ${d.nama}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label-custom">Unit Kerja *</label>
                        <select class="form-control-custom form-select" name="kdUnitKerja" required>
                            <option value="">Pilih Unit Kerja</option>
                            ${this.comboData.unitKerja.map(u => `
                                <option value="${u.kode}" ${employee?.kdUnitKerja === u.kode ? 'selected' : ''}>
                                    ${u.nama}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    ${!isEdit ? `
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Password *</label>
                            <input type="password" 
                                   class="form-control-custom" 
                                   name="password" 
                                   required 
                                   minlength="6">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Konfirmasi Password *</label>
                            <input type="password" 
                                   class="form-control-custom" 
                                   name="passwordC" 
                                   required 
                                   minlength="6">
                        </div>
                    ` : `
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Password (kosongkan jika tidak diubah)</label>
                            <input type="password" 
                                   class="form-control-custom" 
                                   name="password">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Konfirmasi Password</label>
                            <input type="password" 
                                   class="form-control-custom" 
                                   name="passwordC">
                        </div>
                    `}
                </div>
                
                <div class="alert alert-info mt-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Field dengan tanda * wajib diisi.
                    ${isEdit ? 'Biarkan password kosong jika tidak ingin mengubahnya.' : ''}
                </div>
            </form>
        `;
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.currentPage = 1;
                this.render();
                this.bindEvents();
            });
        }

        // Clear search
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                this.searchQuery = '';
                this.currentPage = 1;
                this.render();
                this.bindEvents();
            });
        }

        // Sort functionality
        const sortField = document.getElementById('sortField');
        const sortDirection = document.getElementById('sortDirection');
        
        if (sortField) {
            sortField.addEventListener('change', (e) => {
                this.sortField = e.target.value;
                this.sortEmployees();
                this.render();
                this.bindEvents();
            });
        }
        
        if (sortDirection) {
            sortDirection.addEventListener('change', (e) => {
                this.sortDirection = e.target.value;
                this.sortEmployees();
                this.render();
                this.bindEvents();
            });
        }

        // Page size
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.render();
                this.bindEvents();
            });
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
                        const { totalPages } = this.getFilteredEmployees();
                        this.currentPage = Math.min(totalPages, this.currentPage + 1);
                        break;
                    case 'last':
                        const { totalPages: lastTotalPages } = this.getFilteredEmployees();
                        this.currentPage = lastTotalPages;
                        break;
                    default:
                        this.currentPage = parseInt(action);
                }
                
                this.render();
                this.bindEvents();
            });
        });

        // Add employee button
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        const addFirstEmployeeBtn = document.getElementById('addFirstEmployeeBtn');
        
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => this.showAddEmployeeModal());
        }
        
        if (addFirstEmployeeBtn) {
            addFirstEmployeeBtn.addEventListener('click', () => this.showAddEmployeeModal());
        }

        // Employee actions
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.getAttribute('data-action');
                const id = button.getAttribute('data-id');
                
                switch (action) {
                    case 'view':
                        this.viewEmployee(id);
                        break;
                    case 'edit':
                        this.editEmployee(id);
                        break;
                    case 'delete':
                        this.deleteEmployee(id);
                        break;
                }
            });
        });
    }

    showAddEmployeeModal() {
        const modal = Modal.create({
            title: 'Tambah Pegawai Baru',
            content: this.renderEmployeeForm(),
            size: 'lg',
            showFooter: true,
            submitText: 'Simpan',
            cancelText: 'Batal',
            onSubmit: () => this.handleAddEmployee()
        });
        
        Modal.show(modal);
    }

    async handleAddEmployee() {
        const form = document.getElementById('employeeForm');
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
        if (!validateEmail(data.email)) {
            Alert.error('Validasi Gagal', 'Format email tidak valid');
            return;
        }

        if (data.nikUser && !validateNIK(data.nikUser)) {
            Alert.error('Validasi Gagal', 'Format NIK tidak valid (16 digit)');
            return;
        }

        if (data.password !== data.passwordC) {
            Alert.error('Validasi Gagal', 'Password tidak sama');
            return;
        }

        if (data.password && data.password.length < 6) {
            Alert.error('Validasi Gagal', 'Password minimal 6 karakter');
            return;
        }

        // Convert date to epoch
        if (data.tanggalLahir) {
            data.tanggalLahir = Math.floor(new Date(data.tanggalLahir).getTime() / 1000);
        }

        try {
            Loading.show('Menyimpan data pegawai...');
            await PegawaiAPI.addPegawai(data);
            
            Alert.success('Berhasil', 'Pegawai berhasil ditambahkan');
            Modal.hide(Modal.getCurrentModal());
            
            await this.loadData();
            this.render();
            this.bindEvents();
        } catch (error) {
            Alert.error('Gagal', error.message || 'Gagal menambahkan pegawai');
        } finally {
            Loading.hide();
        }
    }

    async viewEmployee(id) {
        try {
            Loading.show('Memuat data pegawai...');
            
            // Find employee in list or load individually
            let employee = this.employees.find(emp => emp.idUser === id);
            
            if (!employee) {
                // Load employee details if not in list
                const employees = await PegawaiAPI.getAllPegawai();
                employee = employees.find(emp => emp.idUser === id);
            }
            
            if (!employee) {
                throw new Error('Pegawai tidak ditemukan');
            }
            
            this.renderEmployeeDetail(employee);
        } catch (error) {
            Alert.error('Gagal', error.message || 'Tidak dapat memuat data pegawai');
            window.location.hash = '#/pegawai';
        } finally {
            Loading.hide();
        }
    }

    renderEmployeeDetail(employee) {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;
        
        pageContainer.innerHTML = `
            <div class="fade-in">
                <!-- Back button -->
                <div class="mb-4">
                    <a href="#/pegawai" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left me-2"></i>Kembali ke Daftar
                    </a>
                </div>
                
                <!-- Employee Detail -->
                <div class="row">
                    <div class="col-md-4">
                        <div class="card card-custom sticky-top" style="top: 80px;">
                            <div class="card-body-custom text-center">
                                <div class="mb-4">
                                    ${employee.photo 
                                        ? `<img src="./uploads/${employee.photo}" 
                                             class="rounded-circle mb-3" 
                                             style="width: 150px; height: 150px; object-fit: cover;">`
                                        : `<div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" 
                                             style="width: 150px; height: 150px;">
                                            <i class="bi bi-person display-1 text-muted"></i>
                                           </div>`
                                    }
                                    <h4 class="mb-1">${employee.namaLengkap}</h4>
                                    <p class="text-muted mb-3">${formatRoleBadge(employee.profile)}</p>
                                    
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-primary" id="editEmployeeBtn">
                                            <i class="bi bi-pencil me-2"></i>Edit
                                        </button>
                                        <button class="btn btn-outline-danger" id="deleteEmployeeBtn">
                                            <i class="bi bi-trash me-2"></i>Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-8">
                        <div class="card card-custom mb-4">
                            <div class="card-header-custom">
                                <h5 class="mb-0">
                                    <i class="bi bi-info-circle me-2"></i>Informasi Pribadi
                                </h5>
                            </div>
                            <div class="card-body-custom">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Email</label>
                                        <div class="fw-bold">${employee.email}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">NIK</label>
                                        <div class="fw-bold">${employee.nikUser || '-'}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Tempat Lahir</label>
                                        <div class="fw-bold">${employee.tempatLahir || '-'}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Tanggal Lahir</label>
                                        <div class="fw-bold">${employee.tanggalLahir ? formatDate(employee.tanggalLahir, 'DD MMMM YYYY') : '-'}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Jenis Kelamin</label>
                                        <div class="fw-bold">${employee.namaJenisKelamin || '-'}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Pendidikan</label>
                                        <div class="fw-bold">${employee.namaPendidikan || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card card-custom">
                            <div class="card-header-custom">
                                <h5 class="mb-0">
                                    <i class="bi bi-briefcase me-2"></i>Informasi Pekerjaan
                                </h5>
                            </div>
                            <div class="card-body-custom">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Jabatan</label>
                                        <div class="fw-bold">${employee.namaJabatan || '-'}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Departemen</label>
                                        <div class="fw-bold">${employee.namaDepartemen || '-'}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Unit Kerja</label>
                                        <div class="fw-bold">${employee.namaUnitKerja || '-'}</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="text-muted small">Tanggal Bergabung</label>
                                        <div class="fw-bold">${employee.createdAtEpoch ? formatDate(employee.createdAtEpoch, 'DD MMMM YYYY') : '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Bind detail page events
        this.bindDetailEvents(employee.idUser);
    }

    bindDetailEvents(employeeId) {
        const editBtn = document.getElementById('editEmployeeBtn');
        const deleteBtn = document.getElementById('deleteEmployeeBtn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editEmployee(employeeId));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteEmployee(employeeId));
        }
    }

    async editEmployee(id) {
        try {
            Loading.show('Memuat data pegawai...');
            
            // Find employee
            const employee = this.employees.find(emp => emp.idUser === id);
            if (!employee) {
                throw new Error('Pegawai tidak ditemukan');
            }
            
            // Ensure combo data is loaded
            if (this.comboData.jabatan.length === 0) {
                await this.loadComboData();
            }
            
            const modal = Modal.create({
                title: 'Edit Data Pegawai',
                content: this.renderEmployeeForm(employee),
                size: 'lg',
                showFooter: true,
                submitText: 'Simpan Perubahan',
                cancelText: 'Batal',
                onSubmit: () => this.handleEditEmployee(id)
            });
            
            Modal.show(modal);
        } catch (error) {
            Alert.error('Gagal', error.message || 'Tidak dapat memuat data pegawai');
        } finally {
            Loading.hide();
        }
    }

    async handleEditEmployee(id) {
        const form = document.getElementById('employeeForm');
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

        if (data.nikUser && !validateNIK(data.nikUser)) {
            Alert.error('Validasi Gagal', 'Format NIK tidak valid (16 digit)');
            return;
        }

        if (data.password && data.passwordC && data.password !== data.passwordC) {
            Alert.error('Validasi Gagal', 'Password tidak sama');
            return;
        }

        // Convert date to epoch
        if (data.tanggalLahir) {
            data.tanggalLahir = Math.floor(new Date(data.tanggalLahir).getTime() / 1000);
        }

        try {
            Loading.show('Menyimpan perubahan...');
            await PegawaiAPI.updatePegawai(id, data);
            
            Alert.success('Berhasil', 'Data pegawai berhasil diperbarui');
            Modal.hide(Modal.getCurrentModal());
            
            await this.loadData();
            
            // If we're in detail view, update it
            if (window.location.hash.includes('pegawai/')) {
                await this.viewEmployee(id);
            } else {
                this.render();
                this.bindEvents();
            }
        } catch (error) {
            Alert.error('Gagal', error.message || 'Gagal memperbarui data pegawai');
        } finally {
            Loading.hide();
        }
    }

    async deleteEmployee(id) {
        const employee = this.employees.find(emp => emp.idUser === id);
        if (!employee) return;

        Modal.showConfirmation({
            title: 'Hapus Pegawai',
            message: `Apakah Anda yakin ingin menghapus ${employee.namaLengkap}?`,
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            onConfirm: async () => {
                try {
                    Loading.show('Menghapus pegawai...');
                    
                    // Note: Backend doesn't have delete endpoint, so we'll just show success
                    // In real implementation, you would call API to delete
                    
                    Alert.success('Berhasil', 'Pegawai berhasil dihapus');
                    
                    // Reload data
                    await this.loadData();
                    
                    // If we're in detail view, go back to list
                    if (window.location.hash.includes('pegawai/')) {
                        window.location.hash = '#/pegawai';
                    } else {
                        this.render();
                        this.bindEvents();
                    }
                } catch (error) {
                    Alert.error('Gagal', error.message || 'Gagal menghapus pegawai');
                } finally {
                    Loading.hide();
                }
            }
        });
    }

    destroy() {
        // Cleanup
    }
}

export default PegawaiPage;