class NotificationService {
    constructor() {
        this.containerId = 'notification-container';
        this.initContainer();
        this.notificationQueue = [];
        this.isShowing = false;
    }

    /**
     * Initialize notification container
     */
    initContainer() {
        if (!document.getElementById(this.containerId)) {
            const container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'notification-container';
            
            const style = document.createElement('style');
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    max-width: 400px;
                    width: 100%;
                }
                
                .notification {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    padding: 16px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: flex-start;
                    animation: slideIn 0.3s ease-out;
                    border-left: 4px solid;
                }
                
                .notification.success {
                    border-left-color: #2ecc71;
                }
                
                .notification.error {
                    border-left-color: #e74c3c;
                }
                
                .notification.warning {
                    border-left-color: #f39c12;
                }
                
                .notification.info {
                    border-left-color: #3498db;
                }
                
                .notification-icon {
                    font-size: 20px;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                
                .notification-content {
                    flex-grow: 1;
                }
                
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #2c3e50;
                }
                
                .notification-message {
                    color: #34495e;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #95a5a6;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    margin-left: 8px;
                    flex-shrink: 0;
                }
                
                .notification-close:hover {
                    color: #7f8c8d;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(container);
        }
    }

    /**
     * Show success notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    success(title, message = '', duration = 5000) {
        this.showNotification('success', title, message, duration);
    }

    /**
     * Show error notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    error(title, message = '', duration = 7000) {
        this.showNotification('error', title, message, duration);
    }

    /**
     * Show warning notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    warning(title, message = '', duration = 6000) {
        this.showNotification('warning', title, message, duration);
    }

    /**
     * Show info notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    info(title, message = '', duration = 4000) {
        this.showNotification('info', title, message, duration);
    }

    /**
     * Show notification
     * @param {string} type - Notification type
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(type, title, message, duration) {
        const notification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type,
            title,
            message,
            duration,
            timestamp: new Date()
        };

        this.notificationQueue.push(notification);
        this.processQueue();
    }

    /**
     * Process notification queue
     */
    processQueue() {
        if (this.isShowing || this.notificationQueue.length === 0) {
            return;
        }

        this.isShowing = true;
        const notification = this.notificationQueue.shift();
        this.displayNotification(notification);
    }

    /**
     * Display notification
     * @param {Object} notification - Notification object
     */
    displayNotification(notification) {
        const container = document.getElementById(this.containerId);
        const { id, type, title, message, duration } = notification;

        // Get icon based on type
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        const notificationElement = document.createElement('div');
        notificationElement.id = `notification-${id}`;
        notificationElement.className = `notification ${type}`;
        notificationElement.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                ${message ? `<div class="notification-message">${message}</div>` : ''}
            </div>
            <button class="notification-close" onclick="document.getElementById('notification-${id}').remove();">
                ×
            </button>
        `;

        container.appendChild(notificationElement);

        // Auto remove after duration
        setTimeout(() => {
            if (document.getElementById(`notification-${id}`)) {
                notificationElement.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notificationElement.parentNode) {
                        notificationElement.parentNode.removeChild(notificationElement);
                    }
                }, 300);
            }
        }, duration);

        // Process next notification
        setTimeout(() => {
            this.isShowing = false;
            this.processQueue();
        }, duration + 300);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        this.notificationQueue = [];
        this.isShowing = false;
    }

    /**
     * Show toast notification (simpler version)
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @param {number} duration - Duration in milliseconds
     */
    toast(message, type = 'info', duration = 3000) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #2c3e50;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                animation: toastIn 0.3s ease-out;
            }
            
            .toast-success { background: #2ecc71; }
            .toast-error { background: #e74c3c; }
            .toast-warning { background: #f39c12; }
            .toast-info { background: #3498db; }
            
            @keyframes toastIn {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        
        if (!document.querySelector('#toast-style')) {
            style.id = 'toast-style';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;