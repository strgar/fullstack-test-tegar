import Config from '../../config.js';
import { API } from './index.js';

export const AuthAPI = {
    // Initialize system
    async initSystem(data) {
        return await API.request(`${Config.API_BASE}/api/auth/init-data`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // Login
    async login(credentials) {
        return await API.request(`${Config.API_BASE}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Change password
    async changePassword(data) {
        const params = new URLSearchParams({
            passwordAsli: data.passwordAsli,
            passwordBaru1: data.passwordBaru1,
            passwordBaru2: data.passwordBaru2
        });

        return await API.request(
            `${Config.API_BASE}/api/auth/ubah-password-sendiri?${params}`,
            { method: 'POST' }
        );
    },

    // FIX PENTING
    async checkInitialization() {
        const response = await API.request(`${Config.API_BASE}/api/auth/check-init`, {
            method: "GET"
        });

        return response.initialized === true;
    }
};
