// helpers.js - Helper Functions

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function}
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object}
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean}
 */
export function isEmpty(obj) {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return !obj;
}

/**
 * Generate unique ID
 * @param {number} length - Length of ID
 * @returns {string}
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object}
 */
export function parseQueryString(queryString) {
    const params = {};
    if (!queryString) return params;
    
    queryString.replace(/^\?/, '').split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    
    return params;
}

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string}
 */
export function buildQueryString(params) {
    if (!params || isEmpty(params)) return '';
    
    const queryParts = [];
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    });
    
    return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
}

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string}
 */
export function getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
}

/**
 * Check if running on mobile
 * @returns {boolean}
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Download file
 * @param {string} data - File data
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export function downloadFile(data, filename, type = 'application/octet-stream') {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random color
 * @returns {string}
 */
export function generateRandomColor() {
    const colors = [
        '#4361ee', '#3a0ca3', '#7209b7', '#f72585',
        '#2ecc71', '#e74c3c', '#f39c12', '#3498db',
        '#9b59b6', '#1abc9c', '#d35400', '#c0392b'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Format error message
 * @param {Error|string} error - Error object or message
 * @returns {string}
 */
export function formatErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.statusText) return error.statusText;
    return 'Terjadi kesalahan yang tidak diketahui';
}

/**
 * Validate Indonesian phone number
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export function isValidIndonesianPhone(phone) {
    const pattern = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return pattern.test(phone.replace(/\D/g, ''));
}

/**
 * Get month name
 * @param {number} month - Month number (0-11)
 * @param {string} locale - Locale
 * @returns {string}
 */
export function getMonthName(month, locale = 'id-ID') {
    const date = new Date();
    date.setMonth(month);
    return date.toLocaleDateString(locale, { month: 'long' });
}

/**
 * Calculate age from birth date
 * @param {number} birthDateEpoch - Birth date in epoch
 * @returns {number}
 */
export function calculateAge(birthDateEpoch) {
    if (!birthDateEpoch) return 0;
    
    const birthDate = new Date(birthDateEpoch * 1000);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}