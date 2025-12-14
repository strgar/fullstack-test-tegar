import AuthService from '../services/auth.service.js';
import NotificationService from '../services/notification.service.js';
import { formatRoleBadge } from '../utils/formatters.js';

class Header {
    constructor() {
        this.user = AuthService.getUser();
    }

    /**
     * Render header
     * @returns {string} HTML string
     */
    render() {
        if (!this.user) {
            return this.renderLoginHeader();
        }
        
        return this.renderAppHeader();
    }

    /**
     * Render login header
     * @returns {string} HTML string
     */
    renderLoginHeader() {
        return `
            <nav class="navbar navbar-custom">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">
                        <i class="bi bi-people-fill me-2"></i>HR System
                    </a>
                    <div class="d-flex align-items-center">
                        <span class="text-muted me-3">Silakan login</span>
                    </div>
                </div>
            </nav>
        `;
    }

    /**
     * Render application header
     * @returns {string} HTML string
     */
    renderAppHeader() {
        const { namaLengkap, profile } = this.user;
        const roleBadge = formatRoleBadge(profile);
        
        return `
            <nav class="navbar navbar-custom">
                <div class="container-fluid">
                    <!-- Sidebar Toggle Button -->
                    <button class="btn btn-outline-secondary me-3 d-lg-none" id="sidebarToggle">
                        <i class="bi bi-list"></i>
                    </button>
                    
                    <!-- Brand -->
                    <a class="navbar-brand" href="#/dashboard">
                        <i class="bi bi-people-fill me-2"></i>HR System
                    </a>
                    
                    <!-- User Info -->
                    <div class="d-flex align-items-center">
                        <div class="me-3 d-none d-md-block text-end">
                            <div class="fw-bold">${namaLengkap}</div>
                            <div class="small">${roleBadge}</div>
                        </div>
                        
                        <!-- Logout Button -->
                        <button class="btn btn-outline-danger btn-sm" id="logoutButton">
                            <i class="bi bi-box-arrow-right me-1"></i>Logout
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar);
        }

        // Logout button
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', this.handleLogout);
        }
    }

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            AuthService.logout();
            window.location.hash = '#/login';
        }
    }

    /**
     * Update user info
     */
    updateUserInfo() {
        this.user = AuthService.getUser();
        this.rerender();
    }

    /**
     * Rerender header
     */
    rerender() {
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = this.render();
            this.bindEvents();
        }
    }
}

export default Header;