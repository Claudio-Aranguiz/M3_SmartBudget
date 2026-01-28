/**
 * Transaction Utilities - Funciones simples para historial y filtros
 */

/**
 * Cargar todas las transacciones
 */
async function loadTransactions() {
    try {
        const response = await fetch('../assets/data/transactions.json');
        const data = await response.json();
        return data.transactions;
    } catch (error) {
        console.error('❌ Error cargando transacciones:', error);
        return [];
    }
}

/**
 * Obtener transacciones de un usuario específico
 */
async function getUserTransactions(userId) {
    const allTransactions = await loadTransactions();
    return allTransactions.filter(transaction => transaction.userId === userId);
}

/**
 * Calcular balance de un usuario
 */
async function calculateUserBalance(userId) {
    const transactions = await getUserTransactions(userId);
    return transactions.reduce((balance, transaction) => {
        if (transaction.type === 'ingreso') {
            return balance + transaction.amount;
        } else if (transaction.type === 'gasto') {
            return balance - transaction.amount;
        }
        return balance;
    }, 0);
}

/**
 * Filtrar transacciones por tipo
 */
function filterByType(transactions, type) {
    if (type === 'todos') return transactions;
    return transactions.filter(t => t.type === type);
}

/**
 * Filtrar transacciones por fecha
 */
function filterByDateRange(transactions, startDate, endDate) {
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2099-12-31');
        return transactionDate >= start && transactionDate <= end;
    });
}

/**
 * Ordenar transacciones
 */
function sortTransactions(transactions, sortBy = 'date', order = 'desc') {
    return [...transactions].sort((a, b) => {
        let compareValue = 0;
        
        switch (sortBy) {
            case 'date':
                compareValue = new Date(a.date) - new Date(b.date);
                break;
            case 'amount':
                compareValue = a.amount - b.amount;
                break;
            case 'description':
                compareValue = a.description.localeCompare(b.description);
                break;
            default:
                compareValue = 0;
        }
        
        return order === 'desc' ? -compareValue : compareValue;
    });
}

/**
 * Test completo - Verificar que las transacciones se guardaron correctamente
 */
async function runTransactionTest() {
    console.log('🧪 === TEST DE TRANSACCIONES ===');
    
    try {
        // Cargar todas las transacciones
        const allTransactions = await loadTransactions();
        console.log(`📊 Total de transacciones: ${allTransactions.length}`);
        
        // Verificar las nuevas transacciones (IDs 16 y 17)
        const testTransaction1 = allTransactions.find(t => t.id === 16);
        const testTransaction2 = allTransactions.find(t => t.id === 17);
        
        if (testTransaction1) {
            console.log('✅ Transacción de gasto encontrada:', testTransaction1);
        } else {
            console.log('❌ Transacción de gasto no encontrada');
        }
        
        if (testTransaction2) {
            console.log('✅ Transacción de ingreso encontrada:', testTransaction2);
        } else {
            console.log('❌ Transacción de ingreso no encontrada');
        }
        
        // Calcular balance del usuario de test (ID: 2 - María González)
        const userId = 2;
        const userTransactions = await getUserTransactions(userId);
        const balance = await calculateUserBalance(userId);
        
        console.log(`👤 Usuario ID ${userId}:`);
        console.log(`📋 Total transacciones: ${userTransactions.length}`);
        console.log(`💰 Balance calculado: $${balance.toFixed(2)}`);
        
        // Mostrar detalle de transacciones por tipo
        const ingresos = filterByType(userTransactions, 'ingreso');
        const gastos = filterByType(userTransactions, 'gasto');
        
        console.log(`📈 Ingresos: ${ingresos.length} transacciones, $${ingresos.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`);
        console.log(`📉 Gastos: ${gastos.length} transacciones, $${gastos.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`);
        
        // Test de filtros
        const sortedByDate = sortTransactions(userTransactions, 'date', 'desc');
        console.log('📅 Transacciones ordenadas por fecha (más recientes primero):');
        console.table(sortedByDate);
        
        console.log('✅ Test completado exitosamente');
        return {
            success: true,
            totalTransactions: allTransactions.length,
            userTransactions: userTransactions.length,
            balance: balance,
            testTransactionsFound: !!testTransaction1 && !!testTransaction2
        };
        
    } catch (error) {
        console.error('❌ Error en el test:', error);
        return { success: false, error: error.message };
    }
}

// Exportar funciones para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadTransactions,
        getUserTransactions,
        calculateUserBalance,
        filterByType,
        filterByDateRange,
        sortTransactions,
        runTransactionTest
    };
}

// Para uso global en el navegador
if (typeof window !== 'undefined') {
    window.TransactionUtils = {
        loadTransactions,
        getUserTransactions,
        calculateUserBalance,
        filterByType,
        filterByDateRange,
        sortTransactions,
        runTransactionTest
    };
}