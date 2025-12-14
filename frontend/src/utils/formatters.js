// formatters.js - Data Formatting Utilities

/**
 * Format date from epoch timestamp
 * @param {number} epoch - Epoch timestamp
 * @param {string} format - Date format
 * @returns {string}
 */
export function formatDate(epoch, format = 'DD/MM/YYYY') {
    if (!epoch) return '-';
    
    const date = new Date(epoch * 1000);
    
    const formats = {
        'DD/MM/YYYY': `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
        'YYYY-MM-DD': `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        'DD MMMM YYYY': date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        'HH:mm:ss': `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`,
        'DD/MM/YYYY HH:mm': `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    };
    
    return formats[format] || date.toLocaleDateString();
}

/**
 * Format currency (IDR)
 * @param {number} amount - Amount to format
 * @returns {string}
 */
export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format role badge
 * @param {string} role - User role
 * @returns {string} HTML badge
 */
export function formatRoleBadge(role) {
    const badges = {
        'ADMIN': '<span class="badge bg-danger">Admin</span>',
        'HRD': '<span class="badge bg-warning">HRD</span>',
        'PEGAWAI': '<span class="badge bg-primary">Pegawai</span>',
        'MANAGER': '<span class="badge bg-success">Manager</span>'
    };
    
    return badges[role] || '<span class="badge bg-secondary">Unknown</span>';
}

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string}
 */
export function formatPhone(phone) {
    if (!phone) return '-';
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format: +62 812-3456-7890
    if (cleaned.length === 12) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
    }
    
    // Format: 0812-3456-7890
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    
    // Format: 812-3456-7890
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Format percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {string}
 */
export function formatPercentage(value, total) {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(1)}%`;
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string}
 */
export function getInitials(name) {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
    if (!seconds) return '0 detik';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} detik`);
    
    return parts.join(' ');
}

/**
 * Format relative time
 * @param {number} epoch - Epoch timestamp
 * @returns {string}
 */
export function formatRelativeTime(epoch) {
    if (!epoch) return '';
    
    const now = Math.floor(Date.now() / 1000);
    const diff = now - epoch;
    
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} hari yang lalu`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} bulan yang lalu`;
    
    return `${Math.floor(diff / 31536000)} tahun yang lalu`;
}