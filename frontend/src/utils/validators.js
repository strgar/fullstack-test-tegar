// validators.js - Validation Functions

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function validateEmail(email) {
    if (!email) return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email.trim());
}

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean}
 */
export function validateRequired(value) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
    const errors = [];
    
    if (!password || password.length < 8) {
        errors.push('Password minimal 8 karakter');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Harus mengandung huruf besar');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Harus mengandung huruf kecil');
    }
    
    if (!/\d/.test(password)) {
        errors.push('Harus mengandung angka');
    }
    
    // Optional: special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Disarankan mengandung karakter khusus');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate NIK (Nomor Induk Kependudukan)
 * @param {string} nik - NIK to validate
 * @returns {boolean}
 */
export function validateNIK(nik) {
    if (!nik) return true; // Optional
    
    // NIK should be 16 digits
    if (!/^\d{16}$/.test(nik)) return false;
    
    // Validate province code (first 2 digits should be valid province code in Indonesia)
    const provinceCode = parseInt(nik.substring(0, 2));
    if (provinceCode < 11 || provinceCode > 94) return false;
    
    // Validate regency code (next 2 digits)
    const regencyCode = parseInt(nik.substring(2, 4));
    if (regencyCode < 1 || regencyCode > 99) return false;
    
    // Validate district code (next 2 digits)
    const districtCode = parseInt(nik.substring(4, 6));
    if (districtCode < 1 || districtCode > 99) return false;
    
    // Validate birth date (next 6 digits)
    const birthDatePart = nik.substring(6, 12);
    const day = parseInt(birthDatePart.substring(0, 2));
    const month = parseInt(birthDatePart.substring(2, 4));
    const year = parseInt(birthDatePart.substring(4, 6));
    
    // Day should be 1-31 for male, 41-71 for female
    if (day < 1 || (day > 31 && day < 41) || day > 71) return false;
    
    // Month should be 1-12
    if (month < 1 || month > 12) return false;
    
    // Year should be valid (assuming people born between 1900-2099)
    if (year < 0 || year > 99) return false;
    
    return true;
}

/**
 * Validate phone number (Indonesian format)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export function validatePhone(phone) {
    if (!phone) return true; // Optional
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if starts with Indonesian country code or 0
    if (!cleaned.match(/^(62|0)/)) return false;
    
    // Remove leading 0 or 62
    const withoutPrefix = cleaned.replace(/^(62|0)/, '');
    
    // Should start with 8 and be 9-12 digits total (including 8)
    if (!withoutPrefix.match(/^8[1-9][0-9]{6,9}$/)) return false;
    
    return true;
}

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @returns {boolean}
 */
export function validateDate(date) {
    if (!date) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export function validateURL(url) {
    if (!url) return true; // Optional
    
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate file type
 * @param {File} file - File object
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {boolean}
 */
export function validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) {
    if (!file) return false;
    return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean}
 */
export function validateFileSize(file, maxSize = 5 * 1024 * 1024) {
    if (!file) return false;
    return file.size <= maxSize;
}

/**
 * Validate numeric range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean}
 */
export function validateRange(value, min, max) {
    if (value === undefined || value === null) return false;
    const num = Number(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
}

/**
 * Validate form
 * @param {HTMLFormElement} form - Form element
 * @param {Object} rules - Validation rules
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateForm(form, rules = {}) {
    const errors = {};
    let isValid = true;
    
    Object.keys(rules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        const value = field.value;
        const fieldRules = rules[fieldName];
        
        if (fieldRules.required && !validateRequired(value)) {
            errors[fieldName] = fieldRules.message || 'Field ini wajib diisi';
            isValid = false;
            return;
        }
        
        if (fieldRules.email && !validateEmail(value)) {
            errors[fieldName] = fieldRules.message || 'Format email tidak valid';
            isValid = false;
            return;
        }
        
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors[fieldName] = fieldRules.message || `Minimal ${fieldRules.minLength} karakter`;
            isValid = false;
            return;
        }
        
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors[fieldName] = fieldRules.message || `Maksimal ${fieldRules.maxLength} karakter`;
            isValid = false;
            return;
        }
        
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors[fieldName] = fieldRules.message || 'Format tidak valid';
            isValid = false;
            return;
        }
        
        if (fieldRules.custom && !fieldRules.custom(value)) {
            errors[fieldName] = fieldRules.message || 'Validasi gagal';
            isValid = false;
            return;
        }
    });
    
    return { isValid, errors };
}

/**
 * Validate Indonesian postal code
 * @param {string} postalCode - Postal code
 * @returns {boolean}
 */
export function validatePostalCode(postalCode) {
    if (!postalCode) return true; // Optional
    
    // Indonesian postal codes are 5 digits
    return /^\d{5}$/.test(postalCode);
}

/**
 * Validate username
 * @param {string} username - Username
 * @returns {boolean}
 */
export function validateUsername(username) {
    if (!username) return false;
    
    // Username should be 3-20 characters, letters, numbers, underscore, dot
    // Cannot start or end with dot or underscore
    const pattern = /^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
    
    if (!pattern.test(username)) return false;
    if (username.length < 3 || username.length > 20) return false;
    
    return true;
}

/**
 * Validate equality of two values
 * @param {*} value1 - First value
 * @param {*} value2 - Second value
 * @param {string} message - Error message
 * @returns {Object} { isValid: boolean, message: string }
 */
export function validateEquality(value1, value2, message = 'Nilai tidak sama') {
    const isValid = value1 === value2;
    return {
        isValid,
        message: isValid ? '' : message
    };
}