/**
 * SmartBudget - Legacy Support
 * This file provides backward compatibility for any legacy code
 * and imports the main application
 */

// Import the main application
import SmartBudgetApp from './app.js';

// Export for global access (backward compatibility)
window.SmartBudgetApp = SmartBudgetApp;

// Legacy function support
window.showAlert = function(message, type = 'info') {
    if (window.SmartBudgetApp && window.SmartBudgetApp.isReady()) {
        const Utils = window.SmartBudgetApp.getComponent('Utils');
        if (Utils && Utils.showNotification) {
            Utils.showNotification(message, type);
        } else {
            alert(message);
        }
    } else {
        alert(message);
    }
};

console.log('📜 Legacy support loaded - SmartBudget ready');