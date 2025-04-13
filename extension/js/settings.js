/**
 * Settings Script
 * 
 * Manages the extension settings page UI and interactions.
 */

// DOM Elements - General Settings
const globalToggle = document.getElementById('global-toggle');
const autoClear = document.getElementById('auto-clear');
const captureConsoleErrors = document.getElementById('capture-console-errors');
const badgeType = document.getElementById('badge-type');

// DOM Elements - Highlight Customization
const highlightColor = document.getElementById('highlight-color');
const borderStyle = document.getElementById('border-style');
const borderWidth = document.getElementById('border-width');
const borderWidthValue = document.getElementById('border-width-value');
const useBackground = document.getElementById('use-background');
const backgroundOpacity = document.getElementById('background-opacity');
const backgroundOpacityValue = document.getElementById('background-opacity-value');
const backgroundOpacityContainer = document.getElementById('background-opacity-container');

// DOM Elements - Domain Settings
const domainListType = document.getElementById('domain-list-type');
const domainInput = document.getElementById('domain-input');
const addDomainBtn = document.getElementById('add-domain-btn');
const domainList = document.getElementById('domain-list');
const noDomainsMessage = document.getElementById('no-domains-message');

// DOM Elements - Ignored Errors
const ignoredPatternInput = document.getElementById('ignored-pattern-input');
const addIgnoredPatternBtn = document.getElementById('add-ignored-pattern-btn');
const ignoredPatternsList = document.getElementById('ignored-patterns-list');
const noPatternsMessage = document.getElementById('no-patterns-message');

// DOM Elements - Advanced Settings
const sourcemapTimeout = document.getElementById('sourcemap-timeout');
const sourcemapRetries = document.getElementById('sourcemap-retries');

// DOM Elements - Footer
const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// State
let settings = null;
let hasUnsavedChanges = false;

// Initialize the settings page
async function init() {
  // Load settings
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
  
  // Populate the UI with settings
  populateSettings();
}

/**
 * Load settings from the background script
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response && response.settings) {
        settings = response.settings;
      }
      
      resolve();
    });
  });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // General Settings
  globalToggle.addEventListener('change', () => {
    settings.globalEnabled = globalToggle.checked;
    hasUnsavedChanges = true;
  });
  
  autoClear.addEventListener('change', () => {
    settings.autoClearOnReload = autoClear.checked;
    hasUnsavedChanges = true;
  });
  
  captureConsoleErrors.addEventListener('change', () => {
    settings.captureConsoleErrors = captureConsoleErrors.checked;
    hasUnsavedChanges = true;
  });
  
  badgeType.addEventListener('change', () => {
    settings.badgeType = badgeType.value;
    hasUnsavedChanges = true;
  });
  
  // Highlight Customization
  highlightColor.addEventListener('change', () => {
    settings.highlightColor = highlightColor.value;
    hasUnsavedChanges = true;
  });
  
  borderStyle.addEventListener('change', () => {
    settings.borderStyle = borderStyle.value;
    hasUnsavedChanges = true;
  });
  
  borderWidth.addEventListener('input', () => {
    settings.borderWidth = parseInt(borderWidth.value);
    borderWidthValue.textContent = `${borderWidth.value}px`;
    hasUnsavedChanges = true;
  });
  
  useBackground.addEventListener('change', () => {
    settings.useBackground = useBackground.checked;
    backgroundOpacityContainer.style.display = useBackground.checked ? 'flex' : 'none';
    hasUnsavedChanges = true;
  });
  
  backgroundOpacity.addEventListener('input', () => {
    settings.backgroundOpacity = parseFloat(backgroundOpacity.value);
    backgroundOpacityValue.textContent = backgroundOpacity.value;
    hasUnsavedChanges = true;
  });
  
  // Domain Settings
  domainListType.addEventListener('change', () => {
    settings.domainListType = domainListType.value;
    hasUnsavedChanges = true;
  });
  
  addDomainBtn.addEventListener('click', addDomain);
  
  // Ignored Errors
  addIgnoredPatternBtn.addEventListener('click', addIgnoredPattern);
  
  // Advanced Settings
  sourcemapTimeout.addEventListener('change', () => {
    settings.sourcemapTimeout = parseInt(sourcemapTimeout.value);
    hasUnsavedChanges = true;
  });
  
  sourcemapRetries.addEventListener('change', () => {
    settings.sourcemapRetries = parseInt(sourcemapRetries.value);
    hasUnsavedChanges = true;
  });
  
  // Footer
  resetDefaultsBtn.addEventListener('click', resetDefaults);
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Warn about unsaved changes
  window.addEventListener('beforeunload', (event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  });
}

/**
 * Populate the UI with settings
 */
function populateSettings() {
  if (!settings) return;
  
  // General Settings
  globalToggle.checked = settings.globalEnabled;
  autoClear.checked = settings.autoClearOnReload;
  captureConsoleErrors.checked = settings.captureConsoleErrors;
  badgeType.value = settings.badgeType;
  
  // Highlight Customization
  highlightColor.value = settings.highlightColor;
  borderStyle.value = settings.borderStyle;
  borderWidth.value = settings.borderWidth;
  borderWidthValue.textContent = `${settings.borderWidth}px`;
  useBackground.checked = settings.useBackground;
  backgroundOpacity.value = settings.backgroundOpacity;
  backgroundOpacityValue.textContent = settings.backgroundOpacity;
  backgroundOpacityContainer.style.display = settings.useBackground ? 'flex' : 'none';
  
  // Domain Settings
  domainListType.value = settings.domainListType;
  renderDomainList();
  
  // Ignored Errors
  renderIgnoredPatternsList();
  
  // Advanced Settings
  sourcemapTimeout.value = settings.sourcemapTimeout;
  sourcemapRetries.value = settings.sourcemapRetries;
}

/**
 * Render the domain list
 */
function renderDomainList() {
  // Clear the list
  domainList.innerHTML = '';
  
  if (!settings.domainList || settings.domainList.length === 0) {
    noDomainsMessage.style.display = 'block';
    return;
  }
  
  noDomainsMessage.style.display = 'none';
  
  // Render each domain
  settings.domainList.forEach(domain => {
    const domainItem = document.createElement('li');
    domainItem.className = 'domain-item';
    
    domainItem.innerHTML = `
      <span>${domain}</span>
      <button class="remove-btn" data-domain="${domain}">Remove</button>
    `;
    
    domainList.appendChild(domainItem);
  });
  
  // Add click events for remove buttons
  const removeButtons = domainList.querySelectorAll('.remove-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      removeDomain(button.dataset.domain);
    });
  });
}

/**
 * Add a domain to the list
 */
function addDomain() {
  const domain = domainInput.value.trim();
  
  if (!domain) {
    alert('Please enter a domain.');
    return;
  }
  
  // Normalize the domain
  const normalizedDomain = normalizeDomain(domain);
  
  // Check if the domain is already in the list
  if (settings.domainList.includes(normalizedDomain)) {
    alert('This domain is already in the list.');
    return;
  }
  
  // Add the domain to the list
  settings.domainList.push(normalizedDomain);
  
  // Clear the input
  domainInput.value = '';
  
  // Render the updated list
  renderDomainList();
  
  hasUnsavedChanges = true;
}

/**
 * Remove a domain from the list
 * @param {string} domain - The domain to remove
 */
function removeDomain(domain) {
  settings.domainList = settings.domainList.filter(d => d !== domain);
  renderDomainList();
  hasUnsavedChanges = true;
}

/**
 * Normalize a domain string
 * @param {string} domain - The domain to normalize
 * @returns {string} - The normalized domain
 */
function normalizeDomain(domain) {
  // Remove protocol
  domain = domain.replace(/^https?:\/\//, '');
  
  // Remove path and query string
  domain = domain.split('/')[0];
  
  // Remove port
  domain = domain.split(':')[0];
  
  return domain;
}

/**
 * Render the ignored patterns list
 */
function renderIgnoredPatternsList() {
  // Clear the list
  ignoredPatternsList.innerHTML = '';
  
  if (!settings.ignoredPatterns || settings.ignoredPatterns.length === 0) {
    noPatternsMessage.style.display = 'block';
    return;
  }
  
  noPatternsMessage.style.display = 'none';
  
  // Render each pattern
  settings.ignoredPatterns.forEach(pattern => {
    const patternItem = document.createElement('li');
    patternItem.className = 'pattern-item';
    
    patternItem.innerHTML = `
      <span>${pattern}</span>
      <button class="remove-btn" data-pattern="${pattern}">Remove</button>
    `;
    
    ignoredPatternsList.appendChild(patternItem);
  });
  
  // Add click events for remove buttons
  const removeButtons = ignoredPatternsList.querySelectorAll('.remove-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      removeIgnoredPattern(button.dataset.pattern);
    });
  });
}

/**
 * Add an ignored pattern to the list
 */
function addIgnoredPattern() {
  const pattern = ignoredPatternInput.value.trim();
  
  if (!pattern) {
    alert('Please enter a pattern.');
    return;
  }
  
  // Check if the pattern is already in the list
  if (settings.ignoredPatterns.includes(pattern)) {
    alert('This pattern is already in the list.');
    return;
  }
  
  // Check if the pattern is a valid regex
  try {
    new RegExp(pattern);
  } catch (e) {
    alert('Invalid regular expression. Please enter a valid pattern.');
    return;
  }
  
  // Add the pattern to the list
  settings.ignoredPatterns.push(pattern);
  
  // Clear the input
  ignoredPatternInput.value = '';
  
  // Render the updated list
  renderIgnoredPatternsList();
  
  hasUnsavedChanges = true;
}

/**
 * Remove an ignored pattern from the list
 * @param {string} pattern - The pattern to remove
 */
function removeIgnoredPattern(pattern) {
  settings.ignoredPatterns = settings.ignoredPatterns.filter(p => p !== pattern);
  renderIgnoredPatternsList();
  hasUnsavedChanges = true;
}

/**
 * Reset settings to defaults
 */
function resetDefaults() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'resetSettings' }, (response) => {
    if (response && response.success) {
      settings = response.settings;
      populateSettings();
      hasUnsavedChanges = false;
      alert('Settings have been reset to defaults.');
    } else {
      alert('Error resetting settings.');
    }
  });
}

/**
 * Save settings
 */
function saveSettings() {
  chrome.runtime.sendMessage({ action: 'updateSettings', settings }, (response) => {
    if (response && response.success) {
      hasUnsavedChanges = false;
      alert('Settings have been saved.');
    } else {
      alert('Error saving settings.');
    }
  });
}

// Initialize the settings page when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
