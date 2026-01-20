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

                // Save session
                StorageManager.setItem('isAuthenticated', true);
                StorageManager.setItem('user', authResult.user);
                StorageManager.setItem('loginTime', Date.now());

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
                    StorageManager.setItem('isAuthenticated', true);
                    StorageManager.setItem('user', loginResult.user);
                    StorageManager.setItem('loginTime', Date.now());
                    
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
     * Authenticate user (mock implementation)
     */
    async authenticateUser(credentials) {
        // Mock authentication - In real app, this would be an API call
        const mockUsers = [
            {
                id: 1,
                name: 'Usuario Demo',
                email: 'demo@smartbudget.com',
                password: 'demo123'
            },
            {
                id: 2,
                name: 'Test User',
                email: 'test@test.com',
                password: 'test123'
            }
        ];

        const user = mockUsers.find(u => 
            u.email.toLowerCase() === credentials.email.toLowerCase() &&
            u.password === credentials.password
        );

        if (user) {
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                user: userWithoutPassword
            };
        } else {
            return {
                success: false,
                error: 'Email o contraseña incorrectos'
            };
        }
    }

    /**
     * Register user (mock implementation)
     */
    async registerUser(userData) {
        // Mock registration - In real app, this would be an API call
        
        // Check if email already exists
        const existingEmails = ['demo@smartbudget.com', 'test@test.com'];
        if (existingEmails.includes(userData.email.toLowerCase())) {
            return {
                success: false,
                error: 'Este email ya está registrado'
            };
        }

        // Simulate successful registration
        return {
            success: true,
            user: {
                id: Date.now(),
                name: userData.name,
                email: userData.email
            }
        };
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
        StorageManager.removeItem('isAuthenticated');
        StorageManager.removeItem('user');
        StorageManager.removeItem('loginTime');
        
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
}