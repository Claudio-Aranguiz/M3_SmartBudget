/**
 * SmartBudget - Landing Page Only
 * This file provides minimal support for the landing page without loading the full app
 */

// Only load the full app in authenticated pages, not in the landing page
// The landing page should remain lightweight

// Legacy function support for basic functionality
window.showAlert = function(message, type = 'info') {
    alert(message);
};

console.log('📜 Landing page loaded - SmartBudget ready');