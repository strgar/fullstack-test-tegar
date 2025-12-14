import AuthService from './auth.service.js';

class RouterService {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.init();
    }

    /**
     * Initialize router
     */
    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', this.handleRouteChange.bind(this));
        
        // Handle initial route
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.handleRouteChange(), 100);
        });
    }

    /**
     * Add route
     * @param {string} path - Route path
     * @param {Function} handler - Route handler
     * @param {Object} options - Route options
     */
    addRoute(path, handler, options = {}) {
        const route = {
            path: this.normalizePath(path),
            handler,
            authRequired: options.authRequired ?? true,
            roles: options.roles ?? [],
            title: options.title ?? 'HR System'
        };
        
        this.routes.set(route.path, route);
    }

    /**
     * Normalize path
     * @param {string} path - Path to normalize
     * @returns {string}
     */
    normalizePath(path) {
        if (path.startsWith('#')) {
            return path;
        }
        return `#${path}`;
    }

    /**
     * Handle route change
     */
    handleRouteChange() {
        const hash = window.location.hash || '#/';
        const routePath = hash.split('?')[0];
        
        // Find matching route
        let route = this.routes.get(routePath);
        
        if (!route) {
            // Try to find route with parameters
            for (const [path, r] of this.routes) {
                if (this.isRouteMatch(path, routePath)) {
                    route = r;
                    break;
                }
            }
        }
        
        if (route) {
            this.navigateToRoute(route, hash);
        } else {
            // Default to dashboard if authenticated, otherwise login
            if (AuthService.isAuthenticated()) {
                this.navigate('#/dashboard');
            } else {
                this.navigate('#/login');
            }
        }
    }

    /**
     * Check if route matches pattern
     * @param {string} pattern - Route pattern
     * @param {string} path - Current path
     * @returns {boolean}
     */
    isRouteMatch(pattern, path) {
        // Simple pattern matching (could be enhanced for parameters)
        if (pattern.includes(':')) {
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');
            
            if (patternParts.length !== pathParts.length) {
                return false;
            }
            
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    continue;
                }
                if (patternParts[i] !== pathParts[i]) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }

    /**
     * Navigate to route
     * @param {Object} route - Route object
     * @param {string} fullHash - Full hash including query params
     */
    async navigateToRoute(route, fullHash) {
        // Check authentication
        if (route.authRequired && !AuthService.isAuthenticated()) {
            this.navigate('#/login');
            return;
        }

        // Check role permissions
        if (route.roles.length > 0 && !AuthService.hasPermission(route.roles)) {
            this.navigate('#/dashboard');
            return;
        }

        // Extract query parameters
        const queryParams = this.extractQueryParams(fullHash);
        
        // Extract route parameters
        const routeParams = this.extractRouteParams(route.path, fullHash.split('?')[0]);

        // Update document title
        document.title = `${route.title} - HR System`;

        // Call route handler
        try {
            await route.handler({ 
                params: routeParams, 
                query: queryParams,
                route: route.path 
            });
            
            this.currentRoute = route;
            
            // Scroll to top
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error(`Error in route handler for ${route.path}:`, error);
            // You could show an error page here
        }
    }

    /**
     * Extract query parameters
     * @param {string} hash - Hash string
     * @returns {Object}
     */
    extractQueryParams(hash) {
        const params = {};
        const queryString = hash.split('?')[1];
        
        if (queryString) {
            queryString.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                if (key) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
                }
            });
        }
        
        return params;
    }

    /**
     * Extract route parameters
     * @param {string} pattern - Route pattern
     * @param {string} path - Current path
     * @returns {Object}
     */
    extractRouteParams(pattern, path) {
        const params = {};
        
        if (pattern.includes(':')) {
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');
            
            patternParts.forEach((part, index) => {
                if (part.startsWith(':')) {
                    const paramName = part.substring(1);
                    params[paramName] = decodeURIComponent(pathParts[index] || '');
                }
            });
        }
        
        return params;
    }

    /**
     * Navigate to path
     * @param {string} path - Path to navigate to
     * @param {Object} query - Query parameters
     */
    navigate(path, query = {}) {
        const normalizedPath = this.normalizePath(path);
        
        // Build query string
        let queryString = '';
        if (Object.keys(query).length > 0) {
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
            queryString = `?${params.toString()}`;
        }
        
        // Update hash
        window.location.hash = normalizedPath + queryString;
    }

    /**
     * Get current route
     * @returns {Object|null}
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Get query parameter
     * @param {string} key - Parameter key
     * @returns {string|null}
     */
    getQueryParam(key) {
        const hash = window.location.hash;
        const queryString = hash.split('?')[1];
        
        if (queryString) {
            const params = new URLSearchParams(queryString);
            return params.get(key);
        }
        
        return null;
    }

    /**
     * Go back
     */
    goBack() {
        window.history.back();
    }

    /**
     * Go forward
     */
    goForward() {
        window.history.forward();
    }

    /**
     * Replace current route
     * @param {string} path - Path to replace with
     * @param {Object} query - Query parameters
     */
    replace(path, query = {}) {
        const normalizedPath = this.normalizePath(path);
        
        // Build query string
        let queryString = '';
        if (Object.keys(query).length > 0) {
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
            queryString = `?${params.toString()}`;
        }
        
        // Replace hash without adding to history
        window.location.replace(`#${normalizedPath}${queryString}`);
    }
}

// Create singleton instance
const routerService = new RouterService();

export default routerService;