// app.js - Main Application Entry Point
import { AuthService, RouterService } from './src/services/index.js';

import LoginPage from './src/pages/LoginPage.js';
import DashboardPage from './src/pages/DashboardPage.js';
import PegawaiPage from './src/pages/PegawaiPage.js';
import PresensiPage from './src/pages/PresensiPage.js';
import ProfilePage from './src/pages/ProfilePage.js';

import Header from './src/components/Header.js';
import Sidebar from './src/components/Sidebar.js';
import Loading from './src/components/Loading.js';

class App {
    constructor() {
        this.header = new Header();
        this.sidebar = new Sidebar();
        this.loading = Loading;
        this.currentPage = null;

        this.init();
    }

    async init() {
        console.log("HR System Starting…");

        this.loading.show("Memuat aplikasi...");

        this.ensureLayout();
        this.setupRouter();

        // ⚠️ JANGAN renderLayout dulu sebelum tahu route
        this.handleInitialRoute();

        setTimeout(() => this.loading.hide(), 300);
    }

    ensureLayout() {
        const app = document.getElementById("app");

        if (!app) {
            console.error("ERROR: <div id='app'> tidak ditemukan");
            return;
        }

        app.innerHTML = `
            <div id="notification-container"></div>

            <div id="main-layout" class="main-layout">
                <header id="header-container"></header>

                <div class="main-content-container">
                    <aside id="sidebar-container"></aside>
                    <main id="page-container" class="page-container"></main>
                </div>

                <footer class="footer-custom">
                    <div class="text-center text-muted py-3">
                        <small>HR System © ${new Date().getFullYear()}</small>
                    </div>
                </footer>
            </div>
        `;
    }

    setupRouter() {
        const router = RouterService;

        router.addRoute('#/login', this.handleLoginRoute.bind(this), {
            authRequired: false,
            title: 'Login'
        });

        router.addRoute('#/dashboard', this.handleDashboardRoute.bind(this), {
            authRequired: true,
            title: 'Dashboard'
        });

        router.addRoute('#/pegawai', this.handlePegawaiRoute.bind(this), {
            authRequired: true,
            roles: ['ADMIN', 'HRD']
        });

        router.addRoute('#/presensi', this.handlePresensiRoute.bind(this), {
            authRequired: true
        });

        router.addRoute('#/profile', this.handleProfileRoute.bind(this), {
            authRequired: true
        });

        router.addRoute('#/', this.handleDefaultRoute.bind(this), {
            authRequired: false
        });
    }

    async renderLayout() {
        const isAuthenticated = AuthService.isAuthenticated();

        // HEADER
        const headerContainer = document.getElementById("header-container");
        headerContainer.innerHTML = this.header.render();
        this.header.bindEvents();

        // SIDEBAR
        const sidebarContainer = document.getElementById("sidebar-container");
        if (isAuthenticated) {
            sidebarContainer.innerHTML = this.sidebar.render();
            this.sidebar.bindEvents();
        } else {
            sidebarContainer.innerHTML = "";
        }
    }

    handleInitialRoute() {
        const hash = window.location.hash;

        if (!hash || hash === "#/" || hash === "") {
            if (AuthService.isAuthenticated()) {
                RouterService.navigate("#/dashboard");
            } else {
                RouterService.navigate("#/login");
            }
        } else {
            RouterService.handleRouteChange();
        }
    }

    // ================= ROUTES =================

    async handleLoginRoute() {
        this.loading.show("Memuat login...");

        await this.renderLayout(); // header without sidebar

        this.currentPage = new LoginPage();
        await this.currentPage.init();

        this.loading.hide();
    }

    async handleDashboardRoute() {
        this.loading.show("Memuat dashboard...");

        await this.renderLayout(); // ✅ sidebar muncul di sini

        this.currentPage = new DashboardPage();
        await this.currentPage.init();

        this.loading.hide();
    }

    async handlePegawaiRoute() {
        this.loading.show("Memuat pegawai...");

        await this.renderLayout();

        this.currentPage = new PegawaiPage();
        await this.currentPage.init();

        this.loading.hide();
    }

    async handlePresensiRoute() {
        this.loading.show("Memuat presensi...");

        await this.renderLayout();

        this.currentPage = new PresensiPage();
        await this.currentPage.init();

        this.loading.hide();
    }

    async handleProfileRoute() {
        this.loading.show("Memuat profil...");

        await this.renderLayout();

        this.currentPage = new ProfilePage();
        await this.currentPage.init();

        this.loading.hide();
    }

    async handleDefaultRoute() {
        if (AuthService.isAuthenticated()) {
            RouterService.navigate("#/dashboard");
        } else {
            RouterService.navigate("#/login");
        }
    }
}

// START APP
const app = new App();
window.app = app;

export default app;
