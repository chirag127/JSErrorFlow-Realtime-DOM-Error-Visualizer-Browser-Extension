/**
 * SettingsManager Module
 * 
 * Responsible for loading, saving, and applying user settings.
 */

class SettingsManager {
  constructor() {
    // Default settings
    this.defaultSettings = {
      // General settings
      globalEnabled: true,
      autoClearOnReload: true,
      captureConsoleErrors: false,
      badgeType: 'total', // 'total' or 'new'
      
      // Highlight settings
      highlightColor: '#ff0000',
      borderStyle: 'dashed', // 'dashed', 'solid', or 'dotted'
      borderWidth: 2,
      useBackground: false,
      backgroundOpacity: 0.2,
      
      // Domain settings
      domainListType: 'blocklist', // 'allowlist' or 'blocklist'
      domainList: [],
      
      // Ignored errors
      ignoredPatterns: [],
      
      // Advanced settings
      sourcemapTimeout: 5000,
      sourcemapRetries: 2
    };
    
    // Current settings
    this.settings = { ...this.defaultSettings };
    
    // Domain-specific settings cache
    this.domainEnabledCache = new Map();
  }

  /**
   * Initialize the settings manager
   * @returns {Promise<Object>} - The loaded settings
   */
  async init() {
    await this.loadSettings();
    return this.settings;
  }

  /**
   * Load settings from storage
   * @returns {Promise<Object>} - The loaded settings
   */
  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('jevSettings', (result) => {
        if (result.jevSettings) {
          this.settings = { ...this.defaultSettings, ...result.jevSettings };
        } else {
          this.settings = { ...this.defaultSettings };
        }
        resolve(this.settings);
      });
    });
  }

  /**
   * Save settings to storage
   * @returns {Promise<void>}
   */
  async saveSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ jevSettings: this.settings }, () => {
        resolve();
      });
    });
  }

  /**
   * Reset settings to defaults
   * @returns {Promise<Object>} - The default settings
   */
  async resetSettings() {
    this.settings = { ...this.defaultSettings };
    await this.saveSettings();
    return this.settings;
  }

  /**
   * Update settings
   * @param {Object} newSettings - The new settings to apply
   * @returns {Promise<Object>} - The updated settings
   */
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    return this.settings;
  }

  /**
   * Get the current settings
   * @returns {Object} - The current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Check if the extension is enabled for a specific domain
   * @param {string} domain - The domain to check
   * @returns {boolean} - Whether the extension is enabled for this domain
   */
  isEnabledForDomain(domain) {
    // If we have a cached result, return it
    if (this.domainEnabledCache.has(domain)) {
      return this.domainEnabledCache.get(domain);
    }
    
    // If the extension is globally disabled, it's disabled for all domains
    if (!this.settings.globalEnabled) {
      this.domainEnabledCache.set(domain, false);
      return false;
    }
    
    // Check if the domain is in the domain list
    const isInList = this.settings.domainList.some(d => {
      // Exact match
      if (d === domain) return true;
      
      // Wildcard match (e.g., *.example.com)
      if (d.startsWith('*.') && domain.endsWith(d.substring(1))) return true;
      
      return false;
    });
    
    // If it's an allowlist, the extension is enabled if the domain is in the list
    // If it's a blocklist, the extension is enabled if the domain is NOT in the list
    const isEnabled = this.settings.domainListType === 'allowlist' ? isInList : !isInList;
    
    // Cache the result
    this.domainEnabledCache.set(domain, isEnabled);
    
    return isEnabled;
  }

  /**
   * Add a domain to the domain list
   * @param {string} domain - The domain to add
   * @returns {Promise<Object>} - The updated settings
   */
  async addDomain(domain) {
    // Normalize the domain (remove protocol, path, etc.)
    const normalizedDomain = this.normalizeDomain(domain);
    
    // Check if the domain is already in the list
    if (!this.settings.domainList.includes(normalizedDomain)) {
      this.settings.domainList.push(normalizedDomain);
      await this.saveSettings();
      
      // Clear the domain cache
      this.domainEnabledCache.clear();
    }
    
    return this.settings;
  }

  /**
   * Remove a domain from the domain list
   * @param {string} domain - The domain to remove
   * @returns {Promise<Object>} - The updated settings
   */
  async removeDomain(domain) {
    this.settings.domainList = this.settings.domainList.filter(d => d !== domain);
    await this.saveSettings();
    
    // Clear the domain cache
    this.domainEnabledCache.clear();
    
    return this.settings;
  }

  /**
   * Add an ignored pattern
   * @param {string} pattern - The pattern to add
   * @returns {Promise<Object>} - The updated settings
   */
  async addIgnoredPattern(pattern) {
    // Check if the pattern is already in the list
    if (!this.settings.ignoredPatterns.includes(pattern)) {
      this.settings.ignoredPatterns.push(pattern);
      await this.saveSettings();
    }
    
    return this.settings;
  }

  /**
   * Remove an ignored pattern
   * @param {string} pattern - The pattern to remove
   * @returns {Promise<Object>} - The updated settings
   */
  async removeIgnoredPattern(pattern) {
    this.settings.ignoredPatterns = this.settings.ignoredPatterns.filter(p => p !== pattern);
    await this.saveSettings();
    
    return this.settings;
  }

  /**
   * Normalize a domain string
   * @param {string} domain - The domain to normalize
   * @returns {string} - The normalized domain
   */
  normalizeDomain(domain) {
    // Remove protocol
    domain = domain.replace(/^https?:\/\//, '');
    
    // Remove path and query string
    domain = domain.split('/')[0];
    
    // Remove port
    domain = domain.split(':')[0];
    
    return domain;
  }

  /**
   * Clear the domain cache
   */
  clearDomainCache() {
    this.domainEnabledCache.clear();
  }
}

export default SettingsManager;
