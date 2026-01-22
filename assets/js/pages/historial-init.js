/**
 * Historial Page Initializer
 * Handles transaction history functionality, filtering and search
 */

/**
 * Sample transaction data
 */
const SAMPLE_TRANSACTIONS = [
    { id: 1, concepto: 'Supermercado', monto: -125.50, fecha: '17 Ene 2026', categoria: 'Alimentación', tipo: 'gasto' },
    { id: 2, concepto: 'Salario', monto: 3500, fecha: '15 Ene 2026', categoria: 'Ingreso', tipo: 'ingreso' },
    { id: 3, concepto: 'Netflix', monto: -15.99, fecha: '14 Ene 2026', categoria: 'Entretenimiento', tipo: 'gasto' },
    { id: 4, concepto: 'Uber', monto: -23.50, fecha: '13 Ene 2026', categoria: 'Transporte', tipo: 'gasto' },
    { id: 5, concepto: 'Restaurante', monto: -78.00, fecha: '12 Ene 2026', categoria: 'Alimentación', tipo: 'gasto' },
    { id: 6, concepto: 'Freelance', monto: 850, fecha: '10 Ene 2026', categoria: 'Ingreso', tipo: 'ingreso' },
    { id: 7, concepto: 'Gasolina', monto: -45.00, fecha: '09 Ene 2026', categoria: 'Transporte', tipo: 'gasto' },
    { id: 8, concepto: 'Farmacia', monto: -32.50, fecha: '08 Ene 2026', categoria: 'Salud', tipo: 'gasto' },
    { id: 9, concepto: 'Gimnasio', monto: -50.00, fecha: '07 Ene 2026', categoria: 'Salud', tipo: 'gasto' },
    { id: 10, concepto: 'Amazon', monto: -89.99, fecha: '06 Ene 2026', categoria: 'Compras', tipo: 'gasto' },
    { id: 11, concepto: 'Starbucks', monto: -12.50, fecha: '05 Ene 2026', categoria: 'Alimentación', tipo: 'gasto' },
    { id: 12, concepto: 'Spotify', monto: -9.99, fecha: '04 Ene 2026', categoria: 'Entretenimiento', tipo: 'gasto' },
    { id: 13, concepto: 'Electricidad', monto: -65.00, fecha: '03 Ene 2026', categoria: 'Servicios', tipo: 'gasto' },
    { id: 14, concepto: 'Bonus', monto: 500, fecha: '02 Ene 2026', categoria: 'Ingreso', tipo: 'ingreso' },
    { id: 15, concepto: 'Cena', monto: -95.00, fecha: '01 Ene 2026', categoria: 'Alimentación', tipo: 'gasto' }
];

/**
 * Historial functionality manager
 */
class HistorialManager {
    constructor() {
        this.allTransactions = SAMPLE_TRANSACTIONS;
        this.currentFilter = 'todos';
        this.searchTerm = '';
    }

    /**
     * Initialize historial page
     */
    init() {
        console.log('🧾 Initializing Historial Manager...');
        
        this.bindEvents();
        this.updateTotals();
        this.renderTransactions();
        
        console.log('✅ Historial Manager initialized successfully');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderTransactions();
            });
        }

        // Filter buttons - attach global function for inline onclick
        window.filterTransactions = (type, event) => {
            this.filterTransactions(type, event);
        };
    }

    /**
     * Filter transactions by type
     */
    filterTransactions(type, event) {
        this.currentFilter = type;
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        this.renderTransactions();
    }

    /**
     * Get filtered transactions
     */
    getFilteredTransactions() {
        return this.allTransactions.filter(transaction => {
            const matchesFilter = this.currentFilter === 'todos' || transaction.tipo === this.currentFilter;
            const matchesSearch = transaction.concepto.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                transaction.categoria.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            return matchesFilter && matchesSearch;
        });
    }

    /**
     * Render transactions list
     */
    renderTransactions() {
        const container = document.getElementById('transactionsList');
        if (!container) return;

        const filteredTransactions = this.getFilteredTransactions();

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>No se encontraron transacciones</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-content">
                    <div class="transaction-left">
                        <div class="transaction-icon ${transaction.tipo}">
                            <i class="lucide-icon" data-lucide="${transaction.tipo === 'ingreso' ? 'arrow-up-right' : 'arrow-down-right'}"></i>
                        </div>
                        <div class="transaction-info">
                            <h3>${transaction.concepto}</h3>
                            <div class="transaction-meta">
                                <span class="badge">${transaction.categoria}</span>
                                <span class="transaction-date">${transaction.fecha}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="transaction-amount ${transaction.tipo}">
                    ${transaction.monto > 0 ? '+' : ''}$${Math.abs(transaction.monto).toFixed(2)}
                </span>
            </div>
        `).join('');

        // Re-initialize Lucide icons for new content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Update totals in summary cards
     */
    updateTotals() {
        const totalIngresos = this.allTransactions
            .filter(t => t.tipo === 'ingreso')
            .reduce((sum, t) => sum + t.monto, 0);

        const totalGastos = Math.abs(
            this.allTransactions
                .filter(t => t.tipo === 'gasto')
                .reduce((sum, t) => sum + t.monto, 0)
        );

        const totalIngresosEl = document.getElementById('totalIngresos');
        const totalGastosEl = document.getElementById('totalGastos');
        
        if (totalIngresosEl) {
            totalIngresosEl.textContent = `$${totalIngresos.toFixed(2)}`;
        }
        
        if (totalGastosEl) {
            totalGastosEl.textContent = `$${totalGastos.toFixed(2)}`;
        }
    }
}

/**
 * Initialize page when DOM is ready
 */
class HistorialInit {
    static init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    static setup() {
        console.log('🚀 Initializing Historial Page...');
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('✅ Lucide icons initialized');
        }
        
        // Initialize historial manager
        const historialManager = new HistorialManager();
        historialManager.init();
    }
}

// Export for modular usage
export { HistorialInit, HistorialManager, SAMPLE_TRANSACTIONS };

// Auto-initialize when script loads
HistorialInit.init();