// Configuration management
const Config = {
    // API Configuration
    API_BASE: import.meta.env?.API_BASE || 'http://localhost:8080',
    API_TIMEOUT: 30000,
    
    // Application Configuration
    APP_NAME: 'HR System',
    APP_VERSION: '1.0.0',
    
    // Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'hr_system_token',
        USER: 'hr_system_user',
        SETTINGS: 'hr_system_settings'
    },
    
    // Routes
    ROUTES: {
        LOGIN: '/#/login',
        DASHBOARD: '/#/dashboard',
        PEGAWAI: '/#/pegawai',
        PRESENSI: '/#/presensi',
        PROFILE: '/#/profile',
        LAPORAN: '/#/laporan'
    },
    
    // Security
    TOKEN_REFRESH_INTERVAL: 600000, // 10 minutes
    
    // UI Configuration
    DEFAULT_PAGE_SIZE: 10,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    
    // Environment
    get isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    },
    
    get isProduction() {
        return !this.isDevelopment;
    }
};

export default Config;