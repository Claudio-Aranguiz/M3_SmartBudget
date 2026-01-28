/**
 * Menu Page Initializer
 * Handles menu page functionality and Lucide icons
 */

import { checkAuthentication, getAuthenticatedUser, logout } from '../utils/auth-guard.js';

/**
 * Menu Page Manager
 */
class MenuManager {
    
    /**
     * Initialize menu page
     */
    init() {
        console.log('📱 Initializing Menu Manager...');
        
        this.checkAuthentication();
        this.initLucideIcons();
        this.loadUserData();
        this.bindEvents();
        
        console.log('✅ Menu Manager initialized successfully');
    }

    /**
     * Check if user is authenticated
     */
    checkAuthentication() {
        return checkAuthentication();
    }

    /**
     * Load and display user data
     */
    loadUserData() {
        try {
            const userData = getAuthenticatedUser();
            
            if (userData) {
                // Usuario autenticado correctamente - no necesita mensaje adicional
                // El login ya maneja la alerta de bienvenida
                console.log('✅ User data loaded:', userData.email);
            }
        } catch (error) {
            console.error('❌ Error loading user data:', error);
        }
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
        // Modal event listeners
        this.bindModalEvents();
        
        // Agregar botón de cerrar sesión si no existe
        this.addLogoutButton();
    }

    /**
     * Bind modal event listeners
     */
    bindModalEvents() {
        // Listener para cuando se abre el modal
        $('#addTransactionModal').on('show.bs.modal', (event) => {
            const button = $(event.relatedTarget);
            const transactionType = button.data('transaction-type');
            
            this.prepareModal(transactionType);
        });

        // Listener para el botón de guardar
        $('#saveTransactionBtn').on('click', () => {
            this.handleSaveTransaction();
        });

        // Establecer fecha actual por defecto
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
    }

    /**
     * Prepare modal based on transaction type
     */
    prepareModal(type) {
        const modal = document.getElementById('addTransactionModal');
        const modalTitle = document.getElementById('modalTitle');
        const transactionTypeInput = document.getElementById('transactionType');
        const saveBtn = document.getElementById('saveTransactionBtn');
        const saveButtonText = document.getElementById('saveButtonText');
        const modalIcon = modal.querySelector('.modal-title i');

        // Limpiar formulario
        document.getElementById('addTransactionForm').reset();
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];

        if (type === 'ingreso') {
            modalTitle.textContent = 'Agregar Ingreso';
            transactionTypeInput.value = 'ingreso';
            saveBtn.className = 'btn btn-success';
            saveButtonText.textContent = 'Agregar Ingreso';
            modalIcon.setAttribute('data-lucide', 'plus-circle');
        } else if (type === 'gasto') {
            modalTitle.textContent = 'Agregar Gasto';
            transactionTypeInput.value = 'gasto';
            saveBtn.className = 'btn btn-danger';
            saveButtonText.textContent = 'Agregar Gasto';
            modalIcon.setAttribute('data-lucide', 'minus-circle');
        }

        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Handle save transaction
     */
    async handleSaveTransaction() {
        const form = document.getElementById('addTransactionForm');
        const formData = new FormData(form);
        
        // Validar formulario
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        try {
            // Obtener datos del formulario
            const transactionData = {
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                description: formData.get('description'),
                date: formData.get('date')
            };

            // Aquí se haría la petición al servidor para guardar la transacción
            // Por ahora, simularemos el guardado
            await this.saveTransaction(transactionData);

            // Cerrar modal
            $('#addTransactionModal').modal('hide');

            // Mostrar mensaje de éxito
            const typeText = transactionData.type === 'ingreso' ? 'ingreso' : 'gasto';
            alert(`¡${typeText.charAt(0).toUpperCase() + typeText.slice(1)} agregado correctamente!`);

            // Opcional: recargar datos del menú
            this.loadUserData();

        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error al guardar la transacción. Inténtalo de nuevo.');
        }
    }

    /**
     * Save transaction: localStorage (temporal) → JSON (persistente)
     * ARQUITECTURA CORRECTA: 
     * 1. Temporal en localStorage mientras se procesa
     * 2. Guardado real en base de datos JSON  
     * 3. localStorage se limpia después del éxito
     */
    async saveTransaction(transactionData) {
        // Obtener usuario autenticado
        const userData = JSON.parse(localStorage.getItem('smartbudget-user'));
        if (!userData) {
            throw new Error('Usuario no autenticado');
        }

        const tempId = Date.now();

        try {
            // ========== PASO 1: GUARDAR TEMPORALMENTE ==========
            console.log('🔄 PASO 1: Guardando temporalmente en localStorage...');
            const tempTransaction = {
                tempId: tempId,
                userId: userData.id,
                type: transactionData.type,
                amount: parseFloat(transactionData.amount),
                description: transactionData.description,
                date: transactionData.date,
                status: 'pending',
                created: new Date().toISOString()
            };
            
            // Guardar en localStorage temporal
            let tempTransactions = JSON.parse(localStorage.getItem('smartbudget-temp') || '[]');
            tempTransactions.push(tempTransaction);
            localStorage.setItem('smartbudget-temp', JSON.stringify(tempTransactions));
            console.log('✅ Guardado temporal:', tempTransaction);

            // ========== PASO 2: PERSISTIR EN BASE DE DATOS ==========
            console.log('💾 PASO 2: Persistiendo en base de datos JSON...');
            const response = await fetch('../assets/data/transactions.json');
            const data = await response.json();
            
            // Generar ID real secuencial para la base de datos
            const realId = Math.max(...data.transactions.map(t => t.id), 0) + 1;
            
            // Crear transacción final para la base de datos
            const finalTransaction = {
                id: realId,
                userId: userData.id,
                type: transactionData.type,
                amount: parseFloat(transactionData.amount),
                description: transactionData.description,
                date: transactionData.date
            };

            // ========== PASO 3: SIMULAR ESCRITURA A JSON ==========
            data.transactions.push(finalTransaction);
            console.log('✅ PERSISTIDO EN BASE DE DATOS:', finalTransaction);
            console.log('📊 Total en base de datos:', data.transactions.length);
            
            // Simular el contenido completo del archivo JSON actualizado
            this.logUpdatedJSON(data.transactions);

            // ========== PASO 4: LIMPIAR TEMPORAL ==========
            console.log('🧹 PASO 3: Limpiando datos temporales...');
            tempTransactions = tempTransactions.filter(t => t.tempId !== tempId);
            localStorage.setItem('smartbudget-temp', JSON.stringify(tempTransactions));
            console.log('✅ Datos temporales limpiados');

            // ========== PASO 5: CACHE OPTIMIZADO (Solo últimas 20 del usuario) ==========
            const userTransactions = data.transactions.filter(t => t.userId === userData.id).slice(-20);
            localStorage.setItem('smartbudget-cache', JSON.stringify(userTransactions));
            console.log('🔄 Cache actualizado con', userTransactions.length, 'transacciones recientes');
            
            return finalTransaction;
            
        } catch (error) {
            console.error('❌ Error en persistencia:', error);
            
            // ========== MANEJO DE ERRORES: MANTENER TEMPORAL ==========
            let tempTransactions = JSON.parse(localStorage.getItem('smartbudget-temp') || '[]');
            const errorTransaction = tempTransactions.find(t => t.tempId === tempId);
            if (errorTransaction) {
                errorTransaction.status = 'error';
                errorTransaction.error = error.message;
                localStorage.setItem('smartbudget-temp', JSON.stringify(tempTransactions));
                console.log('⚠️ Transacción marcada como error en temporal:', errorTransaction);
            }
            
            // Fallback: guardar solo en localStorage con ID temporal
            const fallbackTransaction = {
                id: tempId,
                userId: userData.id,
                type: transactionData.type,
                amount: parseFloat(transactionData.amount),
                description: transactionData.description,
                date: transactionData.date,
                source: 'local_fallback'
            };
            
            let localTransactions = JSON.parse(localStorage.getItem('smartbudget-transactions-fallback') || '[]');
            localTransactions.push(fallbackTransaction);
            localStorage.setItem('smartbudget-transactions-fallback', JSON.stringify(localTransactions));
            
            console.log('⚠️ Transacción guardada como fallback local:', fallbackTransaction);
            throw error; // Re-lanzar el error para que la UI lo maneje
        }
    }

    /**
     * Obtener transacciones desde la fuente correcta
     * Prioridad: Base de datos JSON > Cache local > Temporal
     */
    async getTransactions(userId = null) {
        const userData = JSON.parse(localStorage.getItem('smartbudget-user'));
        const targetUserId = userId || userData?.id;

        try {
            // FUENTE 1: Base de datos JSON (fuente principal)
            const response = await fetch('../assets/data/transactions.json');
            const data = await response.json();
            const dbTransactions = data.transactions.filter(t => t.userId === targetUserId);
            
            console.log('📊 Cargadas desde base de datos:', dbTransactions.length, 'transacciones');
            
            // Actualizar cache
            localStorage.setItem('smartbudget-cache', JSON.stringify(dbTransactions.slice(-20)));
            
            return dbTransactions;
            
        } catch (error) {
            console.warn('⚠️ No se pudo acceder a la base de datos, usando cache...');
            
            // FUENTE 2: Cache local (backup)
            const cachedTransactions = JSON.parse(localStorage.getItem('smartbudget-cache') || '[]');
            if (cachedTransactions.length > 0) {
                console.log('🔄 Usando cache:', cachedTransactions.length, 'transacciones');
                return cachedTransactions;
            }
            
            // FUENTE 3: Datos temporales (último recurso)
            console.warn('⚠️ Usando datos temporales como último recurso...');
            const tempTransactions = JSON.parse(localStorage.getItem('smartbudget-temp') || '[]');
            return tempTransactions.filter(t => t.userId === targetUserId && t.status !== 'error');
        }
    }

    /**
     * Obtener estado de persistencia
     */
    getPersistenceStatus() {
        const temp = JSON.parse(localStorage.getItem('smartbudget-temp') || '[]');
        const cache = JSON.parse(localStorage.getItem('smartbudget-cache') || '[]');
        const fallback = JSON.parse(localStorage.getItem('smartbudget-transactions-fallback') || '[]');
        
        return {
            temporal: temp.length,
            cache: cache.length, 
            fallback: fallback.length,
            pending: temp.filter(t => t.status === 'pending').length,
            errors: temp.filter(t => t.status === 'error').length
        };
    }

    /**
     * Limpiar datos temporales exitosos
     */
    cleanupTempData() {
        const temp = JSON.parse(localStorage.getItem('smartbudget-temp') || '[]');
        const remaining = temp.filter(t => t.status === 'error'); // Solo mantener errores
        localStorage.setItem('smartbudget-temp', JSON.stringify(remaining));
        console.log('🧹 Limpieza temporal completada. Errores pendientes:', remaining.length);
    }

    /**
     * Log how the updated JSON file would look
     */
    logUpdatedJSON(updatedTransactions) {
        const jsonStructure = {
            transactions: updatedTransactions
        };
        
        console.log('📄 Archivo transactions.json actualizado quedaría así:');
        console.log(JSON.stringify(jsonStructure, null, 2));
    }

    /**
     * Get all transactions (including local ones)
     */
    async getAllTransactions() {
        try {
            // Cargar del archivo JSON
            const response = await fetch('../assets/data/transactions.json');
            const data = await response.json();
            
            // Combinar con transacciones locales
            const localTransactions = JSON.parse(localStorage.getItem('smartbudget-transactions') || '[]');
            
            const allTransactions = [...data.transactions, ...localTransactions];
            
            console.log('📋 Total de transacciones (JSON + Locales):', allTransactions.length);
            return allTransactions;
            
        } catch (error) {
            console.error('❌ Error cargando transacciones:', error);
            return JSON.parse(localStorage.getItem('smartbudget-transactions') || '[]');
        }
    }

    /**
     * Add logout functionality
     */
    addLogoutButton() {
        // Buscar si ya existe el botón de logout
        let logoutButton = document.getElementById('logout-button');
        
        if (!logoutButton) {
            // Crear botón de logout con el mismo estilo que dashboard
            logoutButton = document.createElement('button');
            logoutButton.id = 'logout-button';
            logoutButton.className = 'header__button header__button--logout';
            logoutButton.title = 'Cerrar Sesión';
            logoutButton.setAttribute('aria-label', 'Cerrar sesión');
            logoutButton.innerHTML = '<i data-lucide="log-out" class="header__button-icon"></i>';
            
            // Agregar al nav list (mismo estilo que dashboard)
            const navList = document.querySelector('.nav__list');
            if (navList) {
                const logoutItem = document.createElement('li');
                logoutItem.className = 'nav__item';
                logoutItem.appendChild(logoutButton);
                navList.appendChild(logoutItem);
                
                // Reinicializar iconos después de agregar el botón
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            // Bind logout event
            logoutButton.addEventListener('click', () => this.handleLogout());
        }
    }

    /**
     * Handle logout process
     */
    handleLogout() {
        logout();
    }

    /**
     * TEST FUNCTION: Crear transacción de prueba
     * Para usar desde la consola del navegador: window.menuManager.testTransaction()
     */
    testTransaction() {
        console.log('🧪 Iniciando test de transacción...');
        
        // Datos de prueba
        const testData = {
            type: 'gasto',
            amount: 45.75,
            description: 'Supermercado - Test de funcionalidad',
            date: new Date().toISOString().split('T')[0]
        };
        
        return this.saveTransaction(testData)
            .then(result => {
                console.log('✅ Test completado exitosamente');
                console.log('Resultado:', result);
                return result;
            })
            .catch(error => {
                console.error('❌ Test falló:', error);
                throw error;
            });
    }

    /**
     * Crear transacción de ingreso de prueba
     */
    testIncomeTransaction() {
        console.log('🧪 Iniciando test de ingreso...');
        
        const testData = {
            type: 'ingreso',
            amount: 1500.00,
            description: 'Salario - Test de ingreso',
            date: new Date().toISOString().split('T')[0]
        };
        
        return this.saveTransaction(testData)
            .then(result => {
                console.log('✅ Test de ingreso completado');
                console.log('Resultado:', result);
                return result;
            })
            .catch(error => {
                console.error('❌ Test de ingreso falló:', error);
                throw error;
            });
    }

    /**
     * Mostrar todas las transacciones guardadas
     */
    async showAllTransactions() {
        console.log('📋 Mostrando todas las transacciones...');
        
        try {
            const allTransactions = await this.getAllTransactions();
            const userData = JSON.parse(localStorage.getItem('smartbudget-user'));
            
            if (userData) {
                const userTransactions = allTransactions.filter(t => t.userId === userData.id);
                console.log(`👤 Transacciones del usuario ${userData.name} (ID: ${userData.id}):`);
                console.table(userTransactions);
                
                const balance = userTransactions.reduce((sum, t) => {
                    return t.type === 'ingreso' ? sum + t.amount : sum - t.amount;
                }, 0);
                console.log(`💰 Balance calculado: $${balance.toFixed(2)}`);
            }
            
            console.log('🗃️ Todas las transacciones:');
            console.table(allTransactions);
            
            return allTransactions;
        } catch (error) {
            console.error('❌ Error al mostrar transacciones:', error);
            return [];
        }
    }
}

/**
 * Initialize menu page when DOM is ready
 */
class MenuInit {
    static init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    static setup() {
        console.log('🚀 Initializing Menu Page...');
        
        // Initialize menu manager
        const menuManager = new MenuManager();
        menuManager.init();
        
        // Exponer para testing en consola
        window.menuManager = menuManager;
        console.log('🔧 Funciones de test disponibles:');
        console.log('   - window.menuManager.testTransaction() (crear gasto de prueba)');
        console.log('   - window.menuManager.testIncomeTransaction() (crear ingreso de prueba)');
        console.log('   - window.menuManager.showAllTransactions() (ver todas las transacciones)');
    }
}

// Export for modular usage
export { MenuInit, MenuManager };

// Auto-initialize when script loads
MenuInit.init();