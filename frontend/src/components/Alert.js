// Alert.js - Alert Component
class Alert {
    constructor() {
        this.containerId = 'alert-container';
        this.initContainer();
    }

    initContainer() {
        if (!document.getElementById(this.containerId)) {
            const container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'alert-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9997;
                max-width: 400px;
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
    }

    show(type, title, message, duration = 5000) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Get icon based on type
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        const alertElement = document.createElement('div');
        alertElement.id = alertId;
        alertElement.className = 'alert-message';
        alertElement.style.cssText = `
            background: white;
            border-left: 4px solid ${colors[type]};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px;
            display: flex;
            align-items: flex-start;
            animation: slideInRight 0.3s ease-out;
            position: relative;
            overflow: hidden;
        `;

        alertElement.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${colors[type]}20;
                color: ${colors[type]};
                font-size: 14px;
                font-weight: bold;
                margin-right: 12px;
                flex-shrink: 0;
            ">${icons[type]}</div>
            <div style="flex: 1">
                <div style="
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #2c3e50;
                    font-size: 14px;
                ">${title}</div>
                ${message ? `<div style="
                    color: #7f8c8d;
                    font-size: 13px;
                    line-height: 1.5;
                ">${message}</div>` : ''}
            </div>
            <button onclick="document.getElementById('${alertId}').remove()" style="
                background: none;
                border: none;
                color: #bdc3c7;
                cursor: pointer;
                font-size: 20px;
                padding: 0;
                margin-left: 8px;
                line-height: 1;
                transition: color 0.3s;
                flex-shrink: 0;
            ">&times;</button>
            <div class="alert-progress" style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: ${colors[type]};
                transform: translateX(-100%);
                animation: progress ${duration}ms linear forwards;
            "></div>
        `;

        container.appendChild(alertElement);

        // Add animations
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                @keyframes progress {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Auto remove
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.parentNode.removeChild(alert);
                    }
                }, 300);
            }
        }, duration);

        return alertId;
    }

    success(title, message = '', duration = 5000) {
        return this.show('success', title, message, duration);
    }

    error(title, message = '', duration = 7000) {
        return this.show('error', title, message, duration);
    }

    warning(title, message = '', duration = 6000) {
        return this.show('warning', title, message, duration);
    }

    info(title, message = '', duration = 4000) {
        return this.show('info', title, message, duration);
    }

    remove(alertId) {
        const alert = document.getElementById(alertId);
        if (alert && alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }

    clearAll() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Create singleton instance
const alert = new Alert();

export default alert;