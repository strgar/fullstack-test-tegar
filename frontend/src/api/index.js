// API Index - Exports all API modules
export { AuthAPI } from './auth.api.js';
export { PegawaiAPI } from './pegawai.api.js';
export { PresensiAPI } from './presensi.api.js';

// src/api/index.js
export const API = {
    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(endpoint, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'API Error');
            }

            return data;
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    }
};
    

// Custom API Error class
class APIError extends Error {
    constructor(message, status = 500, errors = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            errors: this.errors,
            timestamp: this.timestamp
        };
    }
}

export { APIError };