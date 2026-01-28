/**
 * Authentication Module
 * Handles login, registration, and authentication-related functionality
 */

import { Utils } from '../utils/helpers.js';
import { UIManager } from '../utils/ui.js';
import { StorageManager } from '../data/storage.js';

export class AuthModule {
    constructor() {
        this.isInitialized = false;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 3;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutes
    }

    /**
     * Initialize authentication module
     */
    async init() {
        try {
            console.log('🔐 Initializing Auth Module...');
            
            this.bindEvents();
            this.checkAuthState();
            this.setupPasswordVisibilityToggle();
            this.loadRememberedCredentials();
            
            this.isInitialized = true;
            console.log('✅ Auth Module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Auth Module:', error);
        }
    }

    /**
     * Bind authentication-related events
     */
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Toggle between login and register
        const toggleButtons = document.querySelectorAll('[data-auth-toggle]');
        toggleButtons.forEach(button => {
            button.addEventListener('click', this.handleAuthToggle.bind(this));
        });

        // Forgot password
        const forgotPasswordLink = document.querySelector('.auth__forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', this.handleForgotPassword.bind(this));
        }

        // Real-time form validation
        this.bindFormValidation();

        // Social login buttons
        this.bindSocialLogin();
    }

    /**
     * Bind form validation events
     */
    bindFormValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', this.validateEmail.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });

        // Password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('blur', this.validatePassword.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });

        // Confirm password validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', this.validatePasswordConfirm.bind(this));
            confirmPasswordInput.addEventListener('input', this.clearFieldError.bind(this));
        }

        // Terms checkbox
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', this.validateTerms.bind(this));
        }
    }

    /**
     * Bind social login events
     */
    bindSocialLogin() {
        const socialButtons = document.querySelectorAll('[data-social-login]');
        socialButtons.forEach(button => {
            button.addEventListener('click', this.handleSocialLogin.bind(this));
        });
    }

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };

        // Check if account is locked
        if (this.isAccountLocked()) {
            this.showLockoutMessage();
            return;
        }

        // Validate form
        if (!this.validateLoginForm(credentials)) {
            return;
        }

        try {
            // Show loading state
            this.setSubmitButtonState('loginSubmit', true, 'Iniciando sesión...');

            // Simulate API call delay
            await Utils.delay(1500);

            // Attempt authentication
            const authResult = await this.authenticateUser(credentials);

            if (authResult.success) {
                // Reset login attempts
                this.loginAttempts = 0;
                localStorage.removeItem('loginAttempts');
                localStorage.removeItem('lockoutTime');

                // Handle remember me
                if (credentials.remember) {
                    this.saveCredentials(credentials);
                } else {
                    this.clearSavedCredentials();
                }

                // Save session (usando claves consistentes con auth-guard.js)
                StorageManager.setItem('smartbudget-authenticated', 'true');
                StorageManager.setItem('smartbudget-user', JSON.stringify(authResult.user));
                StorageManager.setItem('smartbudget-loginTime', Date.now());

                // Show success message
                Utils.showNotification('¡Bienvenido a SmartBudget!', 'success');

                // Redirect to dashboard
                await Utils.delay(800);
                window.location.href = 'dashboard.html';

            } else {
                this.handleLoginFailure(authResult.error);
            }

        } catch (error) {
            console.error('Login error:', error);
            Utils.showNotification('Error de conexión. Inténtelo de nuevo.', 'error');
        } finally {
            this.setSubmitButtonState('loginSubmit', false, 'Iniciar Sesión');
        }
    }

    /**
     * Handle registration form submission
     */
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            terms: formData.get('terms') === 'on'
        };

        // Validate form
        if (!this.validateRegisterForm(userData)) {
            return;
        }

        try {
            // Show loading state
            this.setSubmitButtonState('registerSubmit', true, 'Creando cuenta...');

            // Simulate API call delay
            await Utils.delay(2000);

            // Attempt registration
            const registerResult = await this.registerUser(userData);

            if (registerResult.success) {
                Utils.showNotification('¡Cuenta creada exitosamente!', 'success');
                
                // Auto-login after registration
                await Utils.delay(1000);
                const loginResult = await this.authenticateUser({
                    email: userData.email,
                    password: userData.password
                });

                if (loginResult.success) {
                    // Save session (usando claves consistentes con auth-guard.js)
                    StorageManager.setItem('smartbudget-authenticated', 'true');
                    StorageManager.setItem('smartbudget-user', JSON.stringify(loginResult.user));
                    StorageManager.setItem('smartbudget-loginTime', Date.now());
                    
                    window.location.href = 'dashboard.html';
                } else {
                    // Redirect to login form
                    this.showLoginForm();
                }

            } else {
                Utils.showNotification(registerResult.error || 'Error al crear la cuenta', 'error');
            }

        } catch (error) {
            console.error('Registration error:', error);
            Utils.showNotification('Error de conexión. Inténtelo de nuevo.', 'error');
        } finally {
            this.setSubmitButtonState('registerSubmit', false, 'Crear Cuenta');
        }
    }

    /**
     * Authenticate user - ARQUITECTURA CORREGIDA
     * localStorage (temporal session) → JSON Database (persistente)
     */
    async authenticateUser(credentials) {
        try {
            // PASO 1: Consultar base de datos JSON (fuente principal)
            console.log('🔍 PASO 1: Consultando base de datos de usuarios...');
            const response = await fetch('../assets/data/users.json');
            const data = await response.json();
            
            // PASO 2: Buscar usuario en base de datos real
            const user = data.users.find(u => 
                u.email.toLowerCase() === credentials.email.toLowerCase() &&
                u.password === credentials.password &&
                u.isActive === true
            );

            if (user) {
                // PASO 3: Actualizar lastLogin en base de datos (simular)
                const updatedUser = {
                    ...user,
                    lastLogin: new Date().toISOString()
                };
                
                console.log('✅ Usuario autenticado desde base de datos:', updatedUser.name);
                console.log('📊 Datos del usuario:', {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    role: updatedUser.role,
                    lastLogin: updatedUser.lastLogin
                });
                
                // Simular actualización de lastLogin en JSON
                this.simulateUserUpdate(updatedUser);
                
                // Remover password del objeto de sesión
                const { password, ...userSession } = updatedUser;
                
                return {
                    success: true,
                    user: userSession,
                    source: 'database'
                };
            } else {
                console.log('❌ Credenciales no encontradas en base de datos');
                return {
                    success: false,
                    error: 'Email o contraseña incorrectos'
                };
            }
            
        } catch (error) {
            console.error('❌ Error accediendo a base de datos de usuarios:', error);
            
            // FALLBACK: Usuarios de emergencia (solo en caso de error de red)
            console.warn('⚠️ Usando usuarios de fallback...');
            const fallbackUsers = [
                {
                    id: 2,
                    name: 'María González',
                    email: 'maria.gonzalez@email.com',
                    password: 'maria123',
                    role: 'user'
                },
                {
                    id: 1,
                    name: 'Administrador',
                    email: 'admin@smartbudget.com',
                    password: 'admin123',
                    role: 'admin'
                }
            ];

            const fallbackUser = fallbackUsers.find(u => 
                u.email.toLowerCase() === credentials.email.toLowerCase() &&
                u.password === credentials.password
            );

            if (fallbackUser) {
                const { password, ...userSession } = fallbackUser;
                return {
                    success: true,
                    user: { ...userSession, source: 'fallback' },
                    source: 'fallback'
                };
            }

            return {
                success: false,
                error: 'Error de conexión y credenciales incorrectas'
            };
        }
    }

    /**
     * Register user - ARQUITECTURA CORREGIDA
     * localStorage (temporal) → JSON Database (persistente)
     */
    async registerUser(userData) {
        const tempId = Date.now();
        
        try {
            // PASO 1: Guardar temporalmente mientras se procesa
            console.log('🔄 PASO 1: Procesando registro temporalmente...');
            const tempUser = {
                tempId: tempId,
                name: userData.name,
                email: userData.email.toLowerCase(),
                status: 'pending_registration',
                created: new Date().toISOString()
            };
            
            this.saveTempUser(tempUser);
            
            // PASO 2: Consultar base de datos para verificar email único
            console.log('🔍 PASO 2: Verificando email en base de datos...');
            const response = await fetch('../assets/data/users.json');
            const data = await response.json();
            
            // Verificar si el email ya existe
            const existingUser = data.users.find(u => 
                u.email.toLowerCase() === userData.email.toLowerCase()
            );
            
            if (existingUser) {
                this.clearTempUser(tempId);
                return {
                    success: false,
                    error: 'Este email ya está registrado'
                };
            }
            
            // PASO 3: Crear usuario para la base de datos
            console.log('💾 PASO 3: Registrando en base de datos...');
            const newUserId = Math.max(...data.users.map(u => u.id), 0) + 1;
            
            const newUser = {
                id: newUserId,
                email: userData.email.toLowerCase(),
                password: userData.password, // En producción: hash + salt
                name: userData.name,
                role: "user",
                profileImage: "assets/img/default-avatar.jpg",
                monthlyBudget: 2500.00,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true
            };
            
            // PASO 4: Simular persistencia en JSON
            data.users.push(newUser);
            data.metadata.totalUsers = data.users.length;
            data.metadata.activeUsers = data.users.filter(u => u.isActive).length;
            data.metadata.lastUpdated = new Date().toISOString();
            
            console.log('✅ Usuario registrado en base de datos:', newUser.name);
            console.log('📊 Total usuarios en base:', data.metadata.totalUsers);
            
            // Simular contenido actualizado del JSON
            this.simulateUserDBUpdate(data.users);
            
            // PASO 5: Limpiar datos temporales
            this.clearTempUser(tempId);
            
            // Remover password del objeto de retorno
            const { password, ...userResponse } = newUser;
            
            return {
                success: true,
                user: userResponse,
                source: 'database'
            };
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            
            // Marcar como error en temporal
            this.markTempUserError(tempId, error.message);
            
            return {
                success: false,
                error: 'Error de conexión durante el registro'
            };
        }
    }

    /**
     * Handle authentication toggle (login/register)
     */
    handleAuthToggle(event) {
        event.preventDefault();
        
        const toggle = event.target.dataset.authToggle;
        
        if (toggle === 'register') {
            this.showRegisterForm();
        } else if (toggle === 'login') {
            this.showLoginForm();
        }
    }

    /**
     * Show login form
     */
    showLoginForm() {
        const loginForm = document.querySelector('.auth__form--login');
        const registerForm = document.querySelector('.auth__form--register');
        
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        
        this.updateAuthHeader('Iniciar Sesión');
    }

    /**
     * Show register form
     */
    showRegisterForm() {
        const loginForm = document.querySelector('.auth__form--login');
        const registerForm = document.querySelector('.auth__form--register');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        
        this.updateAuthHeader('Crear Cuenta');
    }

    /**
     * Update auth header title
     */
    updateAuthHeader(title) {
        const headerTitle = document.querySelector('.auth__title');
        if (headerTitle) {
            headerTitle.textContent = title;
        }
    }

    /**
     * Handle forgot password
     */
    handleForgotPassword(event) {
        event.preventDefault();
        
        Utils.showNotification('Funcionalidad de recuperación de contraseña próximamente', 'info');
    }

    /**
     * Handle social login
     */
    handleSocialLogin(event) {
        const provider = event.target.dataset.socialLogin;
        Utils.showNotification(`Inicio de sesión con ${provider} próximamente`, 'info');
    }

    /**
     * Form validation methods
     */
    validateLoginForm(credentials) {
        let isValid = true;

        if (!this.validateEmail({ target: { value: credentials.email, name: 'email' } })) {
            isValid = false;
        }

        if (!credentials.password) {
            this.showFieldError('password', 'La contraseña es requerida');
            isValid = false;
        }

        return isValid;
    }

    validateRegisterForm(userData) {
        let isValid = true;

        if (!userData.name || userData.name.trim().length < 2) {
            this.showFieldError('name', 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        }

        if (!this.validateEmail({ target: { value: userData.email, name: 'email' } })) {
            isValid = false;
        }

        if (!this.validatePassword({ target: { value: userData.password, name: 'password' } })) {
            isValid = false;
        }

        if (!this.validatePasswordConfirm({ target: { value: userData.confirmPassword, name: 'confirmPassword' } })) {
            isValid = false;
        }

        if (!userData.terms) {
            this.showFieldError('terms', 'Debes aceptar los términos y condiciones');
            isValid = false;
        }

        return isValid;
    }

    validateEmail(event) {
        const email = event.target.value;
        const fieldName = event.target.name;
        
        if (!email) {
            this.showFieldError(fieldName, 'El email es requerido');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showFieldError(fieldName, 'Ingresa un email válido');
            return false;
        }

        this.clearFieldError(event);
        return true;
    }

    validatePassword(event) {
        const password = event.target.value;
        const fieldName = event.target.name;
        
        if (!password) {
            this.showFieldError(fieldName, 'La contraseña es requerida');
            return false;
        }

        if (password.length < 6) {
            this.showFieldError(fieldName, 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        this.clearFieldError(event);
        return true;
    }

    validatePasswordConfirm(event) {
        const confirmPassword = event.target.value;
        const password = document.getElementById('password')?.value;
        
        if (!confirmPassword) {
            this.showFieldError('confirmPassword', 'Confirma tu contraseña');
            return false;
        }

        if (password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Las contraseñas no coinciden');
            return false;
        }

        this.clearFieldError(event);
        return true;
    }

    validateTerms(event) {
        if (!event.target.checked) {
            this.showFieldError('terms', 'Debes aceptar los términos y condiciones');
            return false;
        }

        this.clearFieldError(event);
        return true;
    }

    /**
     * Show field validation error
     */
    showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        const fieldGroup = field.closest('.auth__field');
        if (!fieldGroup) return;

        // Remove existing error
        const existingError = fieldGroup.querySelector('.auth__field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error class
        field.classList.add('auth__input--error');

        // Add error message
        const errorElement = document.createElement('span');
        errorElement.className = 'auth__field-error';
        errorElement.textContent = message;
        fieldGroup.appendChild(errorElement);
    }

    /**
     * Clear field validation error
     */
    clearFieldError(event) {
        const field = event.target;
        const fieldGroup = field.closest('.auth__field');
        if (!fieldGroup) return;

        field.classList.remove('auth__input--error');
        
        const errorElement = fieldGroup.querySelector('.auth__field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Handle login failure
     */
    handleLoginFailure(error) {
        this.loginAttempts++;
        
        if (this.loginAttempts >= this.maxLoginAttempts) {
            this.lockAccount();
            this.showLockoutMessage();
        } else {
            const remainingAttempts = this.maxLoginAttempts - this.loginAttempts;
            Utils.showNotification(
                `${error}. Te quedan ${remainingAttempts} intentos.`, 
                'error'
            );
        }

        // Store login attempts
        localStorage.setItem('loginAttempts', this.loginAttempts.toString());
    }

    /**
     * Lock account after max attempts
     */
    lockAccount() {
        const lockoutTime = Date.now() + this.lockoutTime;
        localStorage.setItem('lockoutTime', lockoutTime.toString());
    }

    /**
     * Check if account is locked
     */
    isAccountLocked() {
        const lockoutTime = localStorage.getItem('lockoutTime');
        if (!lockoutTime) return false;

        const currentTime = Date.now();
        if (currentTime < parseInt(lockoutTime)) {
            return true;
        } else {
            // Lock period expired, clear lockout
            localStorage.removeItem('lockoutTime');
            localStorage.removeItem('loginAttempts');
            this.loginAttempts = 0;
            return false;
        }
    }

    /**
     * Show lockout message
     */
    showLockoutMessage() {
        const lockoutTime = localStorage.getItem('lockoutTime');
        const remainingTime = Math.ceil((parseInt(lockoutTime) - Date.now()) / 60000);
        
        Utils.showNotification(
            `Cuenta bloqueada. Inténtalo de nuevo en ${remainingTime} minutos.`,
            'warning'
        );
    }

    /**
     * Setup password visibility toggle
     */
    setupPasswordVisibilityToggle() {
        const toggleButtons = document.querySelectorAll('.auth__password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const input = event.target.closest('.auth__field').querySelector('input[type="password"], input[type="text"]');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    button.innerHTML = '<i class="lucide-icon" data-lucide="eye-off"></i>';
                } else {
                    input.type = 'password';
                    button.innerHTML = '<i class="lucide-icon" data-lucide="eye"></i>';
                }

                // Re-initialize lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        });
    }

    /**
     * Save credentials for remember me
     */
    saveCredentials(credentials) {
        if (credentials.remember) {
            StorageManager.setItem('rememberedEmail', credentials.email);
        }
    }

    /**
     * Clear saved credentials
     */
    clearSavedCredentials() {
        StorageManager.removeItem('rememberedEmail');
    }

    /**
     * Load remembered credentials
     */
    loadRememberedCredentials() {
        const rememberedEmail = StorageManager.getItem('rememberedEmail');
        
        if (rememberedEmail) {
            const emailInput = document.querySelector('input[name="email"]');
            const rememberCheckbox = document.querySelector('input[name="remember"]');
            
            if (emailInput) {
                emailInput.value = rememberedEmail;
            }
            
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    }

    /**
     * Check current authentication state
     */
    checkAuthState() {
        const isAuthenticated = StorageManager.getItem('isAuthenticated');
        
        // If already authenticated and on login page, redirect to dashboard
        if (isAuthenticated && window.location.pathname.includes('login.html')) {
            window.location.href = 'dashboard.html';
            return;
        }

        // If not authenticated and on protected page, redirect to login
        const protectedPages = ['dashboard.html', 'historial.html', 'menu.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (!isAuthenticated && protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }

    /**
     * Set submit button state
     */
    setSubmitButtonState(buttonId, loading, text) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.disabled = loading;
        button.textContent = text;
        
        if (loading) {
            button.classList.add('auth__submit--loading');
        } else {
            button.classList.remove('auth__submit--loading');
        }
    }

    /**
     * Logout user
     */
    logout() {
        // Limpiar datos de sesión (usando claves consistentes con auth-guard.js)
        StorageManager.removeItem('smartbudget-authenticated');
        StorageManager.removeItem('smartbudget-user');
        StorageManager.removeItem('smartbudget-loginTime');
        
        // Limpiar también datos temporales por seguridad
        StorageManager.removeItem('smartbudget-temp');
        StorageManager.removeItem('smartbudget-cache');
        
        Utils.showNotification('Sesión cerrada correctamente', 'success');
        window.location.href = 'login.html';
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return StorageManager.getItem('user');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!StorageManager.getItem('isAuthenticated');
    }

    /**
     * Destroy module and clean up
     */
    destroy() {
        this.loginAttempts = 0;
        this.editingTransaction = null;
        this.isInitialized = false;
    }
    
    // ========== MÉTODOS AUXILIARES PARA ARQUITECTURA CORRECTA ==========
    
    /**
     * Guardar usuario temporal durante el procesamiento
     */
    saveTempUser(tempUser) {
        const tempUsers = JSON.parse(localStorage.getItem('smartbudget-temp-users') || '[]');
        tempUsers.push(tempUser);
        localStorage.setItem('smartbudget-temp-users', JSON.stringify(tempUsers));
        console.log('💾 Usuario guardado temporalmente:', tempUser);
    }
    
    /**
     * Limpiar usuario temporal después del éxito
     */
    clearTempUser(tempId) {
        const tempUsers = JSON.parse(localStorage.getItem('smartbudget-temp-users') || '[]');
        const filtered = tempUsers.filter(u => u.tempId !== tempId);
        localStorage.setItem('smartbudget-temp-users', JSON.stringify(filtered));
        console.log('🧹 Usuario temporal limpiado:', tempId);
    }
    
    /**
     * Marcar usuario temporal como error
     */
    markTempUserError(tempId, errorMsg) {
        const tempUsers = JSON.parse(localStorage.getItem('smartbudget-temp-users') || '[]');
        const user = tempUsers.find(u => u.tempId === tempId);
        if (user) {
            user.status = 'error';
            user.error = errorMsg;
            localStorage.setItem('smartbudget-temp-users', JSON.stringify(tempUsers));
            console.log('❌ Usuario temporal marcado con error:', user);
        }
    }
    
    /**
     * Simular actualización de usuario en JSON
     */
    simulateUserUpdate(user) {
        console.log('📝 SIMULACIÓN: Actualizando usuario en users.json');
        console.log('Contenido que se escribiría:');
        console.log(JSON.stringify({
            id: user.id,
            lastLogin: user.lastLogin,
            name: user.name,
            email: user.email
        }, null, 2));
    }
    
    /**
     * Simular actualización completa de base de datos de usuarios
     */
    simulateUserDBUpdate(users) {
        console.log('💾 SIMULACIÓN: Base de datos de usuarios actualizada');
        console.log(`📊 Total usuarios: ${users.length}`);
        console.log('Últimos 3 usuarios:');
        users.slice(-3).forEach(u => {
            console.log(`  - ${u.name} (${u.email}) - ID: ${u.id}`);
        });
    }
    
    /**
     * Obtener estado de usuarios temporales
     */
    getTempUsersStatus() {
        const tempUsers = JSON.parse(localStorage.getItem('smartbudget-temp-users') || '[]');
        return {
            total: tempUsers.length,
            pending: tempUsers.filter(u => u.status === 'pending_registration').length,
            errors: tempUsers.filter(u => u.status === 'error').length
        };
    }
}