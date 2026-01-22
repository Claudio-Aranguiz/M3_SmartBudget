/**
 * Menu Page Initializer
 * Handles menu page functionality and Lucide icons
 */

/**
 * Menu Page Manager
 */
class MenuManager {
    
    /**
     * Initialize menu page
     */
    init() {
        console.log('📱 Initializing Menu Manager...');
        
        this.initLucideIcons();
        this.bindEvents();
        
        console.log('✅ Menu Manager initialized successfully');
    }

    /**
     * Initialize Lucide icons
     */
    initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('✅ Lucide icons initialized');
        } else {
            console.warn('⚠️ Lucide not found');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Attach global function for development alerts
        window.showAlert = (message) => {
            alert(message + ' - En desarrollo');
        };
    }
}

/**
 * Initialize menu page when DOM is ready
 */
class MenuInit {
    static init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    static setup() {
        console.log('🚀 Initializing Menu Page...');
        
        // Initialize menu manager
        const menuManager = new MenuManager();
        menuManager.init();
    }
}

// Export for modular usage
export { MenuInit, MenuManager };

// Auto-initialize when script loads
MenuInit.init();