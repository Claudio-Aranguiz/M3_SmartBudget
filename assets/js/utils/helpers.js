/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

export class Utils {
    /**
     * Format currency with locale-specific formatting
     */
    static formatCurrency(amount, currency = 'USD', locale = 'es-ES') {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            // Fallback formatting
            return `$${this.formatNumber(amount)}`;
        }
    }

    /**
     * Format number with thousands separators
     */
    static formatNumber(number, decimals = 2) {
        if (isNaN(number)) return '0.00';
        
        return parseFloat(number).toLocaleString('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    /**
     * Format date to readable string
     */
    static formatDate(date, format = 'short') {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) return '';

        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            medium: { day: 'numeric', month: 'short', year: 'numeric' },
            long: { day: 'numeric', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        };

        try {
            return dateObj.toLocaleDateString('es-ES', options[format] || options.short);
        } catch (error) {
            return dateObj.toLocaleDateString();
        }
    }

    /**
     * Get current date in YYYY-MM-DD format
     */
    static getCurrentDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * Get relative time (e.g., "hace 2 horas")
     */
    static getRelativeTime(date) {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) return `hace ${years} año${years > 1 ? 's' : ''}`;
        if (months > 0) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
        if (weeks > 0) return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        
        return 'hace un momento';
    }

    /**
     * Escape HTML to prevent XSS
     */
    static escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Debounce function to limit rapid calls
     */
    static debounce(func, delay = 300) {
        let timeoutId;
        
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle function to limit call frequency
     */
    static throttle(func, limit = 100) {
        let lastFunc;
        let lastRan;
        
        return function (...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }

    /**
     * Generate random ID
     */
    static generateId(prefix = 'id', length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = prefix + '-';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    /**
     * Generate UUID v4
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (basic)
     */
    static isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-()]{8,}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Capitalize first letter
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert to title case
     */
    static toTitleCase(str) {
        if (!str) return '';
        
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    /**
     * Truncate text with ellipsis
     */
    static truncate(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Convert bytes to human readable format
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Calculate percentage
     */
    static calculatePercentage(value, total, decimals = 1) {
        if (total === 0) return 0;
        
        const percentage = (value / total) * 100;
        return parseFloat(percentage.toFixed(decimals));
    }

    /**
     * Get random color (hex)
     */
    static getRandomColor() {
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
            '#ef4444', '#6366f1', '#06b6d4', '#84cc16', '#f97316',
            '#14b8a6', '#8b5cf6', '#f43f5e', '#06b6d4', '#a855f7'
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Convert hex to RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex
     */
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Get contrast color (black or white)
     */
    static getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return '#000000';
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * Animate number counting
     */
    static animateNumber(element, startValue, endValue, duration = 1000) {
        if (!element) return;
        
        const startTime = performance.now();
        const change = endValue - startValue;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (change * easeOut);
            
            element.textContent = Math.round(currentValue).toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Create delay promise
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Download text as file
     */
    static downloadText(text, filename = 'download.txt', mimeType = 'text/plain') {
        const blob = new Blob([text], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Download CSV data
     */
    static downloadCSV(csvContent, filename = 'data.csv') {
        this.downloadText(csvContent, filename, 'text/csv;charset=utf-8;');
    }

    /**
     * Parse CSV text to array
     */
    static parseCSV(csvText, delimiter = ',') {
        const lines = csvText.trim().split('\n');
        const result = [];
        
        for (let line of lines) {
            const row = line.split(delimiter).map(field => field.trim().replace(/^"(.*)"$/, '$1'));
            result.push(row);
        }
        
        return result;
    }

    /**
     * Convert array to CSV
     */
    static arrayToCSV(data, headers = null) {
        if (!data || data.length === 0) return '';
        
        let csv = '';
        
        // Add headers if provided
        if (headers) {
            csv += headers.map(header => `"${header}"`).join(',') + '\n';
        }
        
        // Add data rows
        data.forEach(row => {
            if (Array.isArray(row)) {
                csv += row.map(cell => `"${cell}"`).join(',') + '\n';
            } else if (typeof row === 'object') {
                const values = Object.values(row);
                csv += values.map(cell => `"${cell}"`).join(',') + '\n';
            }
        });
        
        return csv;
    }

    /**
     * Show notification (requires notification system)
     */
    static showNotification(message, type = 'info', duration = 4000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <div class="notification__icon">
                    <i class="lucide-icon" data-lucide="${this.getNotificationIcon(type)}"></i>
                </div>
                <span class="notification__message">${this.escapeHtml(message)}</span>
                <button class="notification__close" type="button">
                    <i class="lucide-icon" data-lucide="x"></i>
                </button>
            </div>
        `;

        // Add to container or body
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Add close event
        const closeButton = notification.querySelector('.notification__close');
        closeButton.addEventListener('click', () => this.removeNotification(notification));

        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('notification--show');
        }, 10);

        return notification;
    }

    /**
     * Remove notification
     */
    static removeNotification(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.remove('notification--show');
        notification.classList.add('notification--hide');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Get notification icon based on type
     */
    static getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'x-circle',
            'warning': 'alert-triangle',
            'info': 'info'
        };
        
        return icons[type] || 'info';
    }

    /**
     * Check if element is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     */
    static scrollToElement(element, offset = 0) {
        if (!element) return;
        
        const elementTop = element.offsetTop - offset;
        
        window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
        });
    }

    /**
     * Get URL parameters as object
     */
    static getURLParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        
        return params;
    }

    /**
     * Update URL parameter
     */
    static updateURLParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    }

    /**
     * Remove URL parameter
     */
    static removeURLParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
    }
}