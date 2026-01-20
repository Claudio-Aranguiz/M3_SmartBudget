/**
 * SmartBudget Application
 * Main application orchestrator that manages all modules and handles initialization
 */

// Import all modules and dependencies
import { DashboardModule } from './modules/dashboard.js';
import { HistorialModule } from './modules/historial.js';
import { AuthModule } from './modules/auth.js';
import { MenuModule } from './modules/menu.js';
import { ChartComponent } from './components/charts.js';
import { TransactionComponent } from './components/transaction.js';
import { ModalComponent } from './components/modal.js';
import { Utils } from './utils/helpers.js';
import { UIManager } from './utils/ui.js';
import { TransactionManager } from './data/transactions.js';
import { StorageManager } from './data/storage.js';

/**
 * SmartBudget Application Class
 * Orchestrates all modules and components
 */
class SmartBudgetApp {
    constructor() {
        this.modules = {};
        this.components = {};
        this.currentPage = this.getCurrentPage();
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log(`🚀 Initializing SmartBudget for page: ${this.currentPage}`);
            
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize page-specific modules
            await this.initializePageModules();
            
            // Initialize global components
            await this.initializeComponents();
            
            // Bind global events
            this.bindGlobalEvents();
            
            this.isInitialized = true;
            console.log(`✅ SmartBudget initialized successfully for page: ${this.currentPage}`);
        } catch (error) {
            console.error('❌ Error initializing SmartBudget:', error);
        }
    }

    /**
     * Initialize core utilities and systems
     */
    async initializeCore() {
        // Initialize storage manager
        StorageManager.init();
        
        // Initialize transaction data
        TransactionManager.init();
        
        // Initialize UI manager
        UIManager.init();
        
        // Initialize modal system
        ModalComponent.init();
        
        // Initialize Lucide icons (global)
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Initialize Bootstrap components if available
        if (typeof bootstrap !== 'undefined') {
            // Initialize Bootstrap tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }

        console.log('🛠️ Core systems initialized');
    }

    /**
     * Initialize page-specific modules based on current page
     */
    async initializePageModules() {
        console.log(`📄 Initializing modules for page: ${this.currentPage}`);
        
        switch (this.currentPage) {
            case 'dashboard':
                this.modules.dashboard = new DashboardModule();
                await this.modules.dashboard.init();
                
                // Initialize menu for dashboard
                this.modules.menu = new MenuModule();
                await this.modules.menu.init();
                break;
                
            case 'historial':
                this.modules.historial = new HistorialModule();
                await this.modules.historial.init();
                
                // Initialize menu for historial
                this.modules.menu = new MenuModule();
                await this.modules.menu.init();
                break;
                
            case 'login':
                this.modules.auth = new AuthModule();
                await this.modules.auth.init();
                break;
                
            case 'menu':
                this.modules.menu = new MenuModule();
                await this.modules.menu.init();
                break;
                
            case 'index':
                // Landing page - minimal initialization
                console.log('🏠 Landing page loaded - minimal initialization');
                break;
                
            default:
                console.log(`❓ Unknown page: ${this.currentPage} - using default initialization`);
                
                // Try to initialize menu anyway (common component)
                if (document.querySelector('.nav') || document.querySelector('.menu')) {
                    this.modules.menu = new MenuModule();
                    await this.modules.menu.init();
                }
        }
    }

    /**
     * Initialize global components based on DOM presence
     */
    async initializeComponents() {
        console.log('🧩 Initializing components...');
        
        // Initialize components only if their elements exist in DOM
        const componentMap = {
            charts: {
                selector: '.chart-card, .chart-container, canvas[id*="Chart"]',
                component: ChartComponent,
                instance: false // Static class
            },
            transactions: {
                selector: '.transaction-item, .transaction-list, .transaction-form',
                component: TransactionComponent,
                instance: false // Static class
            },
            modals: {
                selector: '.modal, [data-toggle="modal"]',
                component: ModalComponent,
                instance: false // Static class
            }
        };

        Object.entries(componentMap).forEach(([name, config]) => {
            if (document.querySelector(config.selector)) {
                if (config.instance) {
                    this.components[name] = new config.component();
                } else {
                    this.components[name] = config.component;
                }
                console.log(`✓ ${name} component initialized`);
            }
        });
    }

    /**
     * Bind global application events
     */
    bindGlobalEvents() {
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        // Global unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHide();
            } else {
                this.handlePageShow();
            }
        });

        // Before page unload
        window.addEventListener('beforeunload', (event) => {
            this.handleBeforeUnload(event);
        });

        console.log('📡 Global events bound');
    }

    /**
     * Handle global errors
     */
    handleError(error) {
        // Log error details
        const errorInfo = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            page: this.currentPage,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        console.error('Application error:', errorInfo);

        // Show user-friendly error message
        if (this.isInitialized) {
            Utils.showNotification(
                'Ha ocurrido un error inesperado. Por favor, recarga la página.',
                'error'
            );
        }
    }

    /**
     * Handle page hide (tab becomes inactive)
     */
    handlePageHide() {
        // Save any pending data
        console.log('📵 Page hidden - saving state');
    }

    /**
     * Handle page show (tab becomes active)
     */
    handlePageShow() {
        // Refresh data if needed
        console.log('📱 Page shown - checking for updates');
        
        // Refresh current module if it has a refresh method
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.refresh === 'function') {
                module.refresh();
            }
        });
    }

    /**
     * Handle before page unload
     */
    handleBeforeUnload(event) {
        // Check for unsaved changes
        const hasUnsavedChanges = this.checkUnsavedChanges();
        
        if (hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = '';
            return '';
        }
    }

    /**
     * Check if there are unsaved changes
     */
    checkUnsavedChanges() {
        // Check modules for unsaved changes
        return Object.values(this.modules).some(module => {
            return module && typeof module.hasUnsavedChanges === 'function' 
                ? module.hasUnsavedChanges() 
                : false;
        });
    }

    /**
     * Get current page identifier from URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        
        // Map filenames to page identifiers
        const pageMap = {
            '': 'index',
            'index': 'index',
            'dashboard': 'dashboard',
            'historial': 'historial', 
            'login': 'login',
            'menu': 'menu'
        };
        
        return pageMap[filename] || 'unknown';
    }

    /**
     * Navigate to page
     */
    navigateTo(page) {
        const pageMap = {
            'dashboard': 'dashboard.html',
            'historial': 'historial.html',
            'login': 'login.html',
            'menu': 'menu.html',
            'index': 'index.html'
        };

        if (pageMap[page]) {
            window.location.href = pageMap[page];
        } else {
            console.error(`Unknown page: ${page}`);
        }
    }

    /**
     * Get module instance
     */
    getModule(name) {
        return this.modules[name] || null;
    }

    /**
     * Get component instance
     */
    getComponent(name) {
        return this.components[name] || null;
    }

    /**
     * Check if module exists and is initialized
     */
    hasModule(name) {
        return this.modules[name] && 
               this.modules[name].isInitialized !== false;
    }

    /**
     * Get current page name
     */
    getCurrentPageName() {
        return this.currentPage;
    }

    /**
     * Check if app is fully initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Destroy app and clean up
     */
    destroy() {
        // Destroy all modules
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        // Clear references
        this.modules = {};
        this.components = {};
        this.isInitialized = false;

        console.log('🧹 SmartBudget destroyed and cleaned up');
    }

    /**
     * Restart application
     */
    async restart() {
        this.destroy();
        await this.init();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.SmartBudgetApp = new SmartBudgetApp();
});

// Export for external access
export default SmartBudgetApp;