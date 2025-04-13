/**
 * Popup Script
 * 
 * Manages the extension popup UI and interactions.
 */

import { formatTimestamp, truncateString, escapeHtml } from './modules/utils.js';

// DOM Elements
const extensionToggle = document.getElementById('extension-toggle');
const toggleStatus = document.getElementById('toggle-status');
const searchInput = document.getElementById('search-input');
const filterType = document.getElementById('filter-type');
const errorList = document.getElementById('error-list');
const noErrorsMessage = document.getElementById('no-errors-message');
const errorDetails = document.getElementById('error-details');
const errorDetailsContent = document.getElementById('error-details-content');
const clearAllBtn = document.getElementById('clear-all-btn');
const settingsBtn = document.getElementById('settings-btn');

// State
let settings = null;
let errors = [];
let activeTabId = null;
let selectedErrorId = null;

// Initialize the popup
async function init() {
  // Get the active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) return;
  
  activeTabId = tabs[0].id;
  
  // Load settings
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load errors from the content script
  await loadErrors();
  
  // Notify the background script that the panel is open
  chrome.runtime.sendMessage({ action: 'panelOpened' });
  
  // Check for focused error from clicking a highlighted element
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'focusError' && message.elementId) {
      focusErrorByElementId(message.elementId);
      sendResponse({ success: true });
    }
  });
}

/**
 * Load settings from the background script
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response && response.settings) {
        settings = response.settings;
        
        // Update the toggle state
        extensionToggle.checked = settings.globalEnabled;
        toggleStatus.textContent = settings.globalEnabled ? 'Enabled' : 'Disabled';
      }
      
      resolve();
    });
  });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Extension toggle
  extensionToggle.addEventListener('change', () => {
    const isEnabled = extensionToggle.checked;
    toggleStatus.textContent = isEnabled ? 'Enabled' : 'Disabled';
    
    // Update settings
    settings.globalEnabled = isEnabled;
    chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings: { globalEnabled: isEnabled } 
    });
  });
  
  // Search input
  searchInput.addEventListener('input', filterErrors);
  
  // Filter type
  filterType.addEventListener('change', filterErrors);
  
  // Clear all button
  clearAllBtn.addEventListener('click', clearAllErrors);
  
  // Settings button
  settingsBtn.addEventListener('click', openSettings);
  
  // Listen for tab close
  window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({ action: 'panelClosed' });
  });
}

/**
 * Load errors from the content script
 */
async function loadErrors() {
  try {
    // Send a message to the content script to get the errors
    chrome.tabs.sendMessage(activeTabId, { action: 'getErrors' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be loaded
        console.error('Error getting errors:', chrome.runtime.lastError);
        showNoErrorsMessage();
        return;
      }
      
      if (response && response.errors) {
        errors = response.errors;
        renderErrorList();
      } else {
        showNoErrorsMessage();
      }
    });
  } catch (e) {
    console.error('Error loading errors:', e);
    showNoErrorsMessage();
  }
}

/**
 * Render the error list
 */
function renderErrorList() {
  // Clear the list
  errorList.innerHTML = '';
  
  // Filter errors
  const filteredErrors = filterErrorsList();
  
  if (filteredErrors.length === 0) {
    showNoErrorsMessage();
    return;
  }
  
  // Hide the no errors message
  noErrorsMessage.style.display = 'none';
  
  // Render each error
  filteredErrors.forEach((error, index) => {
    const errorItem = document.createElement('li');
    errorItem.className = 'error-item';
    errorItem.dataset.errorIndex = index;
    
    // Check if this error is selected
    if (selectedErrorId === index) {
      errorItem.classList.add('selected');
    }
    
    // Create the error item content
    errorItem.innerHTML = `
      <div class="error-item-header">
        <div class="error-message">${escapeHtml(truncateString(error.message, 50))}</div>
        ${error.count > 1 ? `<div class="error-count">${error.count}</div>` : ''}
      </div>
      <div class="error-info">
        <div class="error-location">
          ${error.associatedElements && error.associatedElements.length > 0 
            ? '<span class="has-element-indicator"></span>' 
            : ''}
          ${escapeHtml(error.mappedFilename || error.filename || 'Unknown')}:${error.mappedLineno || error.lineno || '?'}
        </div>
        <div class="error-timestamp">${formatTimestamp(error.timestamp)}</div>
      </div>
    `;
    
    // Add click event
    errorItem.addEventListener('click', () => {
      selectError(index);
    });
    
    errorList.appendChild(errorItem);
  });
  
  // Show the error list
  errorList.style.display = 'block';
}

/**
 * Filter the errors list based on search and filter type
 * @returns {Array} - Filtered errors
 */
function filterErrorsList() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterValue = filterType.value;
  
  return errors.filter(error => {
    // Filter by type
    if (filterValue !== 'all' && error.type !== filterValue) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const message = error.message.toLowerCase();
      const filename = (error.mappedFilename || error.filename || '').toLowerCase();
      
      return message.includes(searchTerm) || filename.includes(searchTerm);
    }
    
    return true;
  });
}

/**
 * Filter errors based on search and filter type
 */
function filterErrors() {
  renderErrorList();
}

/**
 * Show the "no errors" message
 */
function showNoErrorsMessage() {
  errorList.style.display = 'none';
  noErrorsMessage.style.display = 'block';
  errorDetails.style.display = 'none';
}

/**
 * Select an error to show its details
 * @param {number} index - The index of the error in the filtered list
 */
function selectError(index) {
  // Update selected error
  selectedErrorId = index;
  
  // Update the UI
  const errorItems = document.querySelectorAll('.error-item');
  errorItems.forEach(item => {
    item.classList.remove('selected');
    if (parseInt(item.dataset.errorIndex) === index) {
      item.classList.add('selected');
    }
  });
  
  // Show error details
  showErrorDetails(errors[index]);
}

/**
 * Focus on an error by its element ID
 * @param {string} elementId - The ID of the element
 */
function focusErrorByElementId(elementId) {
  // Find the error with this element ID
  const errorIndex = errors.findIndex(error => 
    error.associatedElements && 
    error.associatedElements.some(el => el.errorId === elementId)
  );
  
  if (errorIndex !== -1) {
    selectError(errorIndex);
  }
}

/**
 * Show error details
 * @param {Object} error - The error object
 */
function showErrorDetails(error) {
  if (!error) return;
  
  // Create the details content
  let detailsHtml = `
    <div class="error-details-section">
      <h3>Error Message</h3>
      <div class="error-message-full">${escapeHtml(error.message)}</div>
    </div>
  `;
  
  // Add stack trace if available
  if (error.stack) {
    detailsHtml += `
      <div class="error-details-section">
        <h3>Stack Trace</h3>
        <div class="stack-trace">${escapeHtml(error.stack)}</div>
      </div>
    `;
  }
  
  // Add associated elements if available
  if (error.associatedElements && error.associatedElements.length > 0) {
    detailsHtml += `
      <div class="error-details-section">
        <h3>Associated Elements</h3>
        <div class="element-links">
    `;
    
    error.associatedElements.forEach(({ errorId }, index) => {
      detailsHtml += `
        <a class="element-link" data-error-id="${errorId}">Element ${index + 1}</a>
      `;
    });
    
    detailsHtml += `
        </div>
      </div>
    `;
  }
  
  // Set the details content
  errorDetailsContent.innerHTML = detailsHtml;
  
  // Add click events for element links
  const elementLinks = errorDetailsContent.querySelectorAll('.element-link');
  elementLinks.forEach(link => {
    link.addEventListener('click', () => {
      const errorId = link.dataset.errorId;
      
      // Send a message to flash the highlight
      chrome.runtime.sendMessage({ 
        action: 'flashHighlight', 
        tabId: activeTabId, 
        elementId: errorId 
      });
    });
  });
  
  // Show the details container
  errorDetails.style.display = 'block';
}

/**
 * Clear all errors
 */
function clearAllErrors() {
  // Send a message to the content script to clear all errors
  chrome.tabs.sendMessage(activeTabId, { action: 'clearErrors' });
  
  // Clear the errors list
  errors = [];
  renderErrorList();
  
  // Hide the details
  errorDetails.style.display = 'none';
  
  // Notify the background script
  chrome.runtime.sendMessage({ action: 'clearErrors' });
}

/**
 * Open the settings page
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
