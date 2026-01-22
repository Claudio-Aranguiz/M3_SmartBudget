/**
 * Login Page Initializer
 * Handles login and registration form functionality
 */

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

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (email && password) {
                alert('Inicio de sesión exitoso! Redirigiendo al dashboard...');
                
                // Hide modal if using Bootstrap
                if (typeof $ !== 'undefined' && $('#loginModal').length) {
                    $('#loginModal').modal('hide');
                }
                
                // Redirect to dashboard (uncomment when ready)
                // window.location.href = 'dashboard.html';
            } else {
                alert('Por favor, completa todos los campos');
            }
        });
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
                    alert('Registro exitoso! Bienvenido a SmartBudget!');
                    
                    // Hide modal if using Bootstrap
                    if (typeof $ !== 'undefined' && $('#registerModal').length) {
                        $('#registerModal').modal('hide');
                    }
                    
                    // Redirect to dashboard (uncomment when ready)
                    // window.location.href = 'dashboard.html';
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