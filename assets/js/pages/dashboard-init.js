/**
 * Dashboard Initializer
 * Handles dashboard page initialization, charts setup and Lucide icons
 */

import { checkAuthentication } from '../utils/auth-guard.js';

/**
 * Dashboard data for charts
 */
const DASHBOARD_DATA = {
    monthly: [
        { mes: 'Ene', ingresos: 4000, gastos: 2400 },
        { mes: 'Feb', ingresos: 3000, gastos: 1398 },
        { mes: 'Mar', ingresos: 2000, gastos: 3800 },
        { mes: 'Abr', ingresos: 2780, gastos: 3908 },
        { mes: 'May', ingresos: 1890, gastos: 2800 },
        { mes: 'Jun', ingresos: 2390, gastos: 2000 }
    ],
    
    categories: [
        { nombre: 'Alimentación', valor: 4000, color: '#3b82f6' },
        { nombre: 'Transporte', valor: 3000, color: '#8b5cf6' },
        { nombre: 'Entretenimiento', valor: 2000, color: '#ec4899' },
        { nombre: 'Servicios', valor: 2780, color: '#10b981' },
        { nombre: 'Otros', valor: 1890, color: '#f59e0b' }
    ]
};

/**
 * Chart Configuration
 */
class DashboardCharts {
    
    /**
     * Initialize all dashboard charts
     */
    static init() {
        this.initIncomeExpenseChart();
        this.initCategoryChart();
    }

    /**
     * Initialize Income vs Expense Line Chart
     */
    static initIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: DASHBOARD_DATA.monthly.map(item => item.mes),
                datasets: [{
                    label: 'Ingresos',
                    data: DASHBOARD_DATA.monthly.map(item => item.ingresos),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Gastos',
                    data: DASHBOARD_DATA.monthly.map(item => item.gastos),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        title: {
                            display: false
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2
                    },
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
        console.log('🚀 Initializing Dashboard...');
        
        // Check authentication first
        if (!checkAuthentication()) {
            return; // Stop initialization if not authenticated
        }
        
        // Initialize Lucide icons
        this.initLucideIcons();
        
        // Initialize charts when Chart.js is ready
        this.initChartsWhenReady();
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
                console.log('✅ Dashboard charts initialized');
            } else {
                // Retry in 100ms
                setTimeout(checkChart, 100);
            }
        };
        
        checkChart();
    }
}

// Export for modular usage
export { DashboardInit, DashboardCharts, DASHBOARD_DATA };

// Auto-initialize when script loads
DashboardInit.init();