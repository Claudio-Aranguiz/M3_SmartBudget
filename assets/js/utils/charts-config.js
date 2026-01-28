/**
 * Charts Configuration Manager
 * Allows switching between static and dynamic charts
 */

export class ChartsConfigManager {
    static config = {
        useDynamicData: true, // Cambiar a false para usar datos estáticos
        enableRealTimeUpdates: true,
        showLoadingIndicators: true,
        fallbackToStaticOnError: true
    };

    /**
     * Enable dynamic charts with real transaction data
     */
    static enableDynamicCharts() {
        this.config.useDynamicData = true;
        console.log('✅ Dynamic charts enabled');
        this.notifyConfigChange();
    }

    /**
     * Disable dynamic charts (use static data)
     */
    static disableDynamicCharts() {
        this.config.useDynamicData = false;
        console.log('⏸️ Dynamic charts disabled - using static data');
        this.notifyConfigChange();
    }

    /**
     * Toggle between dynamic and static charts
     */
    static toggleChartsMode() {
        this.config.useDynamicData = !this.config.useDynamicData;
        console.log(`🔄 Charts mode switched to: ${this.config.useDynamicData ? 'Dynamic' : 'Static'}`);
        this.notifyConfigChange();
    }

    /**
     * Get current configuration
     */
    static getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    static updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🔧 Charts configuration updated:', this.config);
        this.notifyConfigChange();
    }

    /**
     * Check if dynamic charts are enabled
     */
    static isDynamicMode() {
        return this.config.useDynamicData;
    }

    /**
     * Check if static charts are enabled
     */
    static isStaticMode() {
        return !this.config.useDynamicData;
    }

    /**
     * Notify configuration changes
     */
    static notifyConfigChange() {
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('chartsConfigChanged', {
            detail: this.config
        }));
    }

    /**
     * Add debug controls to page (for testing)
     */
    static addDebugControls() {
        if (document.querySelector('#charts-debug-controls')) return;

        const debugPanel = document.createElement('div');
        debugPanel.id = 'charts-debug-controls';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: system-ui, sans-serif;
            font-size: 12px;
            min-width: 200px;
        `;

        debugPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">📊 Charts Debug</div>
            <div style="margin-bottom: 8px;">
                <strong>Mode:</strong> 
                <span id="current-mode">${this.isDynamicMode() ? 'Dynamic' : 'Static'}</span>
            </div>
            <button id="toggle-mode" style="
                background: #3b82f6; 
                color: white; 
                border: none; 
                padding: 4px 8px; 
                border-radius: 4px; 
                cursor: pointer;
                margin-right: 5px;
                font-size: 11px;
            ">Toggle Mode</button>
            <button id="refresh-charts" style="
                background: #10b981; 
                color: white; 
                border: none; 
                padding: 4px 8px; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 11px;
            ">Refresh</button>
            <div style="margin-top: 8px; font-size: 10px; color: #666;">
                Dynamic: usa datos reales<br>
                Static: usa datos de ejemplo
            </div>
        `;

        document.body.appendChild(debugPanel);

        // Add event listeners
        document.getElementById('toggle-mode').addEventListener('click', () => {
            this.toggleChartsMode();
            document.getElementById('current-mode').textContent = 
                this.isDynamicMode() ? 'Dynamic' : 'Static';
        });

        document.getElementById('refresh-charts').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('refreshChartsRequested'));
        });

        console.log('🛠️ Debug controls added');
    }

    /**
     * Remove debug controls
     */
    static removeDebugControls() {
        const debugPanel = document.querySelector('#charts-debug-controls');
        if (debugPanel) {
            debugPanel.remove();
            console.log('🛠️ Debug controls removed');
        }
    }
}

// Export default configuration
export default ChartsConfigManager;