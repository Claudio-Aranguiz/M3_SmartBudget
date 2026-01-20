/**
 * Menu Module
 * Handles menu navigation, user actions, and page-specific menu functionality
 */

import { Utils } from '../utils/helpers.js';
import { UIManager } from '../utils/ui.js';
import { AuthModule } from './auth.js';
import { StorageManager } from '../data/storage.js';

export class MenuModule {
    constructor() {
        this.isInitialized = false;
        this.currentPage = '';
        this.mobileMenuOpen = false;
        this.auth = new AuthModule();
    }

    /**
     * Initialize menu module
     */
    async init() {
        try {
            console.log('📱 Initializing Menu Module...');
            
            this.detectCurrentPage();
            this.bindEvents();
            this.setActiveNavItem();
            this.loadUserInfo();
            this.initMobileMenu();
            
            this.isInitialized = true;
            console.log('✅ Menu Module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Menu Module:', error);
        }
    }

    /**
     * Detect current page for navigation
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().split('.')[0];
        
        this.currentPage = page || 'index';
        document.body.setAttribute('data-page', this.currentPage);
    }

    /**
     * Bind menu-related events
     */
    bindEvents() {
        // Navigation links
        const navLinks = document.querySelectorAll('.nav__link, .menu__link');
        navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });

        // User menu toggle
        const userMenuToggle = document.querySelector('.user-menu__toggle');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', this.toggleUserMenu.bind(this));
        }

        // User menu actions
        this.bindUserMenuActions();

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.nav__mobile-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Close menu on outside click
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // Alert button (for demo purposes)
        const alertButton = document.querySelector('.menu__alert-button');
        if (alertButton) {
            alertButton.addEventListener('click', this.showAlert.bind(this));
        }

        // Settings button
        const settingsButton = document.querySelector('.menu__settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', this.openSettings.bind(this));
        }
    }

    /**
     * Bind user menu action events
     */
    bindUserMenuActions() {
        const userMenuActions = {
            'profile': this.openProfile.bind(this),
            'settings': this.openSettings.bind(this),
            'help': this.openHelp.bind(this),
            'logout': this.handleLogout.bind(this)
        };

        Object.entries(userMenuActions).forEach(([action, handler]) => {
            const button = document.querySelector(`[data-user-action="${action}"]`);
            if (button) {
                button.addEventListener('click', handler);
            }
        });
    }

    /**
     * Handle navigation clicks
     */
    handleNavigation(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        // Handle external links normally
        if (href?.startsWith('http') || href?.startsWith('#')) {
            return;
        }

        // Handle internal navigation with page transition
        if (href && !href.startsWith('#')) {
            event.preventDefault();
            this.navigateToPage(href);
        }
    }

    /**
     * Navigate to a page with loading state
     */
    async navigateToPage(href) {
        try {
            // Show loading state
            UIManager.showPageLoader();
            
            // Simulate loading time for smooth transition
            await Utils.delay(300);
            
            // Navigate
            window.location.href = href;
        } catch (error) {
            console.error('Navigation error:', error);
            UIManager.hidePageLoader();
        }
    }

    /**
     * Set active navigation item
     */
    setActiveNavItem() {
        const navLinks = document.querySelectorAll('.nav__link, .menu__link');
        
        navLinks.forEach(link => {
            link.classList.remove('nav__link--active', 'menu__link--active');
            
            const href = link.getAttribute('href');
            if (href) {
                const linkPage = href.split('/').pop().split('.')[0];
                
                if (linkPage === this.currentPage || 
                    (this.currentPage === 'index' && linkPage === 'dashboard')) {
                    
                    if (link.classList.contains('nav__link')) {
                        link.classList.add('nav__link--active');
                    } else if (link.classList.contains('menu__link')) {
                        link.classList.add('menu__link--active');
                    }
                }
            }
        });
    }

    /**
     * Load and display user information
     */
    loadUserInfo() {
        const user = StorageManager.getItem('user');
        
        if (user) {
            // Update user name
            const userNameElements = document.querySelectorAll('.user-menu__name, .user__name');
            userNameElements.forEach(element => {
                element.textContent = user.name || 'Usuario';
            });

            // Update user email
            const userEmailElements = document.querySelectorAll('.user-menu__email, .user__email');
            userEmailElements.forEach(element => {
                element.textContent = user.email || '';
            });

            // Update user avatar
            const userAvatarElements = document.querySelectorAll('.user-menu__avatar, .user__avatar');
            userAvatarElements.forEach(element => {
                if (user.avatar) {
                    element.src = user.avatar;
                } else {
                    // Generate initials avatar
                    const initials = this.generateUserInitials(user.name || 'U');
                    this.setAvatarInitials(element, initials);
                }
            });
        }
    }

    /**
     * Generate user initials for avatar
     */
    generateUserInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    }

    /**
     * Set avatar with initials
     */
    setAvatarInitials(element, initials) {
        // Create a canvas to generate initials avatar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 40;
        canvas.height = 40;
        
        // Background
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, 0, 40, 40);
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 20, 20);
        
        element.src = canvas.toDataURL();
    }

    /**
     * Toggle user menu dropdown
     */
    toggleUserMenu(event) {
        event.stopPropagation();
        
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.querySelector('.user-menu__dropdown');
        
        if (!userMenu || !dropdown) return;

        const isOpen = dropdown.classList.contains('user-menu__dropdown--open');
        
        if (isOpen) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }

    /**
     * Open user menu
     */
    openUserMenu() {
        const dropdown = document.querySelector('.user-menu__dropdown');
        const toggle = document.querySelector('.user-menu__toggle');
        
        if (dropdown) {
            dropdown.classList.add('user-menu__dropdown--open');
        }
        
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
        }
    }

    /**
     * Close user menu
     */
    closeUserMenu() {
        const dropdown = document.querySelector('.user-menu__dropdown');
        const toggle = document.querySelector('.user-menu__toggle');
        
        if (dropdown) {
            dropdown.classList.remove('user-menu__dropdown--open');
        }
        
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Initialize mobile menu functionality
     */
    initMobileMenu() {
        // Close mobile menu on resize if window becomes large
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(event) {
        event.stopPropagation();
        
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        const nav = document.querySelector('.nav');
        const toggle = document.querySelector('.nav__mobile-toggle');
        
        if (nav) {
            nav.classList.add('nav--mobile-open');
        }
        
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            toggle.innerHTML = '<i class="lucide-icon" data-lucide="x"></i>';
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        this.mobileMenuOpen = true;

        // Re-initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const nav = document.querySelector('.nav');
        const toggle = document.querySelector('.nav__mobile-toggle');
        
        if (nav) {
            nav.classList.remove('nav--mobile-open');
        }
        
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '<i class="lucide-icon" data-lucide="menu"></i>';
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        this.mobileMenuOpen = false;

        // Re-initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Handle outside clicks to close menus
     */
    handleOutsideClick(event) {
        // Close user menu
        const userMenu = document.querySelector('.user-menu');
        if (userMenu && !userMenu.contains(event.target)) {
            this.closeUserMenu();
        }

        // Close mobile menu on small screens
        const nav = document.querySelector('.nav');
        const mobileToggle = document.querySelector('.nav__mobile-toggle');
        
        if (this.mobileMenuOpen && nav && !nav.contains(event.target) && 
            mobileToggle && !mobileToggle.contains(event.target)) {
            this.closeMobileMenu();
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(event) {
        // Escape key closes menus
        if (event.key === 'Escape') {
            this.closeUserMenu();
            if (this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        }

        // Tab navigation within user menu
        if (event.key === 'Tab') {
            const dropdown = document.querySelector('.user-menu__dropdown--open');
            if (dropdown) {
                this.handleTabNavigation(event, dropdown);
            }
        }
    }

    /**
     * Handle tab navigation within dropdown
     */
    handleTabNavigation(event, dropdown) {
        const focusableElements = dropdown.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * User menu action handlers
     */
    openProfile() {
        Utils.showNotification('Perfil de usuario próximamente', 'info');
        this.closeUserMenu();
    }

    openSettings() {
        Utils.showNotification('Configuración próximamente', 'info');
        this.closeUserMenu();
    }

    openHelp() {
        Utils.showNotification('Centro de ayuda próximamente', 'info');
        this.closeUserMenu();
    }

    async handleLogout() {
        try {
            // Show confirmation
            const confirmed = await UIManager.showConfirmDialog(
                '¿Cerrar sesión?',
                '¿Estás seguro de que deseas cerrar tu sesión?'
            );

            if (confirmed) {
                // Close menu first
                this.closeUserMenu();
                
                // Show loading
                UIManager.showPageLoader('Cerrando sesión...');
                
                // Simulate logout delay
                await Utils.delay(800);
                
                // Perform logout
                this.auth.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
            Utils.showNotification('Error al cerrar sesión', 'error');
        }
    }

    /**
     * Show alert (demo function)
     */
    showAlert() {
        Utils.showNotification('¡Esta es una notificación de demostración!', 'success');
    }

    /**
     * Add menu item programmatically
     */
    addMenuItem(item) {
        const navList = document.querySelector('.nav__list');
        if (!navList || !item) return;

        const menuItem = document.createElement('li');
        menuItem.className = 'nav__item';
        
        menuItem.innerHTML = `
            <a href="${item.href || '#'}" class="nav__link">
                ${item.icon ? `<i class="lucide-icon" data-lucide="${item.icon}"></i>` : ''}
                <span class="nav__link-text">${item.text}</span>
            </a>
        `;

        navList.appendChild(menuItem);

        // Bind navigation event to new item
        const newLink = menuItem.querySelector('.nav__link');
        if (newLink) {
            newLink.addEventListener('click', this.handleNavigation.bind(this));
        }

        // Re-initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Remove menu item
     */
    removeMenuItem(href) {
        const menuLink = document.querySelector(`.nav__link[href="${href}"]`);
        const menuItem = menuLink?.closest('.nav__item');
        
        if (menuItem) {
            menuItem.remove();
        }
    }

    /**
     * Update menu badge
     */
    updateMenuBadge(href, count) {
        const menuLink = document.querySelector(`.nav__link[href="${href}"]`);
        if (!menuLink) return;

        let badge = menuLink.querySelector('.nav__badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'nav__badge';
                menuLink.appendChild(badge);
            }
            badge.textContent = count > 99 ? '99+' : count.toString();
        } else if (badge) {
            badge.remove();
        }
    }

    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Check if mobile menu is open
     */
    isMobileMenuOpen() {
        return this.mobileMenuOpen;
    }

    /**
     * Refresh menu state
     */
    refresh() {
        if (!this.isInitialized) return;
        
        this.setActiveNavItem();
        this.loadUserInfo();
    }

    /**
     * Destroy module and clean up
     */
    destroy() {
        // Close any open menus
        this.closeUserMenu();
        this.closeMobileMenu();
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        this.isInitialized = false;
        this.mobileMenuOpen = false;
    }
}