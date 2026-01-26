/**
 * Login Page Initializer
 * Handles login and registration form functionality with JSON database
 */

import { authenticateUser } from '../utils/auth-guard.js';

/**
 * Login and Registration Forms Manager
 */
class AuthManager {
    
    /**
     * Initialize authentication manager
     */
    init() {
        console.log('🔐 Initializing Auth Manager...');
        
        this.initLucideIcons();
        this.bindFormEvents();
        
        console.log('✅ Auth Manager initialized successfully');
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
     * Bind form event listeners
     */
    bindFormEvents() {
        this.bindLoginForm();
        this.bindRegisterForm();
    }

    /**
     * Handle login form submission
     */
    bindLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (email && password) {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Verificando...';
                submitBtn.disabled = true;
                
                try {
                    // Authenticate with database
                    const userData = await authenticateUser(email, password);
                    
                    if (userData) {
                        this.handleSuccessfulLogin(userData);
                    } else {
                        alert('Credenciales incorrectas. Por favor verifica tu email y contraseña.');
                    }
                } catch (error) {
                    console.error('❌ Login error:', error);
                    alert('Error al iniciar sesión. Por favor intenta de nuevo.');
                } finally {
                    // Restore button
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                alert('Por favor, completa todos los campos');
            }
        });
    }

    /**
     * Handle successful login process
     */
    handleSuccessfulLogin(userData) {
        const welcomeMessage = `¡Hola ${userData.name}! Inicio de sesión exitoso.`;
            
        alert(welcomeMessage);
        
        // Hide modal if using Bootstrap
        if (typeof $ !== 'undefined' && $('#loginModal').length) {
            $('#loginModal').modal('hide');
        }
        
        // Redirigir siempre a menu.html
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 500);
    }

    /**
     * Handle registration form submission
     */
    bindRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Basic validation
            if (name && email && password && confirmPassword) {
                if (password === confirmPassword) {
                    // Guardar datos de registro en localStorage
                    const userData = {
                        name: name,
                        email: email,
                        registrationDate: new Date().toISOString(),
                        loginTime: new Date().toISOString(),
                        isAuthenticated: true
                    };
                    
                    localStorage.setItem('smartbudget-user', JSON.stringify(userData));
                    localStorage.setItem('smartbudget-authenticated', 'true');
                    
                    alert('Registro exitoso! Bienvenido a SmartBudget! Redirigiendo al menú principal...');
                    
                    // Hide modal if using Bootstrap
                    if (typeof $ !== 'undefined' && $('#registerModal').length) {
                        $('#registerModal').modal('hide');
                    }
                    
                    // Esperar un momento para que se cierre el modal y luego redirigir
                    setTimeout(() => {
                        redirectAfterLogin('menu.html');
                    }, 500);
                } else {
                    alert('Las contraseñas no coinciden');
                }
            } else {
                alert('Por favor, completa todos los campos');
            }
        });
    }
}

/**
 * Initialize login page when DOM is ready
 */
class LoginInit {
    static init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    static setup() {
        console.log('🚀 Initializing Login Page...');
        
        // Initialize auth manager
        const authManager = new AuthManager();
        authManager.init();
    }
}

// Export for modular usage
export { LoginInit, AuthManager };

// Auto-initialize when script loads
LoginInit.init();