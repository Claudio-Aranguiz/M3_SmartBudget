/**
 * Historial Module
 * Handles transaction history and management functionality
 */

import { TransactionManager } from '../data/transactions.js';
import { Utils } from '../utils/helpers.js';
import { UIManager } from '../utils/ui.js';

export class HistorialModule {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentFilter = 'todos';
        this.currentSort = 'fecha';
        this.isInitialized = false;
        this.editingTransaction = null;
    }

    /**
     * Initialize historial module
     */
    async init() {
        try {
            console.log('📋 Initializing Historial Module...');
            
            await this.loadTransactions();
            this.bindEvents();
            this.applyURLFilters();
            this.renderTransactions();
            
            this.isInitialized = true;
            console.log('✅ Historial Module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Historial Module:', error);
        }
    }

    /**
     * Load all transactions
     */
    async loadTransactions() {
        try {
            this.transactions = TransactionManager.getAllTransactions();
            this.filteredTransactions = [...this.transactions];
            this.updateTransactionCount();
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
            this.filteredTransactions = [];
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', this.handleFilterChange.bind(this));
        });

        // Sort dropdown
        const sortSelect = document.querySelector('.historial__sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        // Search input
        const searchInput = document.querySelector('.historial__search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(this.handleSearch.bind(this), 300));
        }

        // Add transaction button
        const addButton = document.querySelector('.historial__add-button');
        if (addButton) {
            addButton.addEventListener('click', this.showAddTransactionModal.bind(this));
        }

        // Export button
        const exportButton = document.querySelector('.historial__export-button');
        if (exportButton) {
            exportButton.addEventListener('click', this.exportTransactions.bind(this));
        }

        // Modal events
        this.bindModalEvents();
    }

    /**
     * Bind modal-related events
     */
    bindModalEvents() {
        // Transaction form submit
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', this.handleTransactionSubmit.bind(this));
        }

        // Delete confirmation
        const deleteConfirmButton = document.querySelector('.modal__button--delete-confirm');
        if (deleteConfirmButton) {
            deleteConfirmButton.addEventListener('click', this.handleDeleteConfirm.bind(this));
        }

        // Category select change
        const categorySelect = document.getElementById('categoria');
        if (categorySelect) {
            categorySelect.addEventListener('change', this.handleCategoryChange.bind(this));
        }

        // Amount input formatting
        const amountInput = document.getElementById('monto');
        if (amountInput) {
            amountInput.addEventListener('input', this.formatAmountInput.bind(this));
        }
    }

    /**
     * Apply URL-based filters
     */
    applyURLFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        
        if (filterParam) {
            this.currentFilter = filterParam;
            const filterButton = document.querySelector(`[data-filter="${filterParam}"]`);
            if (filterButton) {
                this.setActiveFilterButton(filterButton);
            }
            this.applyFilter();
        }
    }

    /**
     * Handle filter change
     */
    handleFilterChange(event) {
        const button = event.currentTarget;
        const filter = button.dataset.filter;
        
        this.currentFilter = filter;
        this.setActiveFilterButton(button);
        this.applyFilter();
        this.renderTransactions();
    }

    /**
     * Handle sort change
     */
    handleSortChange(event) {
        this.currentSort = event.target.value;
        this.applySorting();
        this.renderTransactions();
    }

    /**
     * Handle search input
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredTransactions = [...this.transactions];
        } else {
            this.filteredTransactions = this.transactions.filter(transaction => 
                transaction.descripcion.toLowerCase().includes(searchTerm) ||
                transaction.categoria.toLowerCase().includes(searchTerm) ||
                transaction.banco?.toLowerCase().includes(searchTerm)
            );
        }
        
        this.applyFilter();
        this.renderTransactions();
    }

    /**
     * Apply current filter to transactions
     */
    applyFilter() {
        if (this.currentFilter === 'todos') {
            this.filteredTransactions = [...this.transactions];
        } else {
            this.filteredTransactions = this.transactions.filter(transaction => 
                transaction.tipo === this.currentFilter
            );
        }
        
        this.applySorting();
        this.updateTransactionCount();
    }

    /**
     * Apply current sorting to filtered transactions
     */
    applySorting() {
        this.filteredTransactions.sort((a, b) => {
            switch (this.currentSort) {
                case 'fecha':
                    return new Date(b.fecha) - new Date(a.fecha);
                case 'fecha-asc':
                    return new Date(a.fecha) - new Date(b.fecha);
                case 'monto':
                    return Math.abs(b.monto) - Math.abs(a.monto);
                case 'monto-asc':
                    return Math.abs(a.monto) - Math.abs(b.monto);
                case 'categoria':
                    return a.categoria.localeCompare(b.categoria);
                default:
                    return 0;
            }
        });
    }

    /**
     * Render transactions list
     */
    renderTransactions() {
        const container = document.querySelector('.historial__list');
        if (!container) return;

        if (this.filteredTransactions.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        const html = this.filteredTransactions.map(transaction => 
            this.createTransactionHTML(transaction)
        ).join('');

        container.innerHTML = html;
        this.bindTransactionEvents();
    }

    /**
     * Create HTML for a single transaction
     */
    createTransactionHTML(transaction) {
        const isIncome = transaction.tipo === 'ingreso';
        const amount = Math.abs(transaction.monto);
        const formattedAmount = Utils.formatCurrency(amount);
        const formattedDate = Utils.formatDate(transaction.fecha);
        
        return `
            <div class="transaction-item ${isIncome ? 'transaction-item--income' : 'transaction-item--expense'}" data-id="${transaction.id}">
                <div class="transaction-item__icon">
                    <i class="lucide-icon" data-lucide="${this.getCategoryIcon(transaction.categoria)}"></i>
                </div>
                <div class="transaction-item__info">
                    <div class="transaction-item__header">
                        <h3 class="transaction-item__title">${Utils.escapeHtml(transaction.descripcion)}</h3>
                        <span class="transaction-item__amount ${isIncome ? 'transaction-item__amount--income' : 'transaction-item__amount--expense'}">
                            ${isIncome ? '+' : '-'}${formattedAmount}
                        </span>
                    </div>
                    <div class="transaction-item__details">
                        <span class="transaction-item__category">${Utils.escapeHtml(transaction.categoria)}</span>
                        <span class="transaction-item__date">${formattedDate}</span>
                        ${transaction.banco ? `<span class="transaction-item__bank">${Utils.escapeHtml(transaction.banco)}</span>` : ''}
                    </div>
                </div>
                <div class="transaction-item__actions">
                    <button class="transaction-item__action transaction-item__action--edit" data-action="edit" title="Editar">
                        <i class="lucide-icon" data-lucide="edit"></i>
                    </button>
                    <button class="transaction-item__action transaction-item__action--delete" data-action="delete" title="Eliminar">
                        <i class="lucide-icon" data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Bind events to rendered transactions
     */
    bindTransactionEvents() {
        const actionButtons = document.querySelectorAll('.transaction-item__action');
        actionButtons.forEach(button => {
            button.addEventListener('click', this.handleTransactionAction.bind(this));
        });

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Handle transaction action buttons
     */
    handleTransactionAction(event) {
        event.stopPropagation();
        
        const button = event.currentTarget;
        const action = button.dataset.action;
        const transactionItem = button.closest('.transaction-item');
        const transactionId = parseInt(transactionItem.dataset.id);
        const transaction = this.transactions.find(t => t.id === transactionId);

        if (!transaction) return;

        switch (action) {
            case 'edit':
                this.editTransaction(transaction);
                break;
            case 'delete':
                this.showDeleteConfirmation(transaction);
                break;
        }
    }

    /**
     * Show add transaction modal
     */
    showAddTransactionModal() {
        this.editingTransaction = null;
        this.resetTransactionForm();
        UIManager.showModal('transactionModal');
    }

    /**
     * Edit transaction
     */
    editTransaction(transaction) {
        this.editingTransaction = transaction;
        this.populateTransactionForm(transaction);
        UIManager.showModal('transactionModal');
    }

    /**
     * Show delete confirmation
     */
    showDeleteConfirmation(transaction) {
        this.editingTransaction = transaction;
        
        const modal = document.getElementById('deleteModal');
        const messageElement = modal?.querySelector('.modal__message');
        if (messageElement) {
            messageElement.textContent = `¿Estás seguro de que deseas eliminar la transacción "${transaction.descripcion}"?`;
        }
        
        UIManager.showModal('deleteModal');
    }

    /**
     * Handle transaction form submit
     */
    async handleTransactionSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const transactionData = {
            descripcion: formData.get('descripcion'),
            monto: parseFloat(formData.get('monto')),
            categoria: formData.get('categoria'),
            tipo: formData.get('tipo'),
            fecha: formData.get('fecha'),
            banco: formData.get('banco') || ''
        };

        try {
            if (this.editingTransaction) {
                // Update existing transaction
                await TransactionManager.updateTransaction(this.editingTransaction.id, transactionData);
                Utils.showNotification('Transacción actualizada correctamente', 'success');
            } else {
                // Add new transaction
                await TransactionManager.addTransaction(transactionData);
                Utils.showNotification('Transacción agregada correctamente', 'success');
            }

            await this.loadTransactions();
            this.applyFilter();
            this.renderTransactions();
            UIManager.hideModal('transactionModal');
            
        } catch (error) {
            console.error('Error saving transaction:', error);
            Utils.showNotification('Error al guardar la transacción', 'error');
        }
    }

    /**
     * Handle delete confirmation
     */
    async handleDeleteConfirm() {
        if (!this.editingTransaction) return;

        try {
            await TransactionManager.deleteTransaction(this.editingTransaction.id);
            Utils.showNotification('Transacción eliminada correctamente', 'success');
            
            await this.loadTransactions();
            this.applyFilter();
            this.renderTransactions();
            UIManager.hideModal('deleteModal');
            
        } catch (error) {
            console.error('Error deleting transaction:', error);
            Utils.showNotification('Error al eliminar la transacción', 'error');
        }
    }

    /**
     * Helper methods
     */
    setActiveFilterButton(activeButton) {
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(btn => btn.classList.remove('filter-button--active'));
        activeButton.classList.add('filter-button--active');
    }

    updateTransactionCount() {
        const countElement = document.querySelector('.historial__count');
        if (countElement) {
            countElement.textContent = `${this.filteredTransactions.length} transacciones`;
        }
    }

    getCategoryIcon(category) {
        const icons = {
            'alimentacion': 'utensils',
            'transporte': 'car',
            'entretenimiento': 'film',
            'servicios': 'zap',
            'salario': 'dollar-sign',
            'freelance': 'briefcase',
            'inversion': 'trending-up',
            'otros': 'more-horizontal'
        };
        
        return icons[category.toLowerCase()] || 'circle';
    }

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="historial__empty">
                <div class="historial__empty-icon">
                    <i class="lucide-icon" data-lucide="inbox"></i>
                </div>
                <h3 class="historial__empty-title">No hay transacciones</h3>
                <p class="historial__empty-message">
                    ${this.currentFilter === 'todos' 
                        ? 'Aún no tienes transacciones registradas.' 
                        : `No hay transacciones de tipo "${this.currentFilter}".`}
                </p>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    resetTransactionForm() {
        const form = document.getElementById('transactionForm');
        if (form) {
            form.reset();
            form.querySelector('#fecha').value = Utils.getCurrentDate();
        }
    }

    populateTransactionForm(transaction) {
        const form = document.getElementById('transactionForm');
        if (!form) return;

        Object.keys(transaction).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = transaction[key];
            }
        });
    }

    formatAmountInput(event) {
        const input = event.target;
        const value = input.value.replace(/[^\d.,]/g, '');
        input.value = value;
    }

    handleCategoryChange(event) {
        const category = event.target.value;
        // Additional logic if needed when category changes
        console.log('Category changed to:', category);
    }

    /**
     * Export transactions to CSV
     */
    exportTransactions() {
        try {
            const csvContent = TransactionManager.exportToCSV(this.filteredTransactions);
            Utils.downloadCSV(csvContent, `transacciones_${Utils.getCurrentDate()}.csv`);
            Utils.showNotification('Transacciones exportadas correctamente', 'success');
        } catch (error) {
            console.error('Error exporting transactions:', error);
            Utils.showNotification('Error al exportar transacciones', 'error');
        }
    }

    /**
     * Refresh historial data
     */
    async refresh() {
        if (!this.isInitialized) return;
        
        await this.loadTransactions();
        this.applyFilter();
        this.renderTransactions();
    }

    /**
     * Destroy module and clean up
     */
    destroy() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.editingTransaction = null;
        this.isInitialized = false;
    }
}