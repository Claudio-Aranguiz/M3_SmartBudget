/**
 * Dashboard Initializer
 * Handles dashboard page initialization, charts setup and Lucide icons with real transaction data
 */

import { checkAuthentication } from '../utils/auth-guard.js';
import { getUserTransactions } from '../data/transaction-manager.js';
import { StorageManager } from '../data/storage.js';
import ChartsConfigManager from '../utils/charts-config.js';

/**
 * Data processing utilities for dashboard
 */
class DashboardDataProcessor {
    
    /**
     * Get current user ID from session
     */
    static getCurrentUserId() {
        const session = StorageManager.getSession();
        return session?.userId || null;
    }

    /**
     * Process transactions to get monthly data
     */
    static processMonthlyData(transactions) {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentYear = new Date().getFullYear();
        const monthlyData = {};

        // Initialize all months with zero values
        monthNames.forEach((month, index) => {
            monthlyData[index] = { 
                mes: month, 
                ingresos: 0, 
                gastos: 0 
            };
        });

        // Process transactions
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            if (transactionDate.getFullYear() === currentYear) {
                const month = transactionDate.getMonth();
                if (transaction.type === 'ingreso') {
                    monthlyData[month].ingresos += transaction.amount;
                } else if (transaction.type === 'gasto') {
                    monthlyData[month].gastos += transaction.amount;
                }
            }
        });

        // Return only months with data (last 6 months for better visualization)
        const currentMonth = new Date().getMonth();
        const startMonth = Math.max(0, currentMonth - 5);
        
        return Object.values(monthlyData).slice(startMonth, currentMonth + 1);
    }

    /**
     * Process transactions to get category data
     */
    static processCategoryData(transactions) {
        const categoryMap = new Map();
        const categoryColors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
            '#ef4444', '#6366f1', '#06b6d4', '#84cc16', '#f97316'
        ];

        // Category inference from descriptions
        const categoryKeywords = {
            'Alimentación': ['supermercado', 'comida', 'restaurante', 'almuerzo', 'cena', 'desayuno', 'mercado', 'domicilio'],
            'Transporte': ['metro', 'combustible', 'gasolina', 'uber', 'taxi', 'bus', 'transporte', 'parking'],
            'Servicios': ['electricidad', 'agua', 'gas', 'internet', 'telefonía', 'seguro', 'factura', 'plan'],
            'Entretenimiento': ['cinema', 'película', 'streaming', 'netflix', 'spotify', 'juego', 'diversión'],
            'Salud': ['farmacia', 'medicina', 'doctor', 'consulta', 'hospital', 'clínica'],
            'Hogar': ['casa', 'hogar', 'muebles', 'electrodoméstico', 'decoración'],
            'Educación': ['universidad', 'curso', 'libro', 'educación', 'escuela'],
            'Compras': ['compra', 'tienda', 'inventario', 'productos']
        };

        // Only process expenses for category chart
        const expenses = transactions.filter(transaction => transaction.type === 'gasto');

        expenses.forEach(transaction => {
            let category = 'Otros'; // Default category
            
            // Try to get category from transaction data first
            if (transaction.category) {
                category = transaction.category;
            } else {
                // Infer category from description
                const description = transaction.description.toLowerCase();
                
                for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
                    if (keywords.some(keyword => description.includes(keyword))) {
                        category = categoryName;
                        break;
                    }
                }
            }

            if (categoryMap.has(category)) {
                categoryMap.set(category, categoryMap.get(category) + transaction.amount);
            } else {
                categoryMap.set(category, transaction.amount);
            }
        });

        // Convert to array and add colors
        const categoriesArray = Array.from(categoryMap.entries()).map(([nombre, valor], index) => ({
            nombre,
            valor,
            color: categoryColors[index % categoryColors.length]
        }));

        // Sort by value (descending) and take top 8
        return categoriesArray
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 8);
    }

    /**
     * Calculate summary statistics
     */
    static calculateSummaryStats(transactions) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Current month transactions
        const currentMonthTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        // Last month transactions for comparison
        const lastMonthTransactions = transactions.filter(transaction => {
            const date = new Date(transaction.date);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });

        // Calculate current month totals
        const currentIncome = currentMonthTransactions
            .filter(t => t.type === 'ingreso')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const currentExpenses = currentMonthTransactions
            .filter(t => t.type === 'gasto')
            .reduce((sum, t) => sum + t.amount, 0);

        const currentBalance = currentIncome - currentExpenses;
        const currentSavings = currentIncome > 0 ? (currentBalance / currentIncome) * 100 : 0;

        // Calculate last month totals for comparison
        const lastIncome = lastMonthTransactions
            .filter(t => t.type === 'ingreso')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const lastExpenses = lastMonthTransactions
            .filter(t => t.type === 'gasto')
            .reduce((sum, t) => sum + t.amount, 0);

        const lastBalance = lastIncome - lastExpenses;

        // Calculate percentage changes
        const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
        const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;
        const balanceChange = lastBalance > 0 ? ((currentBalance - lastBalance) / Math.abs(lastBalance)) * 100 : 0;

        return {
            balance: currentBalance,
            income: currentIncome,
            expenses: currentExpenses,
            savings: currentBalance > 0 ? currentBalance : 0,
            incomeChange,
            expenseChange,
            balanceChange,
            savingsChange: currentBalance > 0 && lastBalance > 0 ? ((currentBalance - lastBalance) / Math.abs(lastBalance)) * 100 : 0
        };
    }
}

/**
 * Chart Configuration
 */
class DashboardCharts {
    static chartInstances = {};
    
    /**
     * Initialize all dashboard charts with real data
     */
    static async init() {
        try {
            // Check configuration
            if (ChartsConfigManager.isStaticMode()) {
                console.log('📊 Using static chart data (dynamic charts disabled)');
                this.initFallbackCharts();
                return;
            }

            console.log('🔄 Loading real transaction data for charts...');
            
            const userId = DashboardDataProcessor.getCurrentUserId();
            if (!userId) {
                console.warn('⚠️ No user ID found, using fallback data');
                if (ChartsConfigManager.getConfig().fallbackToStaticOnError) {
                    this.initFallbackCharts();
                }
                return;
            }

            const transactions = await getUserTransactions(userId);
            console.log(`📊 Loaded ${transactions.length} transactions for user ${userId}`);
            
            // Process data
            const monthlyData = DashboardDataProcessor.processMonthlyData(transactions);
            const categoryData = DashboardDataProcessor.processCategoryData(transactions);
            const summaryStats = DashboardDataProcessor.calculateSummaryStats(transactions);

            // Update summary cards
            this.updateSummaryCards(summaryStats);
            
            // Update recent transactions
            this.updateRecentTransactions(transactions);
            
            // Initialize charts with real data
            this.initIncomeExpenseChart(monthlyData);
            this.initCategoryChart(categoryData);
            
            console.log('✅ Dashboard charts initialized with real data');
        } catch (error) {
            console.error('❌ Error initializing charts with real data:', error);
            if (ChartsConfigManager.getConfig().fallbackToStaticOnError) {
                console.log('🔄 Falling back to static charts...');
                this.initFallbackCharts();
            }
        }
    }

    /**
     * Update recent transactions with real data
     */
    static updateRecentTransactions(transactions) {
        try {
            const transactionsList = document.querySelector('.transactions__list');
            if (!transactionsList) return;

            // Get the 5 most recent transactions
            const recentTransactions = transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            // Clear existing transactions
            transactionsList.innerHTML = '';

            if (recentTransactions.length === 0) {
                transactionsList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No hay transacciones disponibles</p>';
                return;
            }

            // Create transaction elements
            recentTransactions.forEach(transaction => {
                const transactionElement = document.createElement('div');
                transactionElement.className = 'transaction';

                const isIncome = transaction.type === 'ingreso';
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                });
                const formattedAmount = transaction.amount.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                transactionElement.innerHTML = `
                    <div class="transaction__info">
                        <div class="transaction__icon transaction__icon--${isIncome ? 'income' : 'expense'}">
                            <i data-lucide="${isIncome ? 'arrow-up-right' : 'arrow-down-right'}" class="transaction__icon-svg"></i>
                        </div>
                        <div class="transaction__details">
                            <p class="transaction__name">${transaction.description}</p>
                            <p class="transaction__date">${formattedDate}</p>
                        </div>
                    </div>
                    <span class="transaction__amount transaction__amount--${isIncome ? 'income' : 'expense'}">
                        ${isIncome ? '+' : '-'}$${formattedAmount}
                    </span>
                `;

                transactionsList.appendChild(transactionElement);
            });

            // Re-initialize Lucide icons for new content
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            console.log('✅ Recent transactions updated with real data');
        } catch (error) {
            console.error('❌ Error updating recent transactions:', error);
        }
    }

    /**
     * Update summary cards with real data
     */
    static updateSummaryCards(stats) {
        try {
            // Update Balance Total
            const balanceElement = document.querySelector('.summary-card__value');
            const balanceChangeElement = document.querySelector('.summary-card__percentage');
            
            if (balanceElement) {
                balanceElement.textContent = `$${stats.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
            }
            
            if (balanceChangeElement) {
                const change = stats.balanceChange;
                balanceChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                balanceChangeElement.className = `summary-card__percentage ${change >= 0 ? 'summary-card__percentage--positive' : 'summary-card__percentage--negative'}`;
            }

            // Update Ingresos
            const incomeElement = document.querySelector('.summary-card--income .summary-card__value');
            const incomeChangeElement = document.querySelector('.summary-card--income .summary-card__percentage');
            
            if (incomeElement) {
                incomeElement.textContent = `$${stats.income.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
            }
            
            if (incomeChangeElement) {
                const change = stats.incomeChange;
                incomeChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                incomeChangeElement.className = `summary-card__percentage ${change >= 0 ? 'summary-card__percentage--positive' : 'summary-card__percentage--negative'}`;
            }

            // Update Gastos
            const expenseElement = document.querySelector('.summary-card--expense .summary-card__value');
            const expenseChangeElement = document.querySelector('.summary-card--expense .summary-card__percentage');
            
            if (expenseElement) {
                expenseElement.textContent = `$${stats.expenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
            }
            
            if (expenseChangeElement) {
                const change = stats.expenseChange;
                expenseChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                expenseChangeElement.className = `summary-card__percentage ${change >= 0 ? 'summary-card__percentage--negative' : 'summary-card__percentage--positive'}`;
            }

            // Update Ahorros
            const savingsElement = document.querySelector('.summary-card--savings .summary-card__value');
            const savingsChangeElement = document.querySelector('.summary-card--savings .summary-card__percentage');
            
            if (savingsElement) {
                savingsElement.textContent = `$${stats.savings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
            }
            
            if (savingsChangeElement) {
                const change = stats.savingsChange;
                savingsChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                savingsChangeElement.className = `summary-card__percentage ${change >= 0 ? 'summary-card__percentage--positive' : 'summary-card__percentage--negative'}`;
            }

            console.log('✅ Summary cards updated with real data');
        } catch (error) {
            console.error('❌ Error updating summary cards:', error);
        }
    }

    /**
     * Initialize Income vs Expense Line Chart with real data
     */
    static initIncomeExpenseChart(monthlyData) {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.chartInstances.incomeExpenseChart) {
            this.chartInstances.incomeExpenseChart.destroy();
        }

        this.chartInstances.incomeExpenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(item => item.mes),
                datasets: [{
                    label: 'Ingresos',
                    data: monthlyData.map(item => item.ingresos),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }, {
                    label: 'Gastos',
                    data: monthlyData.map(item => item.gastos),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#ffffff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toLocaleString('es-ES')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-ES');
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    /**
     * Initialize Category Doughnut Chart with real data
     */
    static initCategoryChart(categoryData) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.chartInstances.categoryChart) {
            this.chartInstances.categoryChart.destroy();
        }

        // Handle case where no category data exists
        if (!categoryData || categoryData.length === 0) {
            this.showNoDataMessage(ctx, 'No hay datos de categorías disponibles');
            return;
        }

        this.chartInstances.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.map(item => item.nombre),
                datasets: [{
                    data: categoryData.map(item => item.valor),
                    backgroundColor: categoryData.map(item => item.color),
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 11
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const meta = chart.getDatasetMeta(0);
                                        const style = meta.controller.getStyle(i);
                                        const value = data.datasets[0].data[i];
                                        return {
                                            text: `${label}: $${value.toLocaleString('es-ES')}`,
                                            fillStyle: style.backgroundColor,
                                            strokeStyle: style.borderColor,
                                            lineWidth: style.borderWidth,
                                            pointStyle: 'circle',
                                            hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#ffffff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: $${context.parsed.toLocaleString('es-ES')} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    /**
     * Show no data message on canvas
     */
    static showNoDataMessage(canvas, message) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, width / 2, height / 2);
    }

    /**
     * Initialize fallback charts with static data
     */
    static initFallbackCharts() {
        console.log('🔄 Initializing fallback charts with static data...');
        
        const fallbackMonthly = [
            { mes: 'Ene', ingresos: 4000, gastos: 2400 },
            { mes: 'Feb', ingresos: 3000, gastos: 1398 },
            { mes: 'Mar', ingresos: 2000, gastos: 3800 },
            { mes: 'Abr', ingresos: 2780, gastos: 3908 },
            { mes: 'May', ingresos: 1890, gastos: 2800 },
            { mes: 'Jun', ingresos: 2390, gastos: 2000 }
        ];
        
        const fallbackCategories = [
            { nombre: 'Alimentación', valor: 4000, color: '#3b82f6' },
            { nombre: 'Transporte', valor: 3000, color: '#8b5cf6' },
            { nombre: 'Entretenimiento', valor: 2000, color: '#ec4899' },
            { nombre: 'Servicios', valor: 2780, color: '#10b981' },
            { nombre: 'Otros', valor: 1890, color: '#f59e0b' }
        ];

        this.initIncomeExpenseChart(fallbackMonthly);
        this.initCategoryChart(fallbackCategories);
        
        console.log('✅ Fallback charts initialized');
    }

    /**
     * Refresh charts with new data
     */
    static async refreshCharts() {
        console.log('🔄 Refreshing dashboard charts...');
        await this.init();
    }

    /**
     * Destroy all chart instances
     */
    static destroyCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.chartInstances = {};
    }
}
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    /**
     * Initialize Category Doughnut Chart
     */
    static initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: DASHBOARD_DATA.categories.map(item => item.nombre),
                datasets: [{
                    data: DASHBOARD_DATA.categories.map(item => item.valor),
                    backgroundColor: DASHBOARD_DATA.categories.map(item => item.color),
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': $' + context.parsed.toLocaleString();
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
}

/**
 * Dashboard Page Initializer
 */
class DashboardInit {
    
    /**
     * Initialize dashboard page
     */
    static init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup dashboard components
     */
    static setup() {
        console.log('🚀 Initializing Dashboard with Real Data...');
        
        // Check authentication first
        if (!checkAuthentication()) {
            return; // Stop initialization if not authenticated
        }
        
        // Initialize Lucide icons
        this.initLucideIcons();
        
        // Initialize charts when Chart.js is ready
        this.initChartsWhenReady();

        // Set up event listeners for data refresh
        this.setupEventListeners();

        // Add debug controls in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            ChartsConfigManager.addDebugControls();
        }
    }

    /**
     * Initialize Lucide icons
     */
    static initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('✅ Lucide icons initialized');
        } else {
            console.warn('⚠️ Lucide not found');
        }
    }

    /**
     * Initialize charts when Chart.js is loaded
     */
    static initChartsWhenReady() {
        const checkChart = () => {
            if (typeof Chart !== 'undefined') {
                DashboardCharts.init();
                console.log('✅ Dashboard initialization complete');
            } else {
                // Retry in 100ms
                setTimeout(checkChart, 100);
            }
        };
        
        checkChart();
    }

    /**
     * Setup event listeners
     */
    static setupEventListeners() {
        // Listen for custom events that might indicate data changes
        window.addEventListener('transactionAdded', () => {
            console.log('🔄 Transaction added, refreshing dashboard...');
            DashboardCharts.refreshCharts();
        });

        window.addEventListener('transactionUpdated', () => {
            console.log('🔄 Transaction updated, refreshing dashboard...');
            DashboardCharts.refreshCharts();
        });

        window.addEventListener('transactionDeleted', () => {
            console.log('🔄 Transaction deleted, refreshing dashboard...');
            DashboardCharts.refreshCharts();
        });

        // Listen for configuration changes
        window.addEventListener('chartsConfigChanged', (event) => {
            console.log('🔧 Charts config changed:', event.detail);
            DashboardCharts.refreshCharts();
        });

        // Listen for refresh requests
        window.addEventListener('refreshChartsRequested', () => {
            console.log('🔄 Manual charts refresh requested');
            DashboardCharts.refreshCharts();
        });

        // Handle window resize for chart responsiveness
        window.addEventListener('resize', () => {
            Object.values(DashboardCharts.chartInstances).forEach(chart => {
                if (chart) {
                    chart.resize();
                }
            });
        });

        // Add refresh button functionality
        const refreshButton = document.querySelector('.transactions__button--view-all');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                DashboardCharts.refreshCharts();
            });
        }
    }

    /**
     * Manually refresh dashboard data
     */
    static async refreshData() {
        console.log('🔄 Manually refreshing dashboard data...');
        await DashboardCharts.refreshCharts();
    }
}

// Export for modular usage
export { DashboardInit, DashboardCharts, DashboardDataProcessor };

// Auto-initialize when script loads
DashboardInit.init();