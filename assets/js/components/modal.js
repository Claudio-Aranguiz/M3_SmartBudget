/**
 * Modal Component
 * Reusable modal system for the application
 */

import { Utils } from '../utils/helpers.js';

export class ModalComponent {
    static activeModals = new Set();
    static initialized = false;

    /**
     * Initialize modal system
     */
    static init() {
        if (this.initialized) return;

        this.bindGlobalEvents();
        this.initialized = true;
    }

    /**
     * Bind global modal events
     */
    static bindGlobalEvents() {
        // Close modals on Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeTopModal();
            }
        });

        // Close modal on backdrop click
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal') || 
                event.target.classList.contains('modal__backdrop')) {
                const modal = event.target.closest('.modal');
                if (modal && !modal.hasAttribute('data-no-backdrop-close')) {
                    this.close(modal.id);
                }
            }
        });
    }

    /**
     * Create modal HTML
     */
    static create(id, options = {}) {
        const {
            title = 'Modal',
            content = '',
            size = 'medium',
            closable = true,
            actions = [],
            noBackdropClose = false,
            className = ''
        } = options;

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal modal--${size} ${className}`;
        
        if (noBackdropClose) {
            modal.setAttribute('data-no-backdrop-close', 'true');
        }

        modal.innerHTML = `
            <div class="modal__backdrop"></div>
            <div class="modal__container">
                <div class="modal__dialog">
                    <div class="modal__header">
                        <h2 class="modal__title">${Utils.escapeHtml(title)}</h2>
                        ${closable ? `
                            <button class="modal__close" type="button" aria-label="Cerrar modal">
                                <i class="lucide-icon" data-lucide="x"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="modal__body">
                        ${content}
                    </div>
                    ${actions.length > 0 ? `
                        <div class="modal__actions">
                            ${actions.map(action => this.createActionButton(action)).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Append to body
        document.body.appendChild(modal);

        // Bind close event if closable
        if (closable) {
            const closeButton = modal.querySelector('.modal__close');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.close(id));
            }
        }

        // Bind action events
        actions.forEach((action, index) => {
            const button = modal.querySelector(`[data-action-index="${index}"]`);
            if (button && action.handler) {
                button.addEventListener('click', (event) => {
                    action.handler(event, modal);
                });
            }
        });

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        return modal;
    }

    /**
     * Create action button HTML
     */
    static createActionButton(action, index) {
        const {
            text = 'Button',
            type = 'secondary',
            handler = null,
            className = ''
        } = action;

        return `
            <button class="modal__button modal__button--${type} ${className}" 
                    type="button"
                    data-action-index="${index}">
                ${Utils.escapeHtml(text)}
            </button>
        `;
    }

    /**
     * Show modal
     */
    static show(id, options = {}) {
        let modal = document.getElementById(id);

        // Create modal if it doesn't exist
        if (!modal && options) {
            modal = this.create(id, options);
        }

        if (!modal) return null;

        // Show modal
        modal.classList.add('modal--open');
        this.activeModals.add(id);

        // Focus management
        this.setFocus(modal);

        // Add body class to prevent scrolling
        document.body.classList.add('modal-open');

        // Update z-index for stacking
        const zIndex = 1000 + this.activeModals.size * 10;
        modal.style.zIndex = zIndex;

        return modal;
    }

    /**
     * Hide modal
     */
    static close(id) {
        const modal = document.getElementById(id);
        if (!modal || !modal.classList.contains('modal--open')) return false;

        // Hide modal
        modal.classList.remove('modal--open');
        this.activeModals.delete(id);

        // Remove body class if no active modals
        if (this.activeModals.size === 0) {
            document.body.classList.remove('modal-open');
        }

        // Restore focus to previously focused element
        this.restoreFocus();

        return true;
    }

    /**
     * Close top modal
     */
    static closeTopModal() {
        if (this.activeModals.size === 0) return false;

        const modals = Array.from(this.activeModals);
        const topModalId = modals[modals.length - 1];
        
        return this.close(topModalId);
    }

    /**
     * Close all modals
     */
    static closeAll() {
        const modalIds = Array.from(this.activeModals);
        modalIds.forEach(id => this.close(id));
        
        return modalIds.length > 0;
    }

    /**
     * Update modal content
     */
    static updateContent(id, content) {
        const modal = document.getElementById(id);
        if (!modal) return false;

        const body = modal.querySelector('.modal__body');
        if (body) {
            body.innerHTML = content;
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Update modal title
     */
    static updateTitle(id, title) {
        const modal = document.getElementById(id);
        if (!modal) return false;

        const titleElement = modal.querySelector('.modal__title');
        if (titleElement) {
            titleElement.textContent = title;
            return true;
        }
        
        return false;
    }

    /**
     * Set modal size
     */
    static setSize(id, size) {
        const modal = document.getElementById(id);
        if (!modal) return false;

        // Remove existing size classes
        modal.classList.remove('modal--small', 'modal--medium', 'modal--large', 'modal--fullscreen');
        
        // Add new size class
        modal.classList.add(`modal--${size}`);
        
        return true;
    }

    /**
     * Create confirmation modal
     */
    static createConfirmation(options = {}) {
        const {
            title = 'Confirmar acción',
            message = '¿Estás seguro de que deseas continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            confirmType = 'danger',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        const id = `confirm-modal-${Date.now()}`;
        
        return this.show(id, {
            title,
            content: `
                <div class="modal__message">
                    <div class="modal__message-icon">
                        <i class="lucide-icon" data-lucide="alert-triangle"></i>
                    </div>
                    <p class="modal__message-text">${Utils.escapeHtml(message)}</p>
                </div>
            `,
            size: 'small',
            actions: [
                {
                    text: cancelText,
                    type: 'secondary',
                    handler: (event, modal) => {
                        onCancel();
                        this.close(id);
                        setTimeout(() => this.destroy(id), 300);
                    }
                },
                {
                    text: confirmText,
                    type: confirmType,
                    handler: (event, modal) => {
                        onConfirm();
                        this.close(id);
                        setTimeout(() => this.destroy(id), 300);
                    }
                }
            ]
        });
    }

    /**
     * Create alert modal
     */
    static createAlert(options = {}) {
        const {
            title = 'Información',
            message = 'Mensaje de alerta',
            type = 'info',
            okText = 'Entendido',
            onOk = () => {}
        } = options;

        const id = `alert-modal-${Date.now()}`;
        const iconMap = {
            'success': 'check-circle',
            'error': 'x-circle',
            'warning': 'alert-triangle',
            'info': 'info'
        };

        return this.show(id, {
            title,
            content: `
                <div class="modal__message modal__message--${type}">
                    <div class="modal__message-icon">
                        <i class="lucide-icon" data-lucide="${iconMap[type] || 'info'}"></i>
                    </div>
                    <p class="modal__message-text">${Utils.escapeHtml(message)}</p>
                </div>
            `,
            size: 'small',
            actions: [
                {
                    text: okText,
                    type: 'primary',
                    handler: (event, modal) => {
                        onOk();
                        this.close(id);
                        setTimeout(() => this.destroy(id), 300);
                    }
                }
            ]
        });
    }

    /**
     * Create loading modal
     */
    static createLoading(options = {}) {
        const {
            title = 'Cargando...',
            message = 'Por favor espera mientras se procesa tu solicitud.',
            showProgress = false,
            progress = 0
        } = options;

        const id = `loading-modal-${Date.now()}`;

        return this.show(id, {
            title,
            content: `
                <div class="modal__loading">
                    <div class="modal__spinner">
                        <div class="spinner"></div>
                    </div>
                    <p class="modal__loading-message">${Utils.escapeHtml(message)}</p>
                    ${showProgress ? `
                        <div class="modal__progress">
                            <div class="modal__progress-bar">
                                <div class="modal__progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="modal__progress-text">${progress}%</span>
                        </div>
                    ` : ''}
                </div>
            `,
            size: 'small',
            closable: false,
            noBackdropClose: true
        });
    }

    /**
     * Update loading progress
     */
    static updateLoadingProgress(id, progress, message = null) {
        const modal = document.getElementById(id);
        if (!modal) return false;

        const progressFill = modal.querySelector('.modal__progress-fill');
        const progressText = modal.querySelector('.modal__progress-text');
        const messageElement = modal.querySelector('.modal__loading-message');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `${progress}%`;
        }

        if (message && messageElement) {
            messageElement.textContent = message;
        }

        return true;
    }

    /**
     * Set modal focus
     */
    static setFocus(modal) {
        // Store previously focused element
        modal.dataset.previousFocus = document.activeElement?.id || '';

        // Focus first focusable element in modal
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    /**
     * Restore focus to previously focused element
     */
    static restoreFocus() {
        if (this.activeModals.size > 0) return; // Don't restore if other modals are open

        const lastModal = document.querySelector('.modal[data-previous-focus]');
        if (lastModal) {
            const previousFocusId = lastModal.dataset.previousFocus;
            const previousElement = document.getElementById(previousFocusId);
            
            if (previousElement) {
                previousElement.focus();
            }
        }
    }

    /**
     * Destroy modal element
     */
    static destroy(id) {
        const modal = document.getElementById(id);
        if (modal) {
            // Ensure modal is closed first
            this.close(id);
            
            // Remove from DOM
            modal.remove();
            return true;
        }
        
        return false;
    }

    /**
     * Check if modal is open
     */
    static isOpen(id) {
        return this.activeModals.has(id);
    }

    /**
     * Get active modals count
     */
    static getActiveCount() {
        return this.activeModals.size;
    }

    /**
     * Get active modal IDs
     */
    static getActiveModals() {
        return Array.from(this.activeModals);
    }

    /**
     * Toggle modal
     */
    static toggle(id, options = {}) {
        if (this.isOpen(id)) {
            return this.close(id);
        } else {
            return this.show(id, options);
        }
    }
}