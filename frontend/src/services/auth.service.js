import { AuthAPI } from '../api/auth.api.js';
import StorageService from './storage.service.js';
import NotificationService from './notification.service.js';
import { validateEmail, validateRequired } from '../utils/validators.js';

class AuthService {

    // =============================
    // Initialize System
    // =============================
    async initializeSystem(data) {
        const result = await AuthAPI.initSystem(data);
        return result;
    }

    // =============================
    // Login
    // =============================
    async login(credentials) {
        if (!validateEmail(credentials.email)) {
            throw new Error("Email tidak valid");
        }
        if (!validateRequired(credentials.password)) {
            throw new Error("Password harus diisi");
        }
        if (!validateRequired(credentials.profile)) {
            throw new Error("Profile harus dipilih");
        }

        const response = await AuthAPI.login(credentials);

        const { token, info } = response.hasil;

        StorageService.setToken(token);
        StorageService.setUser(info);

        return info;
    }

    // =============================
    // Check system initialized
    // =============================
    async checkInitialization() {
        return await AuthAPI.checkInitialization();
    }

    isAuthenticated() {
        return !!StorageService.getToken();
    }

    getUser() {
        return StorageService.getUser();
    }

    hasPermission(roles) {
        const user = this.getUser();
        return roles.includes(user?.profile);
    }

    logout() {
        StorageService.clear();
    }
}

export default new AuthService();
