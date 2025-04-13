/**
 * Background Script (Service Worker)
 * 
 * Manages extension state, communication between components,
 * and icon badging.
 */

import SettingsManager from './modules/settingsManager.js';

// Initialize the settings manager
const settingsManager = new SettingsManager();

// Store error counts per tab
const errorCounts = new Map();
// Store new error counts (since last panel open) per tab
const newErrorCounts = new Map();
// Store whether the panel is open for each tab
const isPanelOpen = new Map();

// Initialize the extension
async function init() {
  await settingsManager.init();
  
  // Set up listeners
  chrome.runtime.onMessage.addListener(handleMessage);
  chrome.tabs.onUpdated.addListener(handleTabUpdated);
  chrome.tabs.onRemoved.addListener(handleTabRemoved);
  chrome.action.onClicked.addListener(handleActionClicked);
}

/**
 * Handle messages from content scripts and popup
 * @param {Object} message - The message
 * @param {Object} sender - The sender information
 * @param {Function} sendResponse - Function to send a response
 * @returns {boolean} - Whether the response will be sent asynchronously
 */
function handleMessage(message, sender, sendResponse) {
  switch (message.action) {
    case 'getSettings':
      sendResponse({ settings: settingsManager.getSettings() });
      break;
      
    case 'updateSettings':
      settingsManager.updateSettings(message.settings)
        .then(() => {
          // Notify all tabs about the settings update
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated', settings: message.settings })
                .catch(() => {
                  // Ignore errors (tab might not have content script)
                });
            });
          });
          
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error updating settings:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously
      
    case 'resetSettings':
      settingsManager.resetSettings()
        .then(() => {
          // Notify all tabs about the settings reset
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { 
                action: 'settingsUpdated', 
                settings: settingsManager.getSettings() 
              }).catch(() => {
                // Ignore errors (tab might not have content script)
              });
            });
          });
          
          sendResponse({ success: true, settings: settingsManager.getSettings() });
        })
        .catch(error => {
          console.error('Error resetting settings:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously
      
    case 'errorDetected':
      if (sender.tab) {
        // Update error count for this tab
        const tabId = sender.tab.id;
        const currentCount = errorCounts.get(tabId) || 0;
        errorCounts.set(tabId, currentCount + 1);
        
        // Update new error count if the panel is not open
        if (!isPanelOpen.get(tabId)) {
          const newCount = newErrorCounts.get(tabId) || 0;
          newErrorCounts.set(tabId, newCount + 1);
        }
        
        // Update the badge
        updateBadge(tabId);
      }
      sendResponse({ success: true });
      break;
      
    case 'clearErrors':
      if (sender.tab) {
        const tabId = sender.tab.id;
        errorCounts.set(tabId, 0);
        newErrorCounts.set(tabId, 0);
        updateBadge(tabId);
        
        // Notify the content script to clear highlights
        chrome.tabs.sendMessage(tabId, { action: 'clearHighlights' })
          .catch(() => {
            // Ignore errors (tab might not have content script)
          });
      }
      sendResponse({ success: true });
      break;
      
    case 'panelOpened':
      if (sender.tab) {
        const tabId = sender.tab.id;
        isPanelOpen.set(tabId, true);
        
        // Reset new error count
        newErrorCounts.set(tabId, 0);
        updateBadge(tabId);
      }
      sendResponse({ success: true });
      break;
      
    case 'panelClosed':
      if (sender.tab) {
        const tabId = sender.tab.id;
        isPanelOpen.set(tabId, false);
      }
      sendResponse({ success: true });
      break;
      
    case 'openPanel':
      // Open the extension panel
      chrome.action.openPopup();
      
      // If an element ID was provided, send a message to focus on that error
      if (message.elementId) {
        // Wait a bit for the popup to open
        setTimeout(() => {
          chrome.runtime.sendMessage({ 
            action: 'focusError', 
            elementId: message.elementId 
          }).catch(() => {
            // Ignore errors (popup might not be open yet)
          });
        }, 200);
      }
      
      sendResponse({ success: true });
      break;
      
    case 'flashHighlight':
      if (message.tabId && message.elementId) {
        chrome.tabs.sendMessage(message.tabId, { 
          action: 'flashHighlight', 
          elementId: message.elementId 
        }).catch(() => {
          // Ignore errors (tab might not have content script)
        });
      }
      sendResponse({ success: true });
      break;
      
    case 'getErrorCounts':
      if (sender.tab) {
        const tabId = sender.tab.id;
        sendResponse({
          total: errorCounts.get(tabId) || 0,
          new: newErrorCounts.get(tabId) || 0
        });
      } else {
        sendResponse({ total: 0, new: 0 });
      }
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return false; // Will not respond asynchronously
}

/**
 * Handle tab updates
 * @param {number} tabId - The ID of the updated tab
 * @param {Object} changeInfo - Information about the change
 * @param {Object} tab - The tab that was updated
 */
function handleTabUpdated(tabId, changeInfo, tab) {
  // If the tab URL changed, check if we should clear errors
  if (changeInfo.url) {
    const settings = settingsManager.getSettings();
    
    if (settings.autoClearOnReload) {
      errorCounts.set(tabId, 0);
      newErrorCounts.set(tabId, 0);
      updateBadge(tabId);
    }
  }
  
  // If the tab was reloaded or navigated, reset the panel open state
  if (changeInfo.status === 'loading') {
    isPanelOpen.set(tabId, false);
  }
}

/**
 * Handle tab removal
 * @param {number} tabId - The ID of the removed tab
 */
function handleTabRemoved(tabId) {
  // Clean up data for this tab
  errorCounts.delete(tabId);
  newErrorCounts.delete(tabId);
  isPanelOpen.delete(tabId);
}

/**
 * Handle action button click
 * @param {Object} tab - The active tab
 */
function handleActionClicked(tab) {
  // This is handled by the popup, but we'll mark the panel as open
  isPanelOpen.set(tab.id, true);
  
  // Reset new error count
  newErrorCounts.set(tab.id, 0);
  updateBadge(tab.id);
}

/**
 * Update the badge for a tab
 * @param {number} tabId - The tab ID
 */
function updateBadge(tabId) {
  const settings = settingsManager.getSettings();
  
  // Determine which count to show
  const count = settings.badgeType === 'new' 
    ? (newErrorCounts.get(tabId) || 0)
    : (errorCounts.get(tabId) || 0);
  
  // Set the badge text
  if (count > 0) {
    // Format the count (999+ for large numbers)
    const badgeText = count > 999 ? '999+' : count.toString();
    chrome.action.setBadgeText({ text: badgeText, tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#e74c3c', tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
}

// Initialize the extension
init();
