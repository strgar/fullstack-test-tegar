import Config from '../../config.js';

class StorageService {
    constructor() {
        this.keys = Config.STORAGE_KEYS;
    }

    /**
     * Set authentication token
     * @param {string} token - JWT token
     */
    setToken(token) {
        if (!token) {
            this.removeToken();
            return;
        }
        
        try {
            localStorage.setItem(this.keys.TOKEN, token);
        } catch (error) {
            console.error('Failed to set token:', error);
            sessionStorage.setItem(this.keys.TOKEN, token);
        }
    }

    /**
     * Get authentication token
     * @returns {string|null}
     */
    getToken() {
        try {
            return localStorage.getItem(this.keys.TOKEN) || 
                   sessionStorage.getItem(this.keys.TOKEN);
        } catch (error) {
            console.error('Failed to get token:', error);
            return null;
        }
    }

    /**
     * Remove authentication token
     */
    removeToken() {
        try {
            localStorage.removeItem(this.keys.TOKEN);
            sessionStorage.removeItem(this.keys.TOKEN);
        } catch (error) {
            console.error('Failed to remove token:', error);
        }
    }

    /**
     * Set user data
     * @param {Object} user - User object
     */
    setUser(user) {
        if (!user) {
            this.removeUser();
            return;
        }
        
        try {
            const userData = JSON.stringify(user);
            localStorage.setItem(this.keys.USER, userData);
        } catch (error) {
            console.error('Failed to set user:', error);
            sessionStorage.setItem(this.keys.USER, JSON.stringify(user));
        }
    }

    /**
     * Get user data
     * @returns {Object|null}
     */
    getUser() {
        try {
            const userData = localStorage.getItem(this.keys.USER) || 
                           sessionStorage.getItem(this.keys.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Failed to get user:', error);
            return null;
        }
    }

    /**
     * Remove user data
     */
    removeUser() {
        try {
            localStorage.removeItem(this.keys.USER);
            sessionStorage.removeItem(this.keys.USER);
        } catch (error) {
            console.error('Failed to remove user:', error);
        }
    }

    /**
     * Set application settings
     * @param {Object} settings - Settings object
     */
    setSettings(settings) {
        if (!settings) {
            this.removeSettings();
            return;
        }
        
        try {
            const settingsData = JSON.stringify(settings);
            localStorage.setItem(this.keys.SETTINGS, settingsData);
        } catch (error) {
            console.error('Failed to set settings:', error);
        }
    }

    /**
     * Get application settings
     * @returns {Object|null}
     */
    getSettings() {
        try {
            const settingsData = localStorage.getItem(this.keys.SETTINGS);
            return settingsData ? JSON.parse(settingsData) : null;
        } catch (error) {
            console.error('Failed to get settings:', error);
            return null;
        }
    }

    /**
     * Remove application settings
     */
    removeSettings() {
        try {
            localStorage.removeItem(this.keys.SETTINGS);
        } catch (error) {
            console.error('Failed to remove settings:', error);
        }
    }

    /**
     * Clear all storage
     */
    clear() {
        this.removeToken();
        this.removeUser();
        this.removeSettings();
    }

    /**
     * Check if storage is available
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage usage
     * @returns {Object}
     */
    getUsage() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length * 2; // UTF-16
                }
            }
            return {
                used: total,
                limit: 5 * 1024 * 1024, // 5MB typical limit
                percent: (total / (5 * 1024 * 1024)) * 100
            };
        } catch (error) {
            return { used: 0, limit: 0, percent: 0 };
        }
    }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;