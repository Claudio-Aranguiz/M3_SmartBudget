/**
 * Dashboard Module
 * Handles dashboard-specific functionality including charts and summary cards
 */

import { ChartComponent } from '../components/charts.js';
import { TransactionManager } from '../data/transactions.js';
import { Utils } from '../utils/helpers.js';

export class DashboardModule {
    constructor() {
        this.charts = {};
        this.summaryData = {};
        this.isInitialized = false;
    }

    /**
     * Initialize dashboard module
     */
    async init() {
        try {
            console.log('📊 Initializing Dashboard Module...');
            
            await this.loadSummaryData();
            await this.initializeCharts();
            this.bindEvents();
            
            this.isInitialized = true;
            console.log('✅ Dashboard Module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Dashboard Module:', error);
        }
    }

    /**
     * Load summary data for cards
     */
    async loadSummaryData() {
        try {
            const transactions = TransactionManager.getAllTransactions();
            
            this.summaryData = {
                balance: this.calculateBalance(transactions),
                income: this.calculateIncome(transactions),
                expenses: this.calculateExpenses(transactions),
                cards: this.getCardsInfo()
            };
            
            this.updateSummaryCards();
        } catch (error) {
            console.error('Error loading summary data:', error);
        }
    }

    /**
     * Initialize charts if containers exist
     */
    async initializeCharts() {
        const chartContainers = document.querySelectorAll('.chart-card');
        if (chartContainers.length === 0) return;

        try {
            // Income vs Expense Chart
            const incomeExpenseChart = document.getElementById('incomeExpenseChart');
            if (incomeExpenseChart) {
                this.charts.incomeExpense = await ChartComponent.createLineChart(
                    incomeExpenseChart,
                    this.getMonthlyData(),
                    {
                        title: 'Ingresos vs Gastos',
                        responsive: true,
                        maintainAspectRatio: false
                    }
                );
            }

            // Category Chart
            const categoryChart = document.getElementById('categoryChart');
            if (categoryChart) {
                this.charts.category = await ChartComponent.createDoughnutChart(
                    categoryChart,
                    this.getCategoryData(),
                    {
                        title: 'Gastos por Categoría',
                        cutout: '60%'
                    }
                );
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    /**
     * Bind dashboard-specific events
     */
    bindEvents() {
        // Summary card interactions
        const summaryCards = document.querySelectorAll('.summary-card');
        summaryCards.forEach(card => {
            card.addEventListener('click', this.handleSummaryCardClick.bind(this));
        });

        // View all transactions button
        const viewAllBtn = document.querySelector('.transactions__button--view-all');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                window.location.href = 'historial.html';
            });
        }

        // Responsive chart resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.resizeCharts();
        }, 250));
    }

    /**
     * Handle summary card click events
     */
    handleSummaryCardClick(event) {
        const card = event.currentTarget;
        const cardType = this.getCardType(card);
        
        // Add click animation
        card.classList.add('summary-card--clicked');
        setTimeout(() => {
            card.classList.remove('summary-card--clicked');
        }, 200);

        // Navigate based on card type
        switch (cardType) {
            case 'balance':
                // Show balance details modal or navigate
                console.log('Balance card clicked');
                break;
            case 'income':
                window.location.href = 'historial.html?filter=income';
                break;
            case 'expense':
                window.location.href = 'historial.html?filter=expense';
                break;
            case 'cards':
                console.log('Cards management - To be implemented');
                break;
        }
    }

    /**
     * Update summary cards with current data
     */
    updateSummaryCards() {
        // Update balance
        const balanceElement = document.querySelector('.summary-card:not([class*="--"]) .summary-card__value');
        if (balanceElement) {
            balanceElement.textContent = Utils.formatCurrency(this.summaryData.balance);
        }

        // Update income
        const incomeElement = document.querySelector('.summary-card--income .summary-card__value');
        if (incomeElement) {
            incomeElement.textContent = Utils.formatCurrency(this.summaryData.income);
        }

        // Update expenses
        const expenseElement = document.querySelector('.summary-card--expense .summary-card__value');
        if (expenseElement) {
            expenseElement.textContent = Utils.formatCurrency(this.summaryData.expenses);
        }
    }

    /**
     * Calculate total balance
     */
    calculateBalance(transactions) {
        return transactions.reduce((total, transaction) => {
            return total + (transaction.tipo === 'ingreso' ? transaction.monto : -Math.abs(transaction.monto));
        }, 15231.89); // Starting with mock balance
    }

    /**
     * Calculate total income
     */
    calculateIncome(transactions) {
        return transactions
            .filter(t => t.tipo === 'ingreso')
            .reduce((total, transaction) => total + transaction.monto, 8420.00);
    }

    /**
     * Calculate total expenses
     */
    calculateExpenses(transactions) {
        return transactions
            .filter(t => t.tipo === 'gasto')
            .reduce((total, transaction) => total + Math.abs(transaction.monto), 5328.50);
    }

    /**
     * Get cards information
     */
    getCardsInfo() {
        return {
            total: 3,
            active: 2,
            blocked: 1
        };
    }

    /**
     * Get monthly data for line chart
     */
    getMonthlyData() {
        return [
            { mes: 'Ene', ingresos: 4000, gastos: 2400 },
            { mes: 'Feb', ingresos: 3000, gastos: 1398 },
            { mes: 'Mar', ingresos: 2000, gastos: 3800 },
            { mes: 'Abr', ingresos: 2780, gastos: 3908 },
            { mes: 'May', ingresos: 1890, gastos: 2800 },
            { mes: 'Jun', ingresos: 2390, gastos: 2000 }
        ];
    }

    /**
     * Get category data for doughnut chart
     */
    getCategoryData() {
        return [
            { nombre: 'Alimentación', valor: 4000, color: '#3b82f6' },
            { nombre: 'Transporte', valor: 3000, color: '#8b5cf6' },
            { nombre: 'Entretenimiento', valor: 2000, color: '#ec4899' },
            { nombre: 'Servicios', valor: 2780, color: '#10b981' },
            { nombre: 'Otros', valor: 1890, color: '#f59e0b' }
        ];
    }

    /**
     * Get card type from DOM element
     */
    getCardType(cardElement) {
        if (cardElement.classList.contains('summary-card--income')) return 'income';
        if (cardElement.classList.contains('summary-card--expense')) return 'expense';
        
        const titleElement = cardElement.querySelector('.summary-card__title');
        if (titleElement) {
            const title = titleElement.textContent.toLowerCase();
            if (title.includes('balance')) return 'balance';
            if (title.includes('tarjeta')) return 'cards';
        }
        
        return 'unknown';
    }

    /**
     * Resize charts on window resize
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        if (!this.isInitialized) return;
        
        await this.loadSummaryData();
        this.resizeCharts();
    }

    /**
     * Destroy module and clean up
     */
    destroy() {
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.charts = {};
        this.isInitialized = false;
    }
}