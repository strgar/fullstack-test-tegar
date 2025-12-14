// constants.js - Application Constants

export const ROLES = {
    ADMIN: 'ADMIN',
    HRD: 'HRD',
    PEGAWAI: 'PEGAWAI',
    MANAGER: 'MANAGER'
};

export const ATTENDANCE_STATUS = {
    PRESENT: 'Hadir',
    LATE: 'Terlambat',
    PERMIT: 'Izin',
    SICK: 'Sakit',
    LEAVE: 'Cuti',
    BUSINESS_TRIP: 'Dinas Luar'
};

export const GENDER = {
    MALE: 1,
    FEMALE: 2
};

export const EDUCATION_LEVELS = {
    SD: 1,
    SMP: 2,
    SMA: 3,
    D3: 4,
    S1: 5,
    S2: 6,
    S3: 7
};

export const API_STATUS = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
};

export const STORAGE_KEYS = {
    TOKEN: 'hr_system_token',
    USER: 'hr_system_user',
    SETTINGS: 'hr_system_settings',
    LANGUAGE: 'hr_system_language',
    THEME: 'hr_system_theme'
};

export const DATE_FORMATS = {
    DISPLAY_DATE: 'DD MMMM YYYY',
    DISPLAY_TIME: 'HH:mm',
    DISPLAY_DATETIME: 'DD MMMM YYYY HH:mm',
    API_DATE: 'YYYY-MM-DD',
    API_DATETIME: 'YYYY-MM-DD HH:mm:ss'
};

export const FILE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    UPLOAD_PATH: './uploads/'
};

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [5, 10, 25, 50, 100]
};

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

export const LANGUAGES = {
    ID: 'id',
    EN: 'en'
};

export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    NIK: /^[0-9]{16}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};