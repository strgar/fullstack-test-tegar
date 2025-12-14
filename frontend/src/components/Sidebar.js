import AuthService from '../services/auth.service.js';

class Sidebar {
    constructor() {
        this.user = AuthService.getUser();
        this.menuItems = this.getMenuItems();
    }

    /**
     * Get menu items based on user role
     * @returns {Array} Menu items
     */
    getMenuItems() {
        const baseItems = [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'bi-speedometer2',
                route: '#/dashboard',
                roles: ['ADMIN', 'HRD', 'PEGAWAI']
            },
            {
                id: 'presensi',
                label: 'Presensi',
                icon: 'bi-calendar-check',
                route: '#/presensi',
                roles: ['ADMIN', 'HRD', 'PEGAWAI']
            },
            {
                id: 'profile',
                label: 'Profile',
                icon: 'bi-person-circle',
                route: '#/profile',
                roles: ['ADMIN', 'HRD', 'PEGAWAI']
            }
        ];

        const adminItems = [
            {
                id: 'pegawai',
                label: 'Data Pegawai',
                icon: 'bi-people',
                route: '#/pegawai',
                roles: ['ADMIN', 'HRD']
            },
            {
                id: 'laporan',
                label: 'Laporan',
                icon: 'bi-file-earmark-text',
                route: '#/laporan',
                roles: ['ADMIN', 'HRD']
            }
        ];

        // Filter items based on user role
        const userRole = this.user?.profile;
        const filteredItems = baseItems.filter(item => 
            item.roles.includes(userRole)
        );

        if (userRole === 'ADMIN' || userRole === 'HRD') {
            filteredItems.splice(1, 0, ...adminItems.filter(item => 
                item.roles.includes(userRole)
            ));
        }

        return filteredItems;
    }

    /**
     * Render sidebar
     * @returns {string} HTML string
     */
    render() {
        if (!this.user) return '';

        const currentRoute = window.location.hash.split('?')[0] || '#/dashboard';
        
        return `
            <div class="sidebar" id="sidebar">
                <div class="p-3">
                    <!-- User Info -->
                    <div class="sidebar-user mb-4 p-3 bg-dark rounded">
                        <div class="d-flex align-items-center">
                            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                                 style="width: 40px; height: 40px;">
                                ${this.user.namaLengkap.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="fw-bold text-white">${this.user.namaLengkap}</div>
                                <small class="text-light opacity-75">${this.user.profile}</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Menu Items -->
                    <h6 class="text-uppercase text-light opacity-50 mb-3">Menu</h6>
                    <div class="sidebar-menu">
                        ${this.menuItems.map(item => `
                            <a href="${item.route}" 
                               class="sidebar-link ${currentRoute === item.route ? 'active' : ''}"
                               data-route="${item.route}">
                                <i class="bi ${item.icon} sidebar-icon"></i>
                                ${item.label}
                            </a>
                        `).join('')}
                    </div>
                    
                    <!-- App Version -->
                    <div class="mt-5 pt-3 border-top border-secondary">
                        <small class="text-light opacity-50">
                            <i class="bi bi-info-circle me-1"></i>
                            HR System v1.0.0
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Menu click handlers
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // Close sidebar on mobile after click
                if (window.innerWidth < 992) {
                    this.toggleSidebar(false);
                }
            });
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const toggleButton = document.getElementById('sidebarToggle');
            
            if (window.innerWidth < 992 && 
                sidebar && 
                !sidebar.contains(e.target) && 
                toggleButton && 
                !toggleButton.contains(e.target)) {
                this.toggleSidebar(false);
            }
        });
    }

    /**
     * Toggle sidebar visibility
     * @param {boolean} show - Whether to show or hide
     */
    toggleSidebar(show = null) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        if (show === null) {
            sidebar.classList.toggle('collapsed');
        } else if (show) {
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.add('collapsed');
        }
    }

    /**
     * Update active menu item
     */
    updateActiveMenuItem() {
        const currentRoute = window.location.hash.split('?')[0] || '#/dashboard';
        
        document.querySelectorAll('.sidebar-link').forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Rerender sidebar
     */
    rerender() {
        this.user = AuthService.getUser();
        this.menuItems = this.getMenuItems();
        
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = this.render();
            this.bindEvents();
            this.updateActiveMenuItem();
        }
    }
}

export default Sidebar;