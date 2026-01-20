/**
 * Charts Component
 * Handles all chart creation and management using Chart.js
 */

export class ChartComponent {
    static charts = new Map();
    static defaultColors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
        '#ef4444', '#6366f1', '#06b6d4', '#84cc16', '#f97316'
    ];

    /**
     * Create a line chart
     * @param {HTMLElement} canvas - Canvas element
     * @param {Array} data - Chart data
     * @param {Object} options - Chart options
     * @returns {Chart} Chart.js instance
     */
    static async createLineChart(canvas, data, options = {}) {
        if (!canvas || !data) return null;

        try {
            // Wait for Chart.js to be available
            await this.waitForChartJS();

            const ctx = canvas.getContext('2d');
            
            const config = {
                type: 'line',
                data: this.prepareLineChartData(data),
                options: this.mergeLineChartOptions(options)
            };

            const chart = new Chart(ctx, config);
            this.charts.set(canvas.id, chart);
            
            return chart;
        } catch (error) {
            console.error('Error creating line chart:', error);
            return null;
        }
    }

    /**
     * Create a doughnut chart
     * @param {HTMLElement} canvas - Canvas element
     * @param {Array} data - Chart data
     * @param {Object} options - Chart options
     * @returns {Chart} Chart.js instance
     */
    static async createDoughnutChart(canvas, data, options = {}) {
        if (!canvas || !data) return null;

        try {
            await this.waitForChartJS();

            const ctx = canvas.getContext('2d');
            
            const config = {
                type: 'doughnut',
                data: this.prepareDoughnutChartData(data),
                options: this.mergeDoughnutChartOptions(options)
            };

            const chart = new Chart(ctx, config);
            this.charts.set(canvas.id, chart);
            
            return chart;
        } catch (error) {
            console.error('Error creating doughnut chart:', error);
            return null;
        }
    }

    /**
     * Create a bar chart
     * @param {HTMLElement} canvas - Canvas element
     * @param {Array} data - Chart data
     * @param {Object} options - Chart options
     * @returns {Chart} Chart.js instance
     */
    static async createBarChart(canvas, data, options = {}) {
        if (!canvas || !data) return null;

        try {
            await this.waitForChartJS();

            const ctx = canvas.getContext('2d');
            
            const config = {
                type: 'bar',
                data: this.prepareBarChartData(data),
                options: this.mergeBarChartOptions(options)
            };

            const chart = new Chart(ctx, config);
            this.charts.set(canvas.id, chart);
            
            return chart;
        } catch (error) {
            console.error('Error creating bar chart:', error);
            return null;
        }
    }

    /**
     * Prepare data for line chart
     */
    static prepareLineChartData(data) {
        const labels = data.map(item => item.mes || item.label || item.x);
        
        return {
            labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: data.map(item => item.ingresos || item.income || 0),
                    borderColor: this.defaultColors[0],
                    backgroundColor: this.hexToRgba(this.defaultColors[0], 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Gastos',
                    data: data.map(item => item.gastos || item.expenses || 0),
                    borderColor: this.defaultColors[1],
                    backgroundColor: this.hexToRgba(this.defaultColors[1], 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    }

    /**
     * Prepare data for doughnut chart
     */
    static prepareDoughnutChartData(data) {
        return {
            labels: data.map(item => item.nombre || item.label),
            datasets: [{
                data: data.map(item => item.valor || item.value),
                backgroundColor: data.map((item, index) => 
                    item.color || this.defaultColors[index % this.defaultColors.length]
                ),
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#ffffff'
            }]
        };
    }

    /**
     * Prepare data for bar chart
     */
    static prepareBarChartData(data) {
        const labels = data.map(item => item.categoria || item.label || item.x);
        
        return {
            labels,
            datasets: [{
                label: 'Valor',
                data: data.map(item => item.valor || item.value || item.y),
                backgroundColor: data.map((item, index) => 
                    item.color || this.hexToRgba(this.defaultColors[index % this.defaultColors.length], 0.8)
                ),
                borderColor: data.map((item, index) => 
                    item.color || this.defaultColors[index % this.defaultColors.length]
                ),
                borderWidth: 1
            }]
        };
    }

    /**
     * Merge line chart options with defaults
     */
    static mergeLineChartOptions(options = {}) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: !!options.title,
                    text: options.title || '',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: 12
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
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
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
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            },
            ...options
        };
    }

    /**
     * Merge doughnut chart options with defaults
     */
    static mergeDoughnutChartOptions(options = {}) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: options.cutout || '50%',
            plugins: {
                title: {
                    display: !!options.title,
                    text: options.title || '',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
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
                            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            ...options
        };
    }

    /**
     * Merge bar chart options with defaults
     */
    static mergeBarChartOptions(options = {}) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: !!options.title,
                    text: options.title || '',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
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
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
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
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            ...options
        };
    }

    /**
     * Wait for Chart.js library to be available
     */
    static async waitForChartJS() {
        if (typeof Chart !== 'undefined') return;

        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds
            
            const checkChart = () => {
                if (typeof Chart !== 'undefined') {
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkChart, 100);
                } else {
                    reject(new Error('Chart.js library not found'));
                }
            };
            
            checkChart();
        });
    }

    /**
     * Convert hex color to rgba
     */
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Update chart data
     */
    static updateChart(chartId, newData) {
        const chart = this.charts.get(chartId);
        if (!chart) return false;

        try {
            if (chart.config.type === 'line') {
                const lineData = this.prepareLineChartData(newData);
                chart.data = lineData;
            } else if (chart.config.type === 'doughnut') {
                const doughnutData = this.prepareDoughnutChartData(newData);
                chart.data = doughnutData;
            } else if (chart.config.type === 'bar') {
                const barData = this.prepareBarChartData(newData);
                chart.data = barData;
            }

            chart.update();
            return true;
        } catch (error) {
            console.error('Error updating chart:', error);
            return false;
        }
    }

    /**
     * Resize chart
     */
    static resizeChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.resize();
        }
    }

    /**
     * Resize all charts
     */
    static resizeAllCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    /**
     * Destroy chart
     */
    static destroyChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.destroy();
            this.charts.delete(chartId);
            return true;
        }
        return false;
    }

    /**
     * Destroy all charts
     */
    static destroyAllCharts() {
        this.charts.forEach((chart, chartId) => {
            chart.destroy();
        });
        this.charts.clear();
    }

    /**
     * Get chart instance
     */
    static getChart(chartId) {
        return this.charts.get(chartId);
    }

    /**
     * Get all chart instances
     */
    static getAllCharts() {
        return this.charts;
    }

    /**
     * Export chart as image
     */
    static exportChart(chartId, filename = 'chart.png') {
        const chart = this.charts.get(chartId);
        if (!chart) return false;

        try {
            const canvas = chart.canvas;
            const link = document.createElement('a');
            
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            return true;
        } catch (error) {
            console.error('Error exporting chart:', error);
            return false;
        }
    }

    /**
     * Create chart from configuration
     */
    static async createChartFromConfig(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        try {
            await this.waitForChartJS();
            
            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, config);
            
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('Error creating chart from config:', error);
            return null;
        }
    }

    /**
     * Get chart statistics
     */
    static getChartStats() {
        return {
            totalCharts: this.charts.size,
            chartTypes: Array.from(this.charts.values()).reduce((acc, chart) => {
                const type = chart.config.type;
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {}),
            chartIds: Array.from(this.charts.keys())
        };
    }
}