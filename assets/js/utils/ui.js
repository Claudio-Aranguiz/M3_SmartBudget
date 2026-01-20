/**
 * UI Manager
 * Handles common UI interactions and components
 */

import { Utils } from './helpers.js';

export class UIManager {
    static initialized = false;
    static loadingInstances = new Map();

    /**
     * Initialize UI Manager
     */
    static init() {
        if (this.initialized) return;

        this.createLoadingOverlay();
        this.bindGlobalEvents();
        this.initialized = true;
    }

    /**
     * Create global loading overlay
     */
    static createLoadingOverlay() {
        if (document.getElementById('globalLoader')) return;

        const loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="global-loader__backdrop"></div>
            <div class="global-loader__content">
                <div class="global-loader__spinner">
                    <div class="spinner"></div>
                </div>
                <div class="global-loader__text">Cargando...</div>
            </div>
        `;

        document.body.appendChild(loader);
    }

    /**
     * Bind global UI events
     */
    static bindGlobalEvents() {
        // Handle form submissions with loading states
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.dataset.noAutoLoader !== 'true') {
                this.setFormLoading(form, true);
            }
        });

        // Handle clicks with loading states
        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-loading-text]');
            if (button) {
                this.setButtonLoading(button, true, button.dataset.loadingText);
            }
        });

        // Handle tooltip triggers
        document.addEventListener('mouseenter', (event) => {
            const element = event.target.closest('[data-tooltip]');
            if (element) {
                this.showTooltip(element);
            }
        }, true);

        document.addEventListener('mouseleave', (event) => {
            const element = event.target.closest('[data-tooltip]');
            if (element) {
                this.hideTooltip();
            }
        }, true);
    }

    /**
     * Show modal
     */
    static showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.classList.add('modal--open');
        document.body.classList.add('modal-open');

        // Focus management
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        return true;
    }

    /**
     * Hide modal
     */
    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.classList.remove('modal--open');
        document.body.classList.remove('modal-open');

        return true;
    }

    /**
     * Show confirmation dialog
     */
    static showConfirmDialog(title, message, options = {}) {
        const {
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning'
        } = options;

        return new Promise((resolve) => {
            // Create confirmation modal if it doesn't exist
            let confirmModal = document.getElementById('confirmationModal');
            
            if (!confirmModal) {
                confirmModal = document.createElement('div');
                confirmModal.id = 'confirmationModal';
                confirmModal.className = 'modal';
                confirmModal.innerHTML = `
                    <div class="modal__backdrop"></div>
                    <div class="modal__container">
                        <div class="modal__dialog modal__dialog--small">
                            <div class="modal__header">
                                <h2 class="modal__title"></h2>
                            </div>
                            <div class="modal__body">
                                <div class="modal__message">
                                    <div class="modal__message-icon">
                                        <i class="lucide-icon" data-lucide="alert-triangle"></i>
                                    </div>
                                    <p class="modal__message-text"></p>
                                </div>
                            </div>
                            <div class="modal__actions">
                                <button class="modal__button modal__button--secondary" data-action="cancel">
                                    ${cancelText}
                                </button>
                                <button class="modal__button modal__button--danger" data-action="confirm">
                                    ${confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(confirmModal);
                
                // Re-initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }

            // Update content
            confirmModal.querySelector('.modal__title').textContent = title;
            confirmModal.querySelector('.modal__message-text').textContent = message;

            // Bind events
            const handleAction = (confirmed) => {
                this.hideModal('confirmationModal');
                resolve(confirmed);
            };

            const cancelButton = confirmModal.querySelector('[data-action="cancel"]');
            const confirmButton = confirmModal.querySelector('[data-action="confirm"]');

            // Remove existing listeners
            cancelButton.replaceWith(cancelButton.cloneNode(true));
            confirmButton.replaceWith(confirmButton.cloneNode(true));

            // Add new listeners
            confirmModal.querySelector('[data-action="cancel"]').addEventListener('click', () => handleAction(false));
            confirmModal.querySelector('[data-action="confirm"]').addEventListener('click', () => handleAction(true));

            // Show modal
            this.showModal('confirmationModal');
        });
    }

    /**
     * Show page loader
     */
    static showPageLoader(text = 'Cargando...') {
        const loader = document.getElementById('globalLoader');
        if (!loader) return;

        loader.querySelector('.global-loader__text').textContent = text;
        loader.classList.add('global-loader--active');
    }

    /**
     * Hide page loader
     */
    static hidePageLoader() {
        const loader = document.getElementById('globalLoader');
        if (!loader) return;

        loader.classList.remove('global-loader--active');
    }

    /**
     * Set button loading state
     */
    static setButtonLoading(button, loading, loadingText = 'Cargando...') {
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
            button.disabled = true;
            button.classList.add('button--loading');
        } else {
            const originalText = button.dataset.originalText || button.textContent;
            button.textContent = originalText;
            button.disabled = false;
            button.classList.remove('button--loading');
            delete button.dataset.originalText;
        }
    }

    /**
     * Set form loading state
     */
    static setFormLoading(form, loading) {
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        
        submitButtons.forEach(button => {
            if (loading) {
                button.dataset.originalText = button.textContent || button.value;
                const loadingText = button.dataset.loadingText || 'Procesando...';
                
                if (button.textContent !== undefined) {
                    button.textContent = loadingText;
                } else {
                    button.value = loadingText;
                }
                
                button.disabled = true;
                button.classList.add('button--loading');
            } else {
                const originalText = button.dataset.originalText;
                
                if (button.textContent !== undefined) {
                    button.textContent = originalText;
                } else {
                    button.value = originalText;
                }
                
                button.disabled = false;
                button.classList.remove('button--loading');
                delete button.dataset.originalText;
            }
        });

        // Disable all form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type !== 'submit') {
                input.disabled = loading;
            }
        });
    }

    /**
     * Show tooltip
     */
    static showTooltip(element) {
        const tooltipText = element.dataset.tooltip;
        if (!tooltipText) return;

        // Remove existing tooltip
        this.hideTooltip();

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'globalTooltip';
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;

        document.body.appendChild(tooltip);

        // Position tooltip
        this.positionTooltip(tooltip, element);
    }

    /**
     * Hide tooltip
     */
    static hideTooltip() {
        const tooltip = document.getElementById('globalTooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * Position tooltip relative to element
     */
    static positionTooltip(tooltip, element) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        const position = element.dataset.tooltipPosition || 'top';
        
        let top, left;
        
        switch (position) {
            case 'bottom':
                top = elementRect.bottom + 8;
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                tooltip.classList.add('tooltip--bottom');
                break;
            case 'left':
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                left = elementRect.left - tooltipRect.width - 8;
                tooltip.classList.add('tooltip--left');
                break;
            case 'right':
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                left = elementRect.right + 8;
                tooltip.classList.add('tooltip--right');
                break;
            default: // top
                top = elementRect.top - tooltipRect.height - 8;
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                tooltip.classList.add('tooltip--top');
        }

        // Adjust if tooltip goes outside viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 8) {
            left = 8;
        } else if (left + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - tooltipRect.width - 8;
        }

        if (top < 8) {
            top = elementRect.bottom + 8;
            tooltip.classList.remove('tooltip--top');
            tooltip.classList.add('tooltip--bottom');
        } else if (top + tooltipRect.height > viewportHeight - 8) {
            top = elementRect.top - tooltipRect.height - 8;
            tooltip.classList.remove('tooltip--bottom');
            tooltip.classList.add('tooltip--top');
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    /**
     * Show loading overlay on element
     */
    static showElementLoader(element, text = 'Cargando...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return false;

        // Remove existing loader
        this.hideElementLoader(element);

        // Create loader
        const loader = document.createElement('div');
        loader.className = 'element-loader';
        loader.innerHTML = `
            <div class="element-loader__backdrop"></div>
            <div class="element-loader__content">
                <div class="element-loader__spinner">
                    <div class="spinner"></div>
                </div>
                <div class="element-loader__text">${Utils.escapeHtml(text)}</div>
            </div>
        `;

        // Position relative if not already
        const position = getComputedStyle(element).position;
        if (position === 'static') {
            element.style.position = 'relative';
            element.dataset.originalPosition = 'static';
        }

        element.appendChild(loader);
        
        const loaderId = Utils.generateId('loader');
        loader.id = loaderId;
        this.loadingInstances.set(element, loaderId);

        return true;
    }

    /**
     * Hide loading overlay on element
     */
    static hideElementLoader(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return false;

        const loaderId = this.loadingInstances.get(element);
        if (loaderId) {
            const loader = document.getElementById(loaderId);
            if (loader) {
                loader.remove();
            }
            this.loadingInstances.delete(element);
        }

        // Restore original position
        if (element.dataset.originalPosition === 'static') {
            element.style.position = 'static';
            delete element.dataset.originalPosition;
        }

        return true;
    }

    /**
     * Animate element entrance
     */
    static animateIn(element, animation = 'fadeIn', duration = 300) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;

        element.style.animationDuration = `${duration}ms`;
        element.classList.add('animate-in', `animate-${animation}`);

        // Clean up after animation
        setTimeout(() => {
            element.classList.remove('animate-in', `animate-${animation}`);
            element.style.animationDuration = '';
        }, duration);
    }

    /**
     * Animate element exit
     */
    static animateOut(element, animation = 'fadeOut', duration = 300) {
        return new Promise((resolve) => {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            
            if (!element) {
                resolve();
                return;
            }

            element.style.animationDuration = `${duration}ms`;
            element.classList.add('animate-out', `animate-${animation}`);

            setTimeout(() => {
                element.classList.remove('animate-out', `animate-${animation}`);
                element.style.animationDuration = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Create progress bar
     */
    static createProgressBar(container, options = {}) {
        const {
            value = 0,
            max = 100,
            showText = true,
            className = ''
        } = options;

        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) return null;

        const progressBar = document.createElement('div');
        progressBar.className = `progress-bar ${className}`;
        progressBar.innerHTML = `
            <div class="progress-bar__track">
                <div class="progress-bar__fill" style="width: ${(value / max) * 100}%"></div>
            </div>
            ${showText ? `<div class="progress-bar__text">${value}%</div>` : ''}
        `;

        container.appendChild(progressBar);
        
        return progressBar;
    }

    /**
     * Update progress bar
     */
    static updateProgressBar(progressBar, value, max = 100) {
        const fill = progressBar.querySelector('.progress-bar__fill');
        const text = progressBar.querySelector('.progress-bar__text');
        
        const percentage = Math.min((value / max) * 100, 100);
        
        if (fill) {
            fill.style.width = `${percentage}%`;
        }
        
        if (text) {
            text.textContent = `${Math.round(percentage)}%`;
        }
    }

    /**
     * Create breadcrumb navigation
     */
    static createBreadcrumb(container, items = []) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) return;

        const breadcrumbHtml = items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return `
                <li class="breadcrumb__item">
                    ${isLast ? 
                        `<span class="breadcrumb__text">${Utils.escapeHtml(item.text)}</span>` :
                        `<a href="${item.href || '#'}" class="breadcrumb__link">${Utils.escapeHtml(item.text)}</a>`
                    }
                    ${!isLast ? '<i class="lucide-icon breadcrumb__separator" data-lucide="chevron-right"></i>' : ''}
                </li>
            `;
        }).join('');

        container.innerHTML = `
            <nav class="breadcrumb" aria-label="Navegación de ruta">
                <ol class="breadcrumb__list">
                    ${breadcrumbHtml}
                </ol>
            </nav>
        `;

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Create tabs component
     */
    static createTabs(container, tabs = [], options = {}) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container) return null;

        const {
            activeTab = 0,
            onChange = () => {}
        } = options;

        const tabsHtml = tabs.map((tab, index) => {
            const isActive = index === activeTab;
            
            return `
                <button class="tabs__tab ${isActive ? 'tabs__tab--active' : ''}" 
                        data-tab-index="${index}"
                        type="button">
                    ${tab.icon ? `<i class="lucide-icon" data-lucide="${tab.icon}"></i>` : ''}
                    <span>${Utils.escapeHtml(tab.label)}</span>
                </button>
            `;
        }).join('');

        const contentHtml = tabs.map((tab, index) => {
            const isActive = index === activeTab;
            
            return `
                <div class="tabs__content ${isActive ? 'tabs__content--active' : ''}" 
                     data-tab-content="${index}">
                    ${tab.content || ''}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="tabs">
                <div class="tabs__nav">
                    ${tabsHtml}
                </div>
                <div class="tabs__panels">
                    ${contentHtml}
                </div>
            </div>
        `;

        // Bind tab events
        const tabButtons = container.querySelectorAll('.tabs__tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabIndex = parseInt(button.dataset.tabIndex);
                this.switchTab(container, tabIndex);
                onChange(tabIndex, tabs[tabIndex]);
            });
        });

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        return container.querySelector('.tabs');
    }

    /**
     * Switch active tab
     */
    static switchTab(tabsContainer, activeIndex) {
        const tabs = tabsContainer.querySelectorAll('.tabs__tab');
        const contents = tabsContainer.querySelectorAll('.tabs__content');

        tabs.forEach((tab, index) => {
            if (index === activeIndex) {
                tab.classList.add('tabs__tab--active');
            } else {
                tab.classList.remove('tabs__tab--active');
            }
        });

        contents.forEach((content, index) => {
            if (index === activeIndex) {
                content.classList.add('tabs__content--active');
            } else {
                content.classList.remove('tabs__content--active');
            }
        });
    }

    /**
     * Highlight text in element
     */
    static highlightText(element, searchTerm) {
        if (!element || !searchTerm) return;

        const text = element.textContent;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        
        element.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
    }

    /**
     * Remove text highlighting
     */
    static removeHighlight(element) {
        if (!element) return;

        const marks = element.querySelectorAll('mark.highlight');
        marks.forEach(mark => {
            mark.outerHTML = mark.textContent;
        });
    }

    /**
     * Check if UI Manager is initialized
     */
    static isInitialized() {
        return this.initialized;
    }
}