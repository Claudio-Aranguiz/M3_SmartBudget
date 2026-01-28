/**
 * SmartBudget Authentication System
 * Sistema completo de autenticación con base de datos JSON
 */

// Base de datos de usuarios (simulada)
let USERS_DATABASE = null;

/**
 * Cargar base de datos de usuarios
 */
async function loadUsersDatabase() {
    try {
        const response = await fetch('../assets/data/users.json');
        const data = await response.json();
        USERS_DATABASE = data;
        return data;
    } catch (error) {
        console.error('❌ Error loading users database:', error);
        // Fallback con datos mínimos si falla la carga
        USERS_DATABASE = {
            users: [
                // Eliminado usuario admin
                {
                    id: 2,
                    email: "demo@smartbudget.com",
                    password: "demo123",
                    name: "Usuario Demo",
                    role: "user",
                    isActive: true,
                    accountBalance: 1500.00
                }
            ]
        };
        return USERS_DATABASE;
    }
}

/**
 * Autenticar usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object|null} - Datos del usuario si es válido, null si no
 */
export async function authenticateUser(email, password) {
    // Cargar BD si no está cargada
    if (!USERS_DATABASE) {
        await loadUsersDatabase();
    }
    
    // Buscar usuario en la base de datos
    const user = USERS_DATABASE.users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.isActive
    );
    
    if (user) {
        // Actualizar último login
        user.lastLogin = new Date().toISOString();
        
        // Guardar sesión
        const sessionData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accountBalance: user.accountBalance || 0,
            monthlyBudget: user.monthlyBudget || 0,
            loginTime: user.lastLogin,
            isAuthenticated: true
        };
        
        localStorage.setItem('smartbudget-user', JSON.stringify(sessionData));
        localStorage.setItem('smartbudget-authenticated', 'true');
        
        console.log('✅ Authentication successful:', user.name);
        return sessionData;
    }
    
    console.log('❌ Authentication failed for:', email);
    return null;
}



/**
 * Calcular balance actual del usuario desde la base de datos de transacciones
 * @param {number} userId - ID del usuario
 * @returns {number} - Balance actual
 */
export async function getUserAccountBalance(userId) {
    try {
        // Cargar transacciones del archivo JSON
        const response = await fetch('../assets/data/transactions.json');
        const data = await response.json();
        
        // Filtrar transacciones del usuario
        const userTransactions = data.transactions.filter(t => t.userId === userId);
        
        // Calcular balance
        let balance = 0;
        userTransactions.forEach(transaction => {
            if (transaction.type === 'ingreso') {
                balance += transaction.amount;
            } else if (transaction.type === 'gasto') {
                balance -= transaction.amount;
            }
        });
        
        return balance;
    } catch (error) {
        console.error('❌ Error getting user balance:', error);
        return 0;
    }
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si está autenticado, false si no
 */
export function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('smartbudget-authenticated');
    const userData = localStorage.getItem('smartbudget-user');
    
    if (!isAuthenticated || !userData) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('✅ User authenticated successfully');
    return true;
}
export function getAuthenticatedUser() {
    try {
        const userData = localStorage.getItem('smartbudget-user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('❌ Error parsing user data:', error);
        return null;
    }
}

/**
 * Cierra la sesión del usuario actual
 */
export function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('smartbudget-authenticated');
        localStorage.removeItem('smartbudget-user');
        
        alert('Sesión cerrada exitosamente');
        
        // Redirigir al login
        window.location.href = 'login.html';
    }
}

/**
 * Verifica si una página es pública (no requiere autenticación)
 * @param {string} pageName - Nombre de la página
 * @returns {boolean} - true si es pública, false si requiere autenticación
 */
export function isPublicPage(pageName) {
    const publicPages = ['index.html', 'login.html', 'demo.html', ''];
    return publicPages.includes(pageName) || publicPages.includes(pageName.split('/').pop());
}

/**
 * Redirige a la página apropiada después del login
 * @param {string} redirectTo - Página de destino (opcional)
 */
export function redirectAfterLogin(redirectTo = 'menu.html') {
    // Verificar si hay una página pendiente en sessionStorage
    const pendingRedirect = sessionStorage.getItem('smartbudget-pending-redirect');
    
    if (pendingRedirect) {
        sessionStorage.removeItem('smartbudget-pending-redirect');
        window.location.href = pendingRedirect;
    } else {
        window.location.href = redirectTo;
    }
}

/**
 * Guarda la página actual para redirección después del login
 */
export function savePendingRedirect() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!isPublicPage(currentPage)) {
        sessionStorage.setItem('smartbudget-pending-redirect', currentPage);
    }
}