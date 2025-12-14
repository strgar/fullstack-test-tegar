// auth.store.js - Authentication State Management
import StorageService from '../services/storage.service.js';
import { makeObservable, observable, action, computed } from './observable.js';

class AuthStore {
    user = null;
    token = null;
    isAuthenticated = false;
    isLoading = false;
    error = null;

    constructor() {
        makeObservable(this, {
            user: observable,
            token: observable,
            isAuthenticated: observable,
            isLoading: observable,
            error: observable,
            setUser: action,
            setToken: action,
            setLoading: action,
            setError: action,
            logout: action,
            currentUser: computed,
            userRole: computed
        });

        this.initFromStorage();
    }

    initFromStorage() {
        const storedUser = StorageService.getUser();
        const storedToken = StorageService.getToken();
        
        if (storedUser && storedToken) {
            this.user = storedUser;
            this.token = storedToken;
            this.isAuthenticated = true;
        }
    }

    setUser(user) {
        this.user = user;
        StorageService.setUser(user);
    }

    setToken(token) {
        this.token = token;
        this.isAuthenticated = !!token;
        StorageService.setToken(token);
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
    }

    setError(error) {
        this.error = error;
        
        // Auto clear error after 5 seconds
        if (error) {
            setTimeout(() => {
                this.error = null;
            }, 5000);
        }
    }

    logout() {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        this.error = null;
        StorageService.clear();
    }

    get currentUser() {
        return this.user;
    }

    get userRole() {
        return this.user?.profile || null;
    }

    hasRole(role) {
        if (!this.user) return false;
        return this.user.profile === role;
    }

    hasAnyRole(roles) {
        if (!this.user) return false;
        return roles.includes(this.user.profile);
    }

    // Observable pattern helpers
    subscribe(callback) {
        this.subscribers = this.subscribers || [];
        this.subscribers.push(callback);
        
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    notify() {
        if (this.subscribers) {
            this.subscribers.forEach(callback => callback(this.getState()));
        }
    }

    getState() {
        return {
            user: this.user,
            token: this.token,
            isAuthenticated: this.isAuthenticated,
            isLoading: this.isLoading,
            error: this.error,
            userRole: this.userRole
        };
    }
}

// Create singleton instance
const authStore = new AuthStore();

export default authStore;