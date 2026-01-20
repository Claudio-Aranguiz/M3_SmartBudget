/**
 * Storage Manager
 * Handles all local storage operations with error handling and data validation
 */

export class StorageManager {
    static PREFIX = 'smartbudget_';
    static initialized = false;
    static available = false;

    /**
     * Initialize storage manager
     */
    static init() {
        if (this.initialized) return;

        this.checkStorageAvailability();
        this.cleanupExpiredData();
        this.initialized = true;
    }

    /**
     * Check if localStorage is available
     */
    static checkStorageAvailability() {
        try {
            const testKey = this.PREFIX + 'test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            this.available = true;
        } catch (error) {
            console.warn('LocalStorage is not available:', error);
            this.available = false;
        }
    }

    /**
     * Set item in storage
     */
    static setItem(key, value, options = {}) {
        if (!this.available) {
            console.warn('Storage not available');
            return false;
        }

        try {
            const {
                encrypt = false,
                expires = null,
                compress = false
            } = options;

            const data = {
                value,
                timestamp: Date.now(),
                expires,
                encrypted: encrypt,
                compressed: compress
            };

            // Encrypt if requested
            if (encrypt) {
                data.value = this.encrypt(JSON.stringify(value));
            }

            // Compress if requested
            if (compress) {
                data.value = this.compress(JSON.stringify(data.value));
            }

            const serializedData = JSON.stringify(data);
            localStorage.setItem(this.PREFIX + key, serializedData);
            
            return true;
        } catch (error) {
            console.error('Error setting storage item:', error);
            return false;
        }
    }

    /**
     * Get item from storage
     */
    static getItem(key, defaultValue = null) {
        if (!this.available) {
            return defaultValue;
        }

        try {
            const serializedData = localStorage.getItem(this.PREFIX + key);
            
            if (serializedData === null) {
                return defaultValue;
            }

            const data = JSON.parse(serializedData);

            // Check if data is expired
            if (data.expires && Date.now() > data.expires) {
                this.removeItem(key);
                return defaultValue;
            }

            let value = data.value;

            // Decompress if needed
            if (data.compressed) {
                value = JSON.parse(this.decompress(value));
            }

            // Decrypt if needed
            if (data.encrypted) {
                value = JSON.parse(this.decrypt(value));
            }

            return value;
        } catch (error) {
            console.error('Error getting storage item:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from storage
     */
    static removeItem(key) {
        if (!this.available) return false;

        try {
            localStorage.removeItem(this.PREFIX + key);
            return true;
        } catch (error) {
            console.error('Error removing storage item:', error);
            return false;
        }
    }

    /**
     * Check if item exists
     */
    static hasItem(key) {
        if (!this.available) return false;

        return localStorage.getItem(this.PREFIX + key) !== null;
    }

    /**
     * Clear all app data
     */
    static clear() {
        if (!this.available) return false;

        try {
            const keys = this.getAllKeys();
            keys.forEach(key => {
                localStorage.removeItem(this.PREFIX + key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Get all keys for this app
     */
    static getAllKeys() {
        if (!this.available) return [];

        const keys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.PREFIX)) {
                keys.push(key.replace(this.PREFIX, ''));
            }
        }

        return keys;
    }

    /**
     * Get storage usage information
     */
    static getUsageInfo() {
        if (!this.available) {
            return {
                available: false,
                used: 0,
                total: 0,
                percentage: 0,
                itemCount: 0
            };
        }

        try {
            let totalSize = 0;
            let itemCount = 0;
            
            const keys = this.getAllKeys();
            
            keys.forEach(key => {
                const item = localStorage.getItem(this.PREFIX + key);
                if (item) {
                    totalSize += item.length;
                    itemCount++;
                }
            });

            // Estimate total localStorage capacity (usually ~5MB)
            const estimatedCapacity = 5 * 1024 * 1024; // 5MB in characters

            return {
                available: true,
                used: totalSize,
                total: estimatedCapacity,
                percentage: (totalSize / estimatedCapacity) * 100,
                itemCount,
                usedFormatted: this.formatBytes(totalSize),
                totalFormatted: this.formatBytes(estimatedCapacity)
            };
        } catch (error) {
            console.error('Error getting storage usage:', error);
            return {
                available: false,
                used: 0,
                total: 0,
                percentage: 0,
                itemCount: 0
            };
        }
    }

    /**
     * Set item with expiration time
     */
    static setItemWithExpiration(key, value, expirationMinutes) {
        const expirationTime = Date.now() + (expirationMinutes * 60 * 1000);
        
        return this.setItem(key, value, {
            expires: expirationTime
        });
    }

    /**
     * Set session item (expires when tab closes)
     */
    static setSessionItem(key, value) {
        try {
            sessionStorage.setItem(this.PREFIX + key, JSON.stringify({
                value,
                timestamp: Date.now()
            }));
            return true;
        } catch (error) {
            console.error('Error setting session item:', error);
            return false;
        }
    }

    /**
     * Get session item
     */
    static getSessionItem(key, defaultValue = null) {
        try {
            const serializedData = sessionStorage.getItem(this.PREFIX + key);
            
            if (serializedData === null) {
                return defaultValue;
            }

            const data = JSON.parse(serializedData);
            return data.value;
        } catch (error) {
            console.error('Error getting session item:', error);
            return defaultValue;
        }
    }

    /**
     * Remove session item
     */
    static removeSessionItem(key) {
        try {
            sessionStorage.removeItem(this.PREFIX + key);
            return true;
        } catch (error) {
            console.error('Error removing session item:', error);
            return false;
        }
    }

    /**
     * Backup all storage data
     */
    static backup() {
        if (!this.available) return null;

        try {
            const backup = {
                timestamp: Date.now(),
                version: '1.0',
                data: {}
            };

            const keys = this.getAllKeys();
            
            keys.forEach(key => {
                const value = this.getItem(key);
                if (value !== null) {
                    backup.data[key] = value;
                }
            });

            return JSON.stringify(backup, null, 2);
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }

    /**
     * Restore from backup
     */
    static restore(backupJson) {
        if (!this.available) return false;

        try {
            const backup = JSON.parse(backupJson);
            
            if (!backup.data) {
                throw new Error('Invalid backup format');
            }

            // Clear existing data
            this.clear();

            // Restore data
            Object.entries(backup.data).forEach(([key, value]) => {
                this.setItem(key, value);
            });

            return true;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }

    /**
     * Clean up expired data
     */
    static cleanupExpiredData() {
        if (!this.available) return;

        try {
            const keys = this.getAllKeys();
            const now = Date.now();
            
            keys.forEach(key => {
                try {
                    const serializedData = localStorage.getItem(this.PREFIX + key);
                    if (serializedData) {
                        const data = JSON.parse(serializedData);
                        
                        if (data.expires && now > data.expires) {
                            this.removeItem(key);
                        }
                    }
                } catch (error) {
                    // If we can't parse the data, it's corrupted, so remove it
                    this.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error cleaning up expired data:', error);
        }
    }

    /**
     * Migrate data from old version
     */
    static migrate(fromVersion, toVersion) {
        if (!this.available) return false;

        try {
            // Example migration logic
            if (fromVersion === '1.0' && toVersion === '1.1') {
                // Perform specific migration tasks
                const transactions = this.getItem('transactions', []);
                
                // Add new fields to existing transactions
                const migratedTransactions = transactions.map(transaction => ({
                    ...transaction,
                    createdAt: transaction.createdAt || new Date().toISOString(),
                    updatedAt: transaction.updatedAt || new Date().toISOString()
                }));

                this.setItem('transactions', migratedTransactions);
            }

            // Update version
            this.setItem('appVersion', toVersion);
            
            return true;
        } catch (error) {
            console.error('Error migrating data:', error);
            return false;
        }
    }

    /**
     * Monitor storage changes
     */
    static onStorageChange(callback) {
        if (!this.available) return () => {};

        const handleStorageChange = (event) => {
            if (event.key && event.key.startsWith(this.PREFIX)) {
                const key = event.key.replace(this.PREFIX, '');
                const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
                const newValue = event.newValue ? JSON.parse(event.newValue) : null;
                
                callback({
                    key,
                    oldValue: oldValue?.value,
                    newValue: newValue?.value,
                    action: newValue ? (oldValue ? 'update' : 'add') : 'remove'
                });
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }

    /**
     * Simple encryption (not secure, for demonstration only)
     */
    static encrypt(text) {
        // This is a very simple encoding, not actual encryption
        // In a real app, use a proper encryption library
        return btoa(text);
    }

    /**
     * Simple decryption
     */
    static decrypt(encodedText) {
        try {
            return atob(encodedText);
        } catch (error) {
            console.error('Error decrypting data:', error);
            return null;
        }
    }

    /**
     * Simple compression
     */
    static compress(text) {
        // Simple compression using repeat pattern detection
        // In a real app, use a proper compression library
        return text.replace(/(.+?)\1+/g, (match, p1) => {
            const count = Math.floor(match.length / p1.length);
            return count > 1 ? `${p1}{${count}}` : match;
        });
    }

    /**
     * Simple decompression
     */
    static decompress(text) {
        // Decompress the simple compression
        return text.replace(/(.+?)\{(\d+)\}/g, (match, p1, count) => {
            return p1.repeat(parseInt(count));
        });
    }

    /**
     * Format bytes to human readable string
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Test storage functionality
     */
    static test() {
        const testKey = 'storageTest';
        const testValue = { test: 'data', number: 123, array: [1, 2, 3] };
        
        try {
            // Test basic operations
            this.setItem(testKey, testValue);
            const retrieved = this.getItem(testKey);
            
            const basicTest = JSON.stringify(testValue) === JSON.stringify(retrieved);
            
            // Test expiration
            this.setItemWithExpiration(testKey + '_exp', testValue, 0.01); // 0.6 seconds
            
            setTimeout(() => {
                const expiredValue = this.getItem(testKey + '_exp');
                const expirationTest = expiredValue === null;
                
                // Clean up
                this.removeItem(testKey);
                
                console.log('Storage Test Results:', {
                    available: this.available,
                    basicOperations: basicTest,
                    expiration: expirationTest,
                    usage: this.getUsageInfo()
                });
            }, 1000);
            
        } catch (error) {
            console.error('Storage test failed:', error);
        }
    }

    /**
     * Get storage statistics
     */
    static getStats() {
        const usage = this.getUsageInfo();
        const keys = this.getAllKeys();
        
        const stats = {
            ...usage,
            keys: keys.length,
            keysList: keys
        };

        // Get size by category
        const categories = {};
        keys.forEach(key => {
            const category = key.split('_')[0] || 'other';
            const size = localStorage.getItem(this.PREFIX + key)?.length || 0;
            
            if (!categories[category]) {
                categories[category] = { count: 0, size: 0 };
            }
            categories[category].count++;
            categories[category].size += size;
        });

        stats.categories = categories;
        
        return stats;
    }

    /**
     * Check if storage is initialized
     */
    static isInitialized() {
        return this.initialized;
    }

    /**
     * Check if storage is available
     */
    static isAvailable() {
        return this.available;
    }
}