/**
 * Admin Page Initializer
 * Handles admin panel functionality, user management and income addition
 */

import { checkAuthentication, getAuthenticatedUser, isAdmin, getAllUsers, addIncomeToUser, logout } from '../utils/auth-guard.js';

/**
 * Admin Panel Manager
 */
class AdminManager {
    constructor() {
        this.users = [];
        this.selectedUser = null;
    }

    /**
     * Initialize admin panel
     */
    async init() {
        console.log('👨‍💼 Initializing Admin Manager...');
        
        // Check authentication and admin privileges
        if (!this.checkAdminAccess()) {
            return;
        }
        
        this.initLucideIcons();
        this.bindEvents();
        this.displayAdminInfo();
        await this.loadUsers();
        
        console.log('✅ Admin Manager initialized successfully');
    }

    /**
     * Check if user has admin access
     */
    checkAdminAccess() {
        if (!checkAuthentication()) {
            return false;
        }
        
        if (!isAdmin()) {
            alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
            window.location.href = 'menu.html';
            return false;
        }
        
        return true;
    }

    /**
     * Initialize Lucide icons
     */
    initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('✅ Lucide icons initialized');
        } else {
            console.warn('⚠️ Lucide not found');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', logout);
        
        // Add income form
        document.getElementById('addIncomeForm')?.addEventListener('submit', (e) => {
            this.handleAddIncome(e);
        });
        
        // Update date
        this.updateDate();
    }

    /**
     * Display admin information
     */
    displayAdminInfo() {
        const adminData = getAuthenticatedUser();
        if (adminData) {
            document.getElementById('admin-welcome').textContent = 
                `Bienvenido, ${adminData.name} | ${new Date().toLocaleDateString('es-ES')}`;
        }
    }

    /**
     * Update current date display
     */
    updateDate() {
        const today = new Date();
        document.getElementById('todays-date').textContent = today.getDate();
    }

    /**
     * Load and display all users
     */
    async loadUsers() {
        try {
            const usersContainer = document.getElementById('users-container');
            const loadingDiv = document.getElementById('users-loading');
            const noUsersDiv = document.getElementById('no-users');
            
            // Show loading
            loadingDiv.style.display = 'block';
            usersContainer.style.display = 'none';
            noUsersDiv.style.display = 'none';
            
            // Get users from database
            this.users = await getAllUsers();
            
            if (this.users && this.users.length > 0) {
                this.renderUsers();
                this.updateStats();
                
                // Show users container
                loadingDiv.style.display = 'none';
                usersContainer.style.display = 'flex';
            } else {
                // Show no users message
                loadingDiv.style.display = 'none';
                noUsersDiv.style.display = 'block';
            }
            
        } catch (error) {
            console.error('❌ Error loading users:', error);
            document.getElementById('users-loading').innerHTML = 
                '<p class="text-danger">Error cargando usuarios. Por favor intenta de nuevo.</p>';
        }
    }

    /**
     * Render users in the interface
     */
    renderUsers() {
        const container = document.getElementById('users-container');
        container.innerHTML = '';
        
        this.users.forEach(user => {
            const userCard = this.createUserCard(user);
            container.appendChild(userCard);
        });
    }

    /**
     * Create user card element
     */
    createUserCard(user) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const lastLogin = user.lastLogin ? 
            new Date(user.lastLogin).toLocaleDateString('es-ES') : 
            'Nunca';
            
        const balance = user.accountBalance || 0;
        const balanceClass = balance >= 1000 ? 'text-success' : balance >= 500 ? 'text-warning' : 'text-danger';
        
        col.innerHTML = `
            <div class="card user-card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                    <i data-lucide="user"></i>
                                </div>
                            </div>
                            <div>
                                <h6 class="mb-1">${user.name}</h6>
                                <small class="text-muted">${user.email}</small>
                            </div>
                        </div>
                        <span class="badge ${user.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Balance:</span>
                            <span class="balance-display ${balanceClass}">$${balance.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <small class="text-muted">
                            <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                            Último acceso: ${lastLogin}
                        </small>
                    </div>
                    
                    <div class="mb-3">
                        <small class="text-muted">
                            <i data-lucide="credit-card" style="width: 14px; height: 14px;"></i>
                            Transacciones: ${user.transactions ? user.transactions.length : 0}
                        </small>
                    </div>
                    
                    <button class="btn btn-add-income btn-sm w-100" 
                            onclick="adminManager.openAddIncomeModal(${user.id}, '${user.name}')">
                        <i data-lucide="plus-circle" style="width: 16px; height: 16px;" class="me-1"></i>
                        Agregar Ingreso
                    </button>
                </div>
            </div>
        `;
        
        return col;
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.isActive).length;
        const totalBalance = this.users.reduce((sum, u) => sum + (u.accountBalance || 0), 0);
        
        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('active-users').textContent = activeUsers;
        document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    }

    /**
     * Open add income modal for specific user
     */
    openAddIncomeModal(userId, userName) {
        this.selectedUser = this.users.find(u => u.id === userId);
        
        if (this.selectedUser) {
            document.getElementById('selectedUserId').value = userId;
            document.getElementById('selectedUserName').value = userName;
            document.getElementById('incomeAmount').value = '';
            document.getElementById('incomeDescription').value = '';
            
            // Show modal
            $('#addIncomeModal').modal('show');
        }
    }

    /**
     * Handle add income form submission
     */
    async handleAddIncome(e) {
        e.preventDefault();
        
        const userId = parseInt(document.getElementById('selectedUserId').value);
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        const description = document.getElementById('incomeDescription').value || 'Ingreso agregado por Admin';
        
        if (!userId || !amount || amount <= 0) {
            alert('Por favor completa todos los campos correctamente.');
            return;
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i data-lucide="loader" class="me-2"></i> Agregando...';
        submitBtn.disabled = true;
        
        try {
            const success = await addIncomeToUser(userId, amount, description);
            
            if (success) {
                alert(`¡Éxito! Se agregaron $${amount} al usuario ${this.selectedUser.name}`);
                
                // Close modal
                $('#addIncomeModal').modal('hide');
                
                // Reload users to show updated data
                await this.loadUsers();
                
            } else {
                alert('Error al agregar el ingreso. Por favor intenta de nuevo.');
            }
            
        } catch (error) {
            console.error('❌ Error adding income:', error);
            alert('Error al agregar el ingreso. Por favor intenta de nuevo.');
        } finally {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Initialize admin page when DOM is ready
 */
class AdminInit {
    static init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    static async setup() {
        console.log('🚀 Initializing Admin Page...');
        
        // Create global instance
        window.adminManager = new AdminManager();
        await window.adminManager.init();
    }
}

// Export for modular usage
export { AdminInit, AdminManager };

// Auto-initialize when script loads
AdminInit.init();