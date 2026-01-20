# 📚 SmartBudget JavaScript Architecture

## 🚀 Quick Start

```javascript
// La aplicación se inicializa automáticamente
// No es necesario código adicional en los HTML files

// Acceso global a la aplicación
const app = window.SmartBudgetApp;

// Obtener módulo específico
const dashboard = app.getModule('dashboard');
const historial = app.getModule('historial');

// Obtener componente
const charts = app.getComponent('charts');
const modals = app.getComponent('modals');
```

## 📁 File Structure

```
assets/js/
├── app.js                 # 🚀 Main application entry point
├── main.js               # 📜 Legacy support & backward compatibility
├── modules/              # 📦 Page-specific modules
│   ├── dashboard.js     # Dashboard functionality
│   ├── historial.js     # Transaction history
│   ├── auth.js          # Authentication & login
│   └── menu.js          # Navigation & user menu
├── components/          # 🧩 Reusable UI components
│   ├── charts.js        # Chart.js wrapper
│   ├── transaction.js   # Transaction components
│   └── modal.js         # Modal system
├── utils/               # 🛠️ Shared utilities
│   ├── helpers.js       # General helper functions
│   └── ui.js           # UI management utilities
└── data/                # 💾 Data management
    ├── transactions.js  # Transaction CRUD operations
    └── storage.js       # LocalStorage manager
```

## 🏗️ Architecture Overview

### Module Pattern
Each file exports a class or functions that can be imported elsewhere:

```javascript
// modules/dashboard.js
export class DashboardModule {
    constructor() { }
    async init() { }
    // methods...
}

// components/charts.js
export class ChartComponent {
    static createLineChart() { }
    static createDoughnutChart() { }
    // static methods...
}
```

### Import System
ES6 modules are used throughout the application:

```javascript
// Import specific classes
import { DashboardModule } from './modules/dashboard.js';
import { Utils } from './utils/helpers.js';

// Import all exports
import * as TransactionManager from './data/transactions.js';
```

## 📦 Module Guide

### 🚀 app.js - Main Application
**Purpose**: Application orchestrator and initialization
**Usage**: Automatically loaded, manages lifecycle

```javascript
// Access the main app
const app = window.SmartBudgetApp;

// Check if ready
if (app.isReady()) {
    // App is fully initialized
}

// Get current page
const currentPage = app.getCurrentPageName(); // 'dashboard', 'historial', etc.
```

### 📦 Modules (Page-Specific)

#### dashboard.js
**Purpose**: Dashboard page functionality
**Features**: Charts, summary cards, financial overview

```javascript
const dashboard = app.getModule('dashboard');
await dashboard.refresh(); // Refresh dashboard data
```

#### historial.js  
**Purpose**: Transaction history management
**Features**: CRUD operations, filtering, search, export

```javascript
const historial = app.getModule('historial');
await historial.refresh(); // Refresh transaction list
```

#### auth.js
**Purpose**: Authentication and user management
**Features**: Login, registration, session management

```javascript
const auth = app.getModule('auth');
const isAuthenticated = auth.isAuthenticated();
auth.logout(); // Logout user
```

#### menu.js
**Purpose**: Navigation and menu functionality
**Features**: Mobile menu, user dropdown, navigation

```javascript
const menu = app.getModule('menu');
menu.updateMenuBadge('historial.html', 5); // Add badge with count
```

### 🧩 Components (Reusable)

#### charts.js
**Purpose**: Chart.js wrapper and management
**Usage**: Static methods for creating charts

```javascript
import { ChartComponent } from './components/charts.js';

// Create a line chart
const chart = await ChartComponent.createLineChart(canvas, data, options);

// Update chart data
ChartComponent.updateChart('chartId', newData);

// Export chart as image
ChartComponent.exportChart('chartId', 'my-chart.png');
```

#### transaction.js
**Purpose**: Transaction UI components
**Usage**: Generate HTML for transaction-related UI

```javascript
import { TransactionComponent } from './components/transaction.js';

// Create transaction card
const html = TransactionComponent.createTransactionCard(transaction);

// Create transaction list
const listHtml = TransactionComponent.createTransactionList(transactions);

// Render to container
TransactionComponent.render('#container', html);
```

#### modal.js
**Purpose**: Modal system management
**Usage**: Create and manage modals

```javascript
import { ModalComponent } from './components/modal.js';

// Initialize modal system
ModalComponent.init();

// Create confirmation modal
ModalComponent.createConfirmation({
    title: 'Delete Transaction',
    message: 'Are you sure?',
    onConfirm: () => { /* delete logic */ }
});

// Show/hide modals
ModalComponent.show('modalId');
ModalComponent.close('modalId');
```

### 🛠️ Utils (Shared Utilities)

#### helpers.js
**Purpose**: General utility functions (50+ functions)
**Usage**: Import specific functions or the Utils class

```javascript
import { Utils } from './utils/helpers.js';

// Format currency
const formatted = Utils.formatCurrency(1234.56); // "$1,234.56"

// Format dates
const date = Utils.formatDate('2024-01-15'); // "15/01/2024"

// Show notifications
Utils.showNotification('Success!', 'success');

// Debounce function
const debouncedFn = Utils.debounce(myFunction, 300);

// Generate ID
const id = Utils.generateId('transaction'); // "transaction-Ab3Cd5Ef"
```

#### ui.js
**Purpose**: UI management and interactions
**Usage**: Static methods for UI operations

```javascript
import { UIManager } from './utils/ui.js';

// Initialize UI manager
UIManager.init();

// Show page loader
UIManager.showPageLoader('Loading...');
UIManager.hidePageLoader();

// Show confirmation dialog
const confirmed = await UIManager.showConfirmDialog('Delete item?', 'This cannot be undone');

// Set button loading state
UIManager.setButtonLoading(button, true, 'Saving...');
```

### 💾 Data Management

#### transactions.js
**Purpose**: Transaction data operations
**Usage**: Static methods for CRUD and data management

```javascript
import { TransactionManager } from './data/transactions.js';

// Initialize with sample data
TransactionManager.init();

// CRUD operations
const transactions = TransactionManager.getAllTransactions();
const result = await TransactionManager.addTransaction(transactionData);
await TransactionManager.updateTransaction(id, transactionData);
await TransactionManager.deleteTransaction(id);

// Advanced queries
const recentTransactions = TransactionManager.getRecentTransactions(10);
const incomeTransactions = TransactionManager.getTransactionsByType('ingreso');
const stats = TransactionManager.getTransactionStats();

// Export/Import
const csvContent = TransactionManager.exportToCSV();
const importResult = await TransactionManager.importFromCSV(csvContent);
```

#### storage.js
**Purpose**: Enhanced LocalStorage management
**Usage**: Static methods for storage operations

```javascript
import { StorageManager } from './data/storage.js';

// Initialize storage
StorageManager.init();

// Basic operations
StorageManager.setItem('key', value);
const value = StorageManager.getItem('key', defaultValue);
StorageManager.removeItem('key');

// Advanced features
StorageManager.setItemWithExpiration('temp-data', value, 30); // 30 minutes
const usage = StorageManager.getUsageInfo();
const backup = StorageManager.backup();
StorageManager.restore(backup);
```

## 🎯 Usage Examples

### Adding a New Module

```javascript
// modules/reports.js
export class ReportsModule {
    constructor() {
        this.isInitialized = false;
    }
    
    async init() {
        console.log('📊 Initializing Reports Module...');
        this.bindEvents();
        this.isInitialized = true;
        console.log('✅ Reports Module initialized');
    }
    
    bindEvents() {
        // Event binding logic
    }
    
    refresh() {
        // Refresh logic
    }
    
    destroy() {
        this.isInitialized = false;
    }
}
```

### Adding to app.js
```javascript
// In app.js initializePageModules()
case 'reports':
    this.modules.reports = new ReportsModule();
    await this.modules.reports.init();
    break;
```

### Creating a New Component

```javascript
// components/notifications.js
export class NotificationComponent {
    static show(message, type = 'info') {
        // Notification logic
    }
    
    static createToast(options) {
        // Toast creation logic
    }
}
```

### Adding Utility Functions

```javascript
// In utils/helpers.js - Utils class
static myNewFunction(param1, param2) {
    // Utility function logic
    return result;
}
```

## 🔧 Development Guidelines

### 1. **File Naming Convention**
- `kebab-case.js` for files
- `PascalCase` for classes
- `camelCase` for functions/variables

### 2. **Module Structure**
```javascript
export class ModuleName {
    constructor() {
        this.isInitialized = false;
        // Initialize properties
    }
    
    async init() {
        // Initialization logic
        this.bindEvents();
        this.isInitialized = true;
    }
    
    bindEvents() {
        // Event listeners
    }
    
    refresh() {
        // Refresh functionality
    }
    
    destroy() {
        // Cleanup logic
        this.isInitialized = false;
    }
}
```

### 3. **Error Handling**
```javascript
try {
    // Code that might fail
    const result = await someAsyncOperation();
    return { success: true, data: result };
} catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error: error.message };
}
```

### 4. **Event Management**
```javascript
// Use event delegation
document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (button) {
        this.handleAction(button.dataset.action, event);
    }
});
```

## 🚀 Performance Considerations

### 1. **Lazy Loading**
Modules are only loaded when their page is accessed.

### 2. **Event Delegation**
Single event listeners handle multiple elements.

### 3. **Debouncing**
Search and resize operations use debouncing.

### 4. **Memory Management**
All modules have proper cleanup methods.

## 🔍 Debugging

### Development Console
```javascript
// Access main app
window.SmartBudgetApp

// Get current module
window.SmartBudgetApp.getModule('dashboard')

// Check app state
window.SmartBudgetApp.isReady()

// View storage usage
window.SmartBudgetApp.getComponent('storage').getUsageInfo()
```

### Common Issues

1. **Module not initialized**: Check if the page name matches the module name
2. **Component not found**: Ensure the component is properly imported and initialized
3. **Storage issues**: Check browser support and available storage space

## 📚 Further Reading

- [ES6 Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Module Pattern in JavaScript](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript)
- [JavaScript Architecture Best Practices](https://github.com/rwaldron/idiomatic.js)

---

**Last updated**: January 20, 2025  
**Version**: 1.0.0