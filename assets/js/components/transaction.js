/**
 * Transaction Component
 * Reusable transaction-related UI components
 */

import { Utils } from '../utils/helpers.js';
import { UIManager } from '../utils/ui.js';

export class TransactionComponent {
    /**
     * Create transaction card HTML
     */
    static createTransactionCard(transaction, options = {}) {
        const {
            showActions = true,
            showDate = true,
            showBank = true,
            compact = false
        } = options;

        const isIncome = transaction.tipo === 'ingreso';
        const amount = Math.abs(transaction.monto);
        const formattedAmount = Utils.formatCurrency(amount);
        const formattedDate = Utils.formatDate(transaction.fecha);
        const icon = this.getCategoryIcon(transaction.categoria);
        
        return `
            <div class="transaction-card ${compact ? 'transaction-card--compact' : ''} ${isIncome ? 'transaction-card--income' : 'transaction-card--expense'}" 
                 data-id="${transaction.id}">
                <div class="transaction-card__icon">
                    <i class="lucide-icon" data-lucide="${icon}"></i>
                </div>
                <div class="transaction-card__content">
                    <div class="transaction-card__header">
                        <h3 class="transaction-card__title">${Utils.escapeHtml(transaction.descripcion)}</h3>
                        <span class="transaction-card__amount ${isIncome ? 'transaction-card__amount--income' : 'transaction-card__amount--expense'}">
                            ${isIncome ? '+' : '-'}${formattedAmount}
                        </span>
                    </div>
                    <div class="transaction-card__details">
                        <span class="transaction-card__category">${Utils.escapeHtml(transaction.categoria)}</span>
                        ${showDate ? `<span class="transaction-card__date">${formattedDate}</span>` : ''}
                        ${showBank && transaction.banco ? `<span class="transaction-card__bank">${Utils.escapeHtml(transaction.banco)}</span>` : ''}
                    </div>
                </div>
                ${showActions ? this.createTransactionActions(transaction.id) : ''}
            </div>
        `;
    }

    /**
     * Create transaction actions HTML
     */
    static createTransactionActions(transactionId) {
        return `
            <div class="transaction-card__actions">
                <button class="transaction-card__action transaction-card__action--edit" 
                        data-action="edit" 
                        data-id="${transactionId}"
                        title="Editar">
                    <i class="lucide-icon" data-lucide="edit"></i>
                </button>
                <button class="transaction-card__action transaction-card__action--delete" 
                        data-action="delete" 
                        data-id="${transactionId}"
                        title="Eliminar">
                    <i class="lucide-icon" data-lucide="trash-2"></i>
                </button>
            </div>
        `;
    }

    /**
     * Create transaction list HTML
     */
    static createTransactionList(transactions, options = {}) {
        if (!transactions || transactions.length === 0) {
            return this.createEmptyTransactionList(options.emptyMessage);
        }

        const transactionsHtml = transactions.map(transaction => 
            this.createTransactionCard(transaction, options)
        ).join('');

        return `
            <div class="transaction-list">
                ${transactionsHtml}
            </div>
        `;
    }

    /**
     * Create empty transaction list
     */
    static createEmptyTransactionList(message = 'No hay transacciones disponibles') {
        return `
            <div class="transaction-list transaction-list--empty">
                <div class="transaction-list__empty">
                    <div class="transaction-list__empty-icon">
                        <i class="lucide-icon" data-lucide="inbox"></i>
                    </div>
                    <h3 class="transaction-list__empty-title">Sin transacciones</h3>
                    <p class="transaction-list__empty-message">${Utils.escapeHtml(message)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Create transaction form HTML
     */
    static createTransactionForm(transaction = null) {
        const isEdit = !!transaction;
        const formTitle = isEdit ? 'Editar Transacción' : 'Nueva Transacción';
        const submitText = isEdit ? 'Actualizar' : 'Guardar';

        return `
            <div class="transaction-form">
                <div class="transaction-form__header">
                    <h2 class="transaction-form__title">${formTitle}</h2>
                </div>
                <form class="transaction-form__form" id="transactionForm">
                    <div class="transaction-form__row">
                        <div class="transaction-form__field">
                            <label for="descripcion" class="transaction-form__label">Descripción *</label>
                            <input type="text" 
                                   id="descripcion" 
                                   name="descripcion" 
                                   class="transaction-form__input"
                                   value="${transaction ? Utils.escapeHtml(transaction.descripcion) : ''}"
                                   required
                                   placeholder="Ej: Compra supermercado">
                        </div>
                    </div>

                    <div class="transaction-form__row transaction-form__row--split">
                        <div class="transaction-form__field">
                            <label for="monto" class="transaction-form__label">Monto *</label>
                            <input type="number" 
                                   id="monto" 
                                   name="monto" 
                                   class="transaction-form__input"
                                   value="${transaction ? Math.abs(transaction.monto) : ''}"
                                   step="0.01"
                                   min="0"
                                   required
                                   placeholder="0.00">
                        </div>

                        <div class="transaction-form__field">
                            <label for="tipo" class="transaction-form__label">Tipo *</label>
                            <select id="tipo" name="tipo" class="transaction-form__select" required>
                                <option value="gasto" ${!transaction || transaction.tipo === 'gasto' ? 'selected' : ''}>Gasto</option>
                                <option value="ingreso" ${transaction && transaction.tipo === 'ingreso' ? 'selected' : ''}>Ingreso</option>
                            </select>
                        </div>
                    </div>

                    <div class="transaction-form__row transaction-form__row--split">
                        <div class="transaction-form__field">
                            <label for="categoria" class="transaction-form__label">Categoría *</label>
                            <select id="categoria" name="categoria" class="transaction-form__select" required>
                                ${this.createCategoryOptions(transaction?.categoria)}
                            </select>
                        </div>

                        <div class="transaction-form__field">
                            <label for="fecha" class="transaction-form__label">Fecha *</label>
                            <input type="date" 
                                   id="fecha" 
                                   name="fecha" 
                                   class="transaction-form__input"
                                   value="${transaction ? transaction.fecha : Utils.getCurrentDate()}"
                                   required>
                        </div>
                    </div>

                    <div class="transaction-form__row">
                        <div class="transaction-form__field">
                            <label for="banco" class="transaction-form__label">Banco/Cuenta</label>
                            <input type="text" 
                                   id="banco" 
                                   name="banco" 
                                   class="transaction-form__input"
                                   value="${transaction && transaction.banco ? Utils.escapeHtml(transaction.banco) : ''}"
                                   placeholder="Ej: Banco Nacional">
                        </div>
                    </div>

                    <div class="transaction-form__actions">
                        <button type="button" class="transaction-form__button transaction-form__button--cancel">
                            Cancelar
                        </button>
                        <button type="submit" class="transaction-form__button transaction-form__button--submit">
                            ${submitText}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Create category options for select
     */
    static createCategoryOptions(selectedCategory = '') {
        const categories = {
            'Gastos': [
                { value: 'alimentacion', label: 'Alimentación' },
                { value: 'transporte', label: 'Transporte' },
                { value: 'entretenimiento', label: 'Entretenimiento' },
                { value: 'servicios', label: 'Servicios' },
                { value: 'salud', label: 'Salud' },
                { value: 'educacion', label: 'Educación' },
                { value: 'hogar', label: 'Hogar' },
                { value: 'ropa', label: 'Ropa' }
            ],
            'Ingresos': [
                { value: 'salario', label: 'Salario' },
                { value: 'freelance', label: 'Freelance' },
                { value: 'inversion', label: 'Inversión' },
                { value: 'negocio', label: 'Negocio' },
                { value: 'regalo', label: 'Regalo' }
            ]
        };

        let optionsHtml = '';

        Object.entries(categories).forEach(([groupName, groupCategories]) => {
            optionsHtml += `<optgroup label="${groupName}">`;
            groupCategories.forEach(category => {
                const isSelected = category.value === selectedCategory ? 'selected' : '';
                optionsHtml += `<option value="${category.value}" ${isSelected}>${category.label}</option>`;
            });
            optionsHtml += `</optgroup>`;
        });

        // Add "Otros" option
        const isOtrosSelected = selectedCategory === 'otros' ? 'selected' : '';
        optionsHtml += `<option value="otros" ${isOtrosSelected}>Otros</option>`;

        return optionsHtml;
    }

    /**
     * Create transaction filter HTML
     */
    static createTransactionFilter(currentFilter = 'todos') {
        const filters = [
            { value: 'todos', label: 'Todas', icon: 'list' },
            { value: 'ingreso', label: 'Ingresos', icon: 'trending-up' },
            { value: 'gasto', label: 'Gastos', icon: 'trending-down' }
        ];

        const filtersHtml = filters.map(filter => {
            const isActive = filter.value === currentFilter;
            return `
                <button class="transaction-filter__button ${isActive ? 'transaction-filter__button--active' : ''}" 
                        data-filter="${filter.value}">
                    <i class="lucide-icon" data-lucide="${filter.icon}"></i>
                    <span>${filter.label}</span>
                </button>
            `;
        }).join('');

        return `
            <div class="transaction-filter">
                ${filtersHtml}
            </div>
        `;
    }

    /**
     * Create transaction summary HTML
     */
    static createTransactionSummary(transactions) {
        const summary = this.calculateTransactionSummary(transactions);

        return `
            <div class="transaction-summary">
                <div class="transaction-summary__item transaction-summary__item--income">
                    <div class="transaction-summary__icon">
                        <i class="lucide-icon" data-lucide="trending-up"></i>
                    </div>
                    <div class="transaction-summary__content">
                        <span class="transaction-summary__label">Ingresos</span>
                        <span class="transaction-summary__amount">+${Utils.formatCurrency(summary.totalIncome)}</span>
                    </div>
                </div>
                
                <div class="transaction-summary__item transaction-summary__item--expense">
                    <div class="transaction-summary__icon">
                        <i class="lucide-icon" data-lucide="trending-down"></i>
                    </div>
                    <div class="transaction-summary__content">
                        <span class="transaction-summary__label">Gastos</span>
                        <span class="transaction-summary__amount">-${Utils.formatCurrency(summary.totalExpense)}</span>
                    </div>
                </div>
                
                <div class="transaction-summary__item transaction-summary__item--balance">
                    <div class="transaction-summary__icon">
                        <i class="lucide-icon" data-lucide="dollar-sign"></i>
                    </div>
                    <div class="transaction-summary__content">
                        <span class="transaction-summary__label">Balance</span>
                        <span class="transaction-summary__amount ${summary.balance >= 0 ? 'transaction-summary__amount--positive' : 'transaction-summary__amount--negative'}">
                            ${summary.balance >= 0 ? '+' : ''}${Utils.formatCurrency(summary.balance)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create transaction search HTML
     */
    static createTransactionSearch() {
        return `
            <div class="transaction-search">
                <div class="transaction-search__input-container">
                    <i class="lucide-icon transaction-search__icon" data-lucide="search"></i>
                    <input type="text" 
                           class="transaction-search__input" 
                           placeholder="Buscar transacciones..."
                           aria-label="Buscar transacciones">
                </div>
            </div>
        `;
    }

    /**
     * Create transaction sort dropdown HTML
     */
    static createTransactionSort(currentSort = 'fecha') {
        const sortOptions = [
            { value: 'fecha', label: 'Fecha (Reciente)' },
            { value: 'fecha-asc', label: 'Fecha (Antigua)' },
            { value: 'monto', label: 'Monto (Mayor)' },
            { value: 'monto-asc', label: 'Monto (Menor)' },
            { value: 'categoria', label: 'Categoría (A-Z)' }
        ];

        const optionsHtml = sortOptions.map(option => {
            const isSelected = option.value === currentSort ? 'selected' : '';
            return `<option value="${option.value}" ${isSelected}>${option.label}</option>`;
        }).join('');

        return `
            <div class="transaction-sort">
                <label for="transactionSort" class="transaction-sort__label">Ordenar por:</label>
                <select id="transactionSort" class="transaction-sort__select">
                    ${optionsHtml}
                </select>
            </div>
        `;
    }

    /**
     * Helper methods
     */
    static getCategoryIcon(category) {
        const icons = {
            'alimentacion': 'utensils',
            'transporte': 'car',
            'entretenimiento': 'film',
            'servicios': 'zap',
            'salud': 'heart',
            'educacion': 'book',
            'hogar': 'home',
            'ropa': 'shirt',
            'salario': 'dollar-sign',
            'freelance': 'briefcase',
            'inversion': 'trending-up',
            'negocio': 'building',
            'regalo': 'gift',
            'otros': 'more-horizontal'
        };
        
        return icons[category?.toLowerCase()] || 'circle';
    }

    /**
     * Calculate transaction summary
     */
    static calculateTransactionSummary(transactions) {
        const summary = transactions.reduce((acc, transaction) => {
            const amount = Math.abs(transaction.monto);
            
            if (transaction.tipo === 'ingreso') {
                acc.totalIncome += amount;
                acc.incomeCount++;
            } else {
                acc.totalExpense += amount;
                acc.expenseCount++;
            }
            
            return acc;
        }, {
            totalIncome: 0,
            totalExpense: 0,
            incomeCount: 0,
            expenseCount: 0
        });

        summary.balance = summary.totalIncome - summary.totalExpense;
        summary.total = transactions.length;

        return summary;
    }

    /**
     * Group transactions by date
     */
    static groupTransactionsByDate(transactions) {
        return transactions.reduce((groups, transaction) => {
            const date = transaction.fecha;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(transaction);
            return groups;
        }, {});
    }

    /**
     * Group transactions by category
     */
    static groupTransactionsByCategory(transactions) {
        return transactions.reduce((groups, transaction) => {
            const category = transaction.categoria;
            if (!groups[category]) {
                groups[category] = {
                    transactions: [],
                    total: 0,
                    count: 0
                };
            }
            groups[category].transactions.push(transaction);
            groups[category].total += Math.abs(transaction.monto);
            groups[category].count++;
            return groups;
        }, {});
    }

    /**
     * Create grouped transaction list HTML
     */
    static createGroupedTransactionList(groupedTransactions, groupType = 'date') {
        if (Object.keys(groupedTransactions).length === 0) {
            return this.createEmptyTransactionList();
        }

        let groupsHtml = '';
        
        Object.entries(groupedTransactions).forEach(([groupKey, groupData]) => {
            const transactions = Array.isArray(groupData) ? groupData : groupData.transactions;
            const groupTitle = this.formatGroupTitle(groupKey, groupType);
            
            groupsHtml += `
                <div class="transaction-group">
                    <div class="transaction-group__header">
                        <h3 class="transaction-group__title">${groupTitle}</h3>
                        ${groupType === 'category' && groupData.total ? 
                            `<span class="transaction-group__total">${Utils.formatCurrency(groupData.total)}</span>` 
                            : ''}
                    </div>
                    <div class="transaction-group__content">
                        ${transactions.map(transaction => 
                            this.createTransactionCard(transaction, { compact: true })
                        ).join('')}
                    </div>
                </div>
            `;
        });

        return `
            <div class="transaction-list transaction-list--grouped">
                ${groupsHtml}
            </div>
        `;
    }

    /**
     * Format group title based on type
     */
    static formatGroupTitle(key, type) {
        switch (type) {
            case 'date':
                return Utils.formatDate(key);
            case 'category':
                return key.charAt(0).toUpperCase() + key.slice(1);
            default:
                return key;
        }
    }

    /**
     * Render transaction component to container
     */
    static render(container, html) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            container.innerHTML = html;
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
}