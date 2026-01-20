/**
 * Transaction Data Manager
 * Handles all transaction-related data operations
 */

import { StorageManager } from './storage.js';
import { Utils } from '../utils/helpers.js';

export class TransactionManager {
    static STORAGE_KEY = 'smartbudget_transactions';
    static mockTransactions = [
        {
            id: 1,
            descripcion: 'Salario mensual',
            monto: 3500.00,
            categoria: 'salario',
            tipo: 'ingreso',
            fecha: '2024-01-15',
            banco: 'Banco Nacional'
        },
        {
            id: 2,
            descripcion: 'Supermercado',
            monto: -250.75,
            categoria: 'alimentacion',
            tipo: 'gasto',
            fecha: '2024-01-14',
            banco: 'Tarjeta de Crédito'
        },
        {
            id: 3,
            descripcion: 'Gasolina',
            monto: -85.00,
            categoria: 'transporte',
            tipo: 'gasto',
            fecha: '2024-01-13',
            banco: 'Banco Nacional'
        },
        {
            id: 4,
            descripcion: 'Freelance - Desarrollo web',
            monto: 800.00,
            categoria: 'freelance',
            tipo: 'ingreso',
            fecha: '2024-01-12',
            banco: ''
        },
        {
            id: 5,
            descripcion: 'Netflix',
            monto: -12.99,
            categoria: 'entretenimiento',
            tipo: 'gasto',
            fecha: '2024-01-11',
            banco: 'Tarjeta de Débito'
        },
        {
            id: 6,
            descripcion: 'Electricidad',
            monto: -125.50,
            categoria: 'servicios',
            tipo: 'gasto',
            fecha: '2024-01-10',
            banco: 'Banco Nacional'
        },
        {
            id: 7,
            descripcion: 'Dividendos',
            monto: 150.00,
            categoria: 'inversion',
            tipo: 'ingreso',
            fecha: '2024-01-09',
            banco: 'Banco de Inversiones'
        },
        {
            id: 8,
            descripcion: 'Almuerzo',
            monto: -25.00,
            categoria: 'alimentacion',
            tipo: 'gasto',
            fecha: '2024-01-08',
            banco: 'Efectivo'
        }
    ];

    /**
     * Initialize transaction data
     */
    static init() {
        const existingTransactions = this.getAllTransactions();
        
        // Load mock data if no transactions exist
        if (existingTransactions.length === 0) {
            this.loadMockData();
        }
    }

    /**
     * Load mock transaction data
     */
    static loadMockData() {
        StorageManager.setItem(this.STORAGE_KEY, this.mockTransactions);
    }

    /**
     * Get all transactions
     */
    static getAllTransactions() {
        return StorageManager.getItem(this.STORAGE_KEY) || [];
    }

    /**
     * Get transaction by ID
     */
    static getTransactionById(id) {
        const transactions = this.getAllTransactions();
        return transactions.find(t => t.id === parseInt(id));
    }

    /**
     * Get transactions by type (ingreso/gasto)
     */
    static getTransactionsByType(type) {
        const transactions = this.getAllTransactions();
        return transactions.filter(t => t.tipo === type);
    }

    /**
     * Get transactions by category
     */
    static getTransactionsByCategory(category) {
        const transactions = this.getAllTransactions();
        return transactions.filter(t => t.categoria === category);
    }

    /**
     * Get transactions by date range
     */
    static getTransactionsByDateRange(startDate, endDate) {
        const transactions = this.getAllTransactions();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return transactions.filter(t => {
            const transactionDate = new Date(t.fecha);
            return transactionDate >= start && transactionDate <= end;
        });
    }

    /**
     * Get recent transactions
     */
    static getRecentTransactions(limit = 10) {
        const transactions = this.getAllTransactions();
        
        return transactions
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, limit);
    }

    /**
     * Add new transaction
     */
    static async addTransaction(transactionData) {
        try {
            const transactions = this.getAllTransactions();
            
            // Generate new ID
            const newId = transactions.length > 0 
                ? Math.max(...transactions.map(t => t.id)) + 1 
                : 1;

            // Create transaction object
            const newTransaction = {
                id: newId,
                descripcion: transactionData.descripcion || '',
                monto: parseFloat(transactionData.monto) || 0,
                categoria: transactionData.categoria || 'otros',
                tipo: transactionData.tipo || 'gasto',
                fecha: transactionData.fecha || Utils.getCurrentDate(),
                banco: transactionData.banco || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Ensure correct sign for amount based on type
            if (newTransaction.tipo === 'gasto' && newTransaction.monto > 0) {
                newTransaction.monto = -Math.abs(newTransaction.monto);
            } else if (newTransaction.tipo === 'ingreso' && newTransaction.monto < 0) {
                newTransaction.monto = Math.abs(newTransaction.monto);
            }

            transactions.push(newTransaction);
            StorageManager.setItem(this.STORAGE_KEY, transactions);

            return {
                success: true,
                transaction: newTransaction
            };
        } catch (error) {
            console.error('Error adding transaction:', error);
            return {
                success: false,
                error: 'Error al agregar la transacción'
            };
        }
    }

    /**
     * Update existing transaction
     */
    static async updateTransaction(id, transactionData) {
        try {
            const transactions = this.getAllTransactions();
            const index = transactions.findIndex(t => t.id === parseInt(id));
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'Transacción no encontrada'
                };
            }

            // Update transaction
            const updatedTransaction = {
                ...transactions[index],
                descripcion: transactionData.descripcion || transactions[index].descripcion,
                monto: parseFloat(transactionData.monto) || transactions[index].monto,
                categoria: transactionData.categoria || transactions[index].categoria,
                tipo: transactionData.tipo || transactions[index].tipo,
                fecha: transactionData.fecha || transactions[index].fecha,
                banco: transactionData.banco !== undefined ? transactionData.banco : transactions[index].banco,
                updatedAt: new Date().toISOString()
            };

            // Ensure correct sign for amount based on type
            if (updatedTransaction.tipo === 'gasto' && updatedTransaction.monto > 0) {
                updatedTransaction.monto = -Math.abs(updatedTransaction.monto);
            } else if (updatedTransaction.tipo === 'ingreso' && updatedTransaction.monto < 0) {
                updatedTransaction.monto = Math.abs(updatedTransaction.monto);
            }

            transactions[index] = updatedTransaction;
            StorageManager.setItem(this.STORAGE_KEY, transactions);

            return {
                success: true,
                transaction: updatedTransaction
            };
        } catch (error) {
            console.error('Error updating transaction:', error);
            return {
                success: false,
                error: 'Error al actualizar la transacción'
            };
        }
    }

    /**
     * Delete transaction
     */
    static async deleteTransaction(id) {
        try {
            const transactions = this.getAllTransactions();
            const index = transactions.findIndex(t => t.id === parseInt(id));
            
            if (index === -1) {
                return {
                    success: false,
                    error: 'Transacción no encontrada'
                };
            }

            const deletedTransaction = transactions[index];
            transactions.splice(index, 1);
            StorageManager.setItem(this.STORAGE_KEY, transactions);

            return {
                success: true,
                transaction: deletedTransaction
            };
        } catch (error) {
            console.error('Error deleting transaction:', error);
            return {
                success: false,
                error: 'Error al eliminar la transacción'
            };
        }
    }

    /**
     * Delete multiple transactions
     */
    static async deleteTransactions(ids) {
        try {
            const transactions = this.getAllTransactions();
            const idsToDelete = ids.map(id => parseInt(id));
            
            const remainingTransactions = transactions.filter(t => !idsToDelete.includes(t.id));
            const deletedCount = transactions.length - remainingTransactions.length;
            
            StorageManager.setItem(this.STORAGE_KEY, remainingTransactions);

            return {
                success: true,
                deletedCount
            };
        } catch (error) {
            console.error('Error deleting multiple transactions:', error);
            return {
                success: false,
                error: 'Error al eliminar las transacciones'
            };
        }
    }

    /**
     * Search transactions
     */
    static searchTransactions(searchTerm, options = {}) {
        const transactions = this.getAllTransactions();
        const term = searchTerm.toLowerCase();
        
        const {
            searchFields = ['descripcion', 'categoria', 'banco'],
            exactMatch = false
        } = options;

        return transactions.filter(transaction => {
            return searchFields.some(field => {
                const fieldValue = transaction[field]?.toLowerCase() || '';
                
                if (exactMatch) {
                    return fieldValue === term;
                } else {
                    return fieldValue.includes(term);
                }
            });
        });
    }

    /**
     * Get transaction statistics
     */
    static getTransactionStats(dateRange = null) {
        let transactions = this.getAllTransactions();
        
        // Filter by date range if provided
        if (dateRange) {
            transactions = this.getTransactionsByDateRange(dateRange.start, dateRange.end);
        }

        const stats = {
            total: transactions.length,
            totalIncome: 0,
            totalExpenses: 0,
            incomeCount: 0,
            expenseCount: 0,
            categories: {},
            monthlyTrends: {},
            averageTransaction: 0,
            largestIncome: null,
            largestExpense: null
        };

        transactions.forEach(transaction => {
            const amount = Math.abs(transaction.monto);
            const month = transaction.fecha.substring(0, 7); // YYYY-MM

            // Total amounts and counts
            if (transaction.tipo === 'ingreso') {
                stats.totalIncome += amount;
                stats.incomeCount++;
                
                if (!stats.largestIncome || amount > Math.abs(stats.largestIncome.monto)) {
                    stats.largestIncome = transaction;
                }
            } else {
                stats.totalExpenses += amount;
                stats.expenseCount++;
                
                if (!stats.largestExpense || amount > Math.abs(stats.largestExpense.monto)) {
                    stats.largestExpense = transaction;
                }
            }

            // Category statistics
            if (!stats.categories[transaction.categoria]) {
                stats.categories[transaction.categoria] = {
                    total: 0,
                    count: 0,
                    type: transaction.tipo
                };
            }
            stats.categories[transaction.categoria].total += amount;
            stats.categories[transaction.categoria].count++;

            // Monthly trends
            if (!stats.monthlyTrends[month]) {
                stats.monthlyTrends[month] = {
                    income: 0,
                    expenses: 0,
                    transactions: 0
                };
            }
            
            if (transaction.tipo === 'ingreso') {
                stats.monthlyTrends[month].income += amount;
            } else {
                stats.monthlyTrends[month].expenses += amount;
            }
            stats.monthlyTrends[month].transactions++;
        });

        // Calculate derived statistics
        stats.balance = stats.totalIncome - stats.totalExpenses;
        stats.averageTransaction = stats.total > 0 ? (stats.totalIncome + stats.totalExpenses) / stats.total : 0;
        stats.savingsRate = stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100 : 0;

        return stats;
    }

    /**
     * Get transactions grouped by category
     */
    static getTransactionsGroupedByCategory() {
        const transactions = this.getAllTransactions();
        const grouped = {};

        transactions.forEach(transaction => {
            if (!grouped[transaction.categoria]) {
                grouped[transaction.categoria] = [];
            }
            grouped[transaction.categoria].push(transaction);
        });

        return grouped;
    }

    /**
     * Get transactions grouped by month
     */
    static getTransactionsGroupedByMonth() {
        const transactions = this.getAllTransactions();
        const grouped = {};

        transactions.forEach(transaction => {
            const month = transaction.fecha.substring(0, 7); // YYYY-MM
            
            if (!grouped[month]) {
                grouped[month] = [];
            }
            grouped[month].push(transaction);
        });

        return grouped;
    }

    /**
     * Export transactions to CSV
     */
    static exportToCSV(transactions = null) {
        const data = transactions || this.getAllTransactions();
        
        const headers = ['ID', 'Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto', 'Banco'];
        const rows = data.map(transaction => [
            transaction.id,
            transaction.fecha,
            transaction.descripcion,
            transaction.categoria,
            transaction.tipo,
            transaction.monto,
            transaction.banco || ''
        ]);

        return Utils.arrayToCSV([headers, ...rows]);
    }

    /**
     * Import transactions from CSV
     */
    static async importFromCSV(csvContent) {
        try {
            const rows = Utils.parseCSV(csvContent);
            
            if (rows.length < 2) {
                return {
                    success: false,
                    error: 'El archivo CSV debe contener al menos una fila de datos'
                };
            }

            const headers = rows[0];
            const dataRows = rows.slice(1);
            
            // Validate headers
            const requiredHeaders = ['descripcion', 'monto', 'categoria', 'tipo', 'fecha'];
            const missingHeaders = requiredHeaders.filter(header => 
                !headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
            );

            if (missingHeaders.length > 0) {
                return {
                    success: false,
                    error: `Faltan las siguientes columnas: ${missingHeaders.join(', ')}`
                };
            }

            // Process rows
            const importedTransactions = [];
            const errors = [];

            for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                const transaction = {};

                // Map CSV columns to transaction properties
                headers.forEach((header, index) => {
                    const value = row[index] || '';
                    const lowerHeader = header.toLowerCase();

                    if (lowerHeader.includes('descripcion')) {
                        transaction.descripcion = value;
                    } else if (lowerHeader.includes('monto')) {
                        transaction.monto = parseFloat(value) || 0;
                    } else if (lowerHeader.includes('categoria')) {
                        transaction.categoria = value;
                    } else if (lowerHeader.includes('tipo')) {
                        transaction.tipo = value;
                    } else if (lowerHeader.includes('fecha')) {
                        transaction.fecha = value;
                    } else if (lowerHeader.includes('banco')) {
                        transaction.banco = value;
                    }
                });

                // Validate transaction
                if (!transaction.descripcion || !transaction.monto || !transaction.categoria || !transaction.tipo) {
                    errors.push(`Fila ${i + 2}: Faltan campos requeridos`);
                    continue;
                }

                if (!['ingreso', 'gasto'].includes(transaction.tipo)) {
                    errors.push(`Fila ${i + 2}: Tipo debe ser 'ingreso' o 'gasto'`);
                    continue;
                }

                const result = await this.addTransaction(transaction);
                if (result.success) {
                    importedTransactions.push(result.transaction);
                } else {
                    errors.push(`Fila ${i + 2}: ${result.error}`);
                }
            }

            return {
                success: true,
                importedCount: importedTransactions.length,
                errors: errors.length > 0 ? errors : null,
                transactions: importedTransactions
            };

        } catch (error) {
            console.error('Error importing CSV:', error);
            return {
                success: false,
                error: 'Error al procesar el archivo CSV'
            };
        }
    }

    /**
     * Get transaction categories with usage count
     */
    static getCategories() {
        const transactions = this.getAllTransactions();
        const categories = {};

        transactions.forEach(transaction => {
            if (!categories[transaction.categoria]) {
                categories[transaction.categoria] = {
                    name: transaction.categoria,
                    count: 0,
                    totalAmount: 0,
                    type: transaction.tipo
                };
            }
            categories[transaction.categoria].count++;
            categories[transaction.categoria].totalAmount += Math.abs(transaction.monto);
        });

        return Object.values(categories).sort((a, b) => b.count - a.count);
    }

    /**
     * Clear all transaction data
     */
    static clearAllData() {
        StorageManager.removeItem(this.STORAGE_KEY);
        return true;
    }

    /**
     * Backup transaction data
     */
    static backupData() {
        const transactions = this.getAllTransactions();
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: transactions
        };

        return JSON.stringify(backup, null, 2);
    }

    /**
     * Restore transaction data from backup
     */
    static restoreFromBackup(backupJson) {
        try {
            const backup = JSON.parse(backupJson);
            
            if (!backup.data || !Array.isArray(backup.data)) {
                return {
                    success: false,
                    error: 'Formato de backup inválido'
                };
            }

            StorageManager.setItem(this.STORAGE_KEY, backup.data);

            return {
                success: true,
                restoredCount: backup.data.length,
                backupDate: backup.timestamp
            };
        } catch (error) {
            console.error('Error restoring backup:', error);
            return {
                success: false,
                error: 'Error al restaurar el backup'
            };
        }
    }

    /**
     * Validate transaction data
     */
    static validateTransaction(transactionData) {
        const errors = [];

        // Required fields
        if (!transactionData.descripcion || transactionData.descripcion.trim().length === 0) {
            errors.push('La descripción es requerida');
        }

        if (!transactionData.monto || isNaN(transactionData.monto) || transactionData.monto === 0) {
            errors.push('El monto debe ser un número válido mayor a 0');
        }

        if (!transactionData.categoria || transactionData.categoria.trim().length === 0) {
            errors.push('La categoría es requerida');
        }

        if (!transactionData.tipo || !['ingreso', 'gasto'].includes(transactionData.tipo)) {
            errors.push('El tipo debe ser "ingreso" o "gasto"');
        }

        if (!transactionData.fecha) {
            errors.push('La fecha es requerida');
        } else if (isNaN(new Date(transactionData.fecha).getTime())) {
            errors.push('La fecha debe tener un formato válido');
        }

        // Optional validations
        if (transactionData.descripcion && transactionData.descripcion.length > 100) {
            errors.push('La descripción no puede exceder 100 caracteres');
        }

        if (transactionData.banco && transactionData.banco.length > 50) {
            errors.push('El nombre del banco no puede exceder 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get transaction count
     */
    static getTransactionCount() {
        return this.getAllTransactions().length;
    }

    /**
     * Check if transactions exist
     */
    static hasTransactions() {
        return this.getTransactionCount() > 0;
    }
}