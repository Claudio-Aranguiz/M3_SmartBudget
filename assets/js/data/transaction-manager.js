/**
 * Transaction Database Manager
 * Handles all transaction operations with the JSON database
 */

/**
 * Load transactions database
 */
async function loadTransactionsDB() {
    try {
        const response = await fetch('../assets/data/transactions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Error loading transactions database:', error);
        return {
            transactions: [],
            categories: [],
            paymentMethods: []
        };
    }
}

/**
 * Get all transactions for a specific user
 * @param {number} userId - User ID
 * @returns {Array} User transactions
 */
export async function getUserTransactions(userId) {
    try {
        const db = await loadTransactionsDB();
        return db.transactions.filter(transaction => transaction.userId === userId);
    } catch (error) {
        console.error('❌ Error getting user transactions:', error);
        return [];
    }
}

/**
 * Get all transactions (admin only)
 * @returns {Array} All transactions
 */
export async function getAllTransactions() {
    try {
        const db = await loadTransactionsDB();
        return db.transactions;
    } catch (error) {
        console.error('❌ Error getting all transactions:', error);
        return [];
    }
}

/**
 * Get transactions by date range
 * @param {number} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Filtered transactions
 */
export async function getTransactionsByDateRange(userId, startDate, endDate) {
    try {
        const transactions = await getUserTransactions(userId);
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return transactionDate >= start && transactionDate <= end;
        });
    } catch (error) {
        console.error('❌ Error getting transactions by date range:', error);
        return [];
    }
}

/**
 * Get transactions by category
 * @param {number} userId - User ID
 * @param {string} category - Category name
 * @returns {Array} Filtered transactions
 */
export async function getTransactionsByCategory(userId, category) {
    try {
        const transactions = await getUserTransactions(userId);
        return transactions.filter(transaction => 
            transaction.category.toLowerCase() === category.toLowerCase()
        );
    } catch (error) {
        console.error('❌ Error getting transactions by category:', error);
        return [];
    }
}

/**
 * Get transactions by type
 * @param {number} userId - User ID
 * @param {string} type - Transaction type ('ingreso' or 'gasto')
 * @returns {Array} Filtered transactions
 */
export async function getTransactionsByType(userId, type) {
    try {
        const transactions = await getUserTransactions(userId);
        return transactions.filter(transaction => transaction.type === type);
    } catch (error) {
        console.error('❌ Error getting transactions by type:', error);
        return [];
    }
}

/**
 * Add a new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Object} Created transaction or null if error
 */
export async function addTransaction(transactionData) {
    try {
        const db = await loadTransactionsDB();
        
        // Generate new ID
        const newId = Math.max(...db.transactions.map(t => t.id), 0) + 1;
        
        // Create new transaction
        const newTransaction = {
            id: newId,
            userId: transactionData.userId,
            type: transactionData.type,
            amount: parseFloat(transactionData.amount),
            category: transactionData.category,
            description: transactionData.description || '',
            paymentMethod: transactionData.paymentMethod || 'efectivo',
            date: transactionData.date || new Date().toISOString().split('T')[0],
            status: transactionData.status || 'completada',
            addedBy: transactionData.addedBy || 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // In a real application, this would save to the database
        // For now, we'll return the new transaction
        console.log('✅ New transaction created:', newTransaction);
        return newTransaction;
        
    } catch (error) {
        console.error('❌ Error adding transaction:', error);
        return null;
    }
}

/**
 * Calculate user balance from transactions
 * @param {number} userId - User ID
 * @returns {number} Current balance
 */
export async function calculateUserBalance(userId) {
    try {
        const transactions = await getUserTransactions(userId);
        let balance = 0;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'ingreso') {
                balance += transaction.amount;
            } else if (transaction.type === 'gasto') {
                balance -= transaction.amount;
            }
        });
        
        return balance;
    } catch (error) {
        console.error('❌ Error calculating user balance:', error);
        return 0;
    }
}

/**
 * Get transaction statistics for dashboard
 * @param {number} userId - User ID
 * @returns {Object} Statistics object
 */
export async function getTransactionStatistics(userId) {
    try {
        const transactions = await getUserTransactions(userId);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Filter current month transactions
        const currentMonthTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });
        
        // Calculate totals
        const totalIncome = currentMonthTransactions
            .filter(t => t.type === 'ingreso')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = currentMonthTransactions
            .filter(t => t.type === 'gasto')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Group by category for charts
        const expensesByCategory = currentMonthTransactions
            .filter(t => t.type === 'gasto')
            .reduce((acc, transaction) => {
                const category = transaction.category;
                acc[category] = (acc[category] || 0) + transaction.amount;
                return acc;
            }, {});
        
        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            transactionCount: currentMonthTransactions.length,
            expensesByCategory,
            recentTransactions: transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
        };
        
    } catch (error) {
        console.error('❌ Error getting transaction statistics:', error);
        return {
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0,
            transactionCount: 0,
            expensesByCategory: {},
            recentTransactions: []
        };
    }
}

/**
 * Get available categories
 * @returns {Array} Categories array
 */
export async function getCategories() {
    try {
        const db = await loadTransactionsDB();
        return db.categories;
    } catch (error) {
        console.error('❌ Error getting categories:', error);
        return [];
    }
}

/**
 * Get available payment methods
 * @returns {Array} Payment methods array
 */
export async function getPaymentMethods() {
    try {
        const db = await loadTransactionsDB();
        return db.paymentMethods;
    } catch (error) {
        console.error('❌ Error getting payment methods:', error);
        return [];
    }
}

/**
 * Update transaction
 * @param {number} transactionId - Transaction ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated transaction or null if error
 */
export async function updateTransaction(transactionId, updateData) {
    try {
        // In a real application, this would update the database
        // For now, we'll just return the updated data
        const updatedTransaction = {
            ...updateData,
            id: transactionId,
            updatedAt: new Date().toISOString()
        };
        
        console.log('✅ Transaction updated:', updatedTransaction);
        return updatedTransaction;
        
    } catch (error) {
        console.error('❌ Error updating transaction:', error);
        return null;
    }
}

/**
 * Delete transaction
 * @param {number} transactionId - Transaction ID
 * @returns {boolean} Success status
 */
export async function deleteTransaction(transactionId) {
    try {
        // In a real application, this would delete from the database
        console.log('✅ Transaction deleted:', transactionId);
        return true;
        
    } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        return false;
    }
}