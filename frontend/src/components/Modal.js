// Modal.js - Modal Component
class Modal {
    constructor() {
        this.modals = new Map();
        this.currentModalId = null;
    }

    create(options = {}) {
        const {
            id = `modal-${Date.now()}`,
            title = 'Modal',
            content = '',
            size = 'md', // sm, md, lg, xl
            showClose = true,
            backdrop = true,
            keyboard = true,
            onClose = null,
            onSubmit = null,
            submitText = 'Simpan',
            cancelText = 'Batal',
            showFooter = true,
            showHeader = true
        } = options;

        if (this.modals.has(id)) {
            this.show(id);
            return id;
        }

        const modalElement = document.createElement('div');
        modalElement.id = id;
        modalElement.className = 'modal-custom';
        modalElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9990;
            padding: 20px;
            backdrop-filter: blur(5px);
        `;

        // Size classes
        const sizeClasses = {
            sm: 'max-width: 400px;',
            md: 'max-width: 500px;',
            lg: 'max-width: 800px;',
            xl: 'max-width: 1140px;'
        };

        modalElement.innerHTML = `
            <div class="modal-content-custom" style="
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: zoomIn 0.3s ease;
                ${sizeClasses[size] || sizeClasses.md}
            ">
                ${showHeader ? `
                <div class="modal-header-custom" style="
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <h5 class="modal-title-custom" style="
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #2c3e50;
                    ">${title}</h5>
                    ${showClose ? `
                    <button type="button" class="modal-close-custom" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        color: #95a5a6;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                        transition: color 0.3s;
                    ">&times;</button>
                    ` : ''}
                </div>
                ` : ''}
                
                <div class="modal-body-custom" style="padding: 20px;">
                    ${content}
                </div>
                
                ${showFooter ? `
                <div class="modal-footer-custom" style="
                    padding: 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                ">
                    <button type="button" class="btn btn-secondary" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 6px;
                        background: #95a5a6;
                        color: white;
                        cursor: pointer;
                        transition: background 0.3s;
                    ">${cancelText}</button>
                    ${onSubmit ? `
                    <button type="button" class="btn btn-primary" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 6px;
                        background: #4361ee;
                        color: white;
                        cursor: pointer;
                        transition: background 0.3s;
                    ">${submitText}</button>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `;

        // Add animations if not exists
        if (!document.querySelector('#modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                @keyframes zoomIn {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes zoomOut {
                    from {
                        transform: scale(1);
                        opacity: 1;
                    }
                    to {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modalElement);
        
        // Store modal data
        this.modals.set(id, {
            element: modalElement,
            options,
            onClose,
            onSubmit
        });

        // Bind events
        this.bindEvents(id);

        // Handle keyboard close
        if (keyboard) {
            this.bindKeyboardEvents(id);
        }

        // Handle backdrop click
        if (backdrop) {
            modalElement.addEventListener('click', (e) => {
                if (e.target === modalElement) {
                    this.hide(id);
                }
            });
        }

        return id;
    }

    bindEvents(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const { element, onClose, onSubmit } = modalData;

        // Close button
        const closeBtn = element.querySelector('.modal-close-custom');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(modalId);
                if (onClose) onClose();
            });
        }

        // Cancel button
        const cancelBtn = element.querySelector('.btn-secondary');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hide(modalId);
                if (onClose) onClose();
            });
        }

        // Submit button
        const submitBtn = element.querySelector('.btn-primary');
        if (submitBtn && onSubmit) {
            submitBtn.addEventListener('click', () => {
                onSubmit();
                this.hide(modalId);
            });
        }
    }

    bindKeyboardEvents(modalId) {
        const keyHandler = (e) => {
            if (e.key === 'Escape' && this.currentModalId === modalId) {
                this.hide(modalId);
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        
        // Store handler for cleanup
        const modalData = this.modals.get(modalId);
        if (modalData) {
            modalData.keyHandler = keyHandler;
        }
    }

    show(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const { element } = modalData;
        
        // Hide current modal if exists
        if (this.currentModalId && this.currentModalId !== modalId) {
            this.hide(this.currentModalId);
        }

        element.style.display = 'flex';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
        
        this.currentModalId = modalId;
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }

    hide(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const { element, keyHandler } = modalData;
        
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
            
            if (this.currentModalId === modalId) {
                this.currentModalId = null;
                
                // Enable body scroll if no modal is open
                if (this.currentModalId === null) {
                    document.body.style.overflow = '';
                }
            }
            
            // Remove keyboard handler
            if (keyHandler) {
                document.removeEventListener('keydown', keyHandler);
            }
        }, 300);
    }

    destroy(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const { element, keyHandler } = modalData;
        
        // Hide first
        this.hide(modalId);
        
        // Remove from DOM
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            // Remove keyboard handler
            if (keyHandler) {
                document.removeEventListener('keydown', keyHandler);
            }
            
            // Remove from map
            this.modals.delete(modalId);
        }, 350);
    }

    updateContent(modalId, content) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const modalBody = modalData.element.querySelector('.modal-body-custom');
        if (modalBody) {
            modalBody.innerHTML = content;
        }
    }

    updateTitle(modalId, title) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const modalTitle = modalData.element.querySelector('.modal-title-custom');
        if (modalTitle) {
            modalTitle.textContent = title;
        }
    }

    getCurrentModal() {
        return this.currentModalId;
    }

    showConfirmation(options = {}) {
        const {
            title = 'Konfirmasi',
            message = 'Apakah Anda yakin?',
            confirmText = 'Ya',
            cancelText = 'Tidak',
            onConfirm = null,
            onCancel = null
        } = options;

        const modalId = this.create({
            title,
            content: `
                <div style="text-align: center; padding: 20px 0;">
                    <div style="
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: rgba(52, 152, 219, 0.1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                        color: #3498db;
                        font-size: 24px;
                    ">
                        ?
                    </div>
                    <p style="
                        margin: 0;
                        font-size: 16px;
                        color: #2c3e50;
                        line-height: 1.5;
                    ">${message}</p>
                </div>
            `,
            showHeader: true,
            showFooter: true,
            submitText: confirmText,
            cancelText,
            onClose: onCancel,
            onSubmit: onConfirm
        });

        this.show(modalId);
        return modalId;
    }

    showForm(options = {}) {
        const {
            title = 'Form',
            formId = 'modal-form',
            fields = [],
            onSubmit = null
        } = options;

        let formHTML = `<form id="${formId}">`;
        
        fields.forEach(field => {
            const { type, name, label, value = '', placeholder = '', required = false } = field;
            
            formHTML += `
                <div style="margin-bottom: 15px;">
                    <label style="
                        display: block;
                        margin-bottom: 5px;
                        font-weight: 500;
                        color: #2c3e50;
                    ">${label}${required ? ' *' : ''}</label>
            `;
            
            if (type === 'textarea') {
                formHTML += `
                    <textarea name="${name}" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        font-family: inherit;
                        resize: vertical;
                    " placeholder="${placeholder}">${value}</textarea>
                `;
            } else {
                formHTML += `
                    <input type="${type}" name="${name}" value="${value}" 
                           placeholder="${placeholder}" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        font-family: inherit;
                    " ${required ? 'required' : ''}>
                `;
            }
            
            formHTML += `</div>`;
        });
        
        formHTML += `</form>`;

        const modalId = this.create({
            title,
            content: formHTML,
            onSubmit: () => {
                const form = document.getElementById(formId);
                if (form && form.checkValidity()) {
                    const formData = new FormData(form);
                    const data = {};
                    formData.forEach((value, key) => {
                        data[key] = value;
                    });
                    
                    if (onSubmit) {
                        onSubmit(data);
                    }
                    return true;
                }
                return false;
            }
        });

        this.show(modalId);
        return modalId;
    }
}

// Create singleton instance
const modal = new Modal();

export default modal;