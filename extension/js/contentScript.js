/**
 * Content Script
 * 
 * Injected into web pages to capture JavaScript errors and highlight
 * associated DOM elements.
 */

import ErrorCapturer from './modules/errorCapturer.js';
import SourceMapper from './modules/sourceMapper.js';
import ElementIdentifier from './modules/elementIdentifier.js';
import Highlighter from './modules/highlighter.js';
import SettingsManager from './modules/settingsManager.js';
import { getDomainFromUrl, areSimilarErrors } from './modules/utils.js';

// Initialize modules
const settingsManager = new SettingsManager();
const errorCapturer = new ErrorCapturer();
const sourceMapper = new SourceMapper();
const elementIdentifier = new ElementIdentifier();
const highlighter = new Highlighter();

// Store captured errors
let capturedErrors = [];

// Initialize the content script
async function init() {
  // Load settings
  const settings = await settingsManager.init();
  
  // Check if the extension is enabled for this domain
  const domain = getDomainFromUrl(window.location.href);
  if (!settingsManager.isEnabledForDomain(domain)) {
    console.log('JavaScript Error Visualizer is disabled for this domain.');
    return;
  }
  
  // Initialize modules with settings
  errorCapturer.init(settings);
  sourceMapper.init(settings);
  highlighter.init(settings);
  
  // Register error handler
  errorCapturer.registerErrorHandler(handleError);
  
  // Set up message listener
  chrome.runtime.onMessage.addListener(handleMessage);
  
  console.log('JavaScript Error Visualizer initialized.');
}

/**
 * Handle a captured error
 * @param {Object} error - The error object
 */
async function handleError(error) {
  try {
    // Process the error with source mapping
    const processedError = await sourceMapper.processError(error);
    
    // Check for duplicate errors
    const existingErrorIndex = findSimilarError(processedError);
    
    if (existingErrorIndex !== -1) {
      // Increment the count for the existing error
      capturedErrors[existingErrorIndex].count++;
      
      // Notify the background script
      chrome.runtime.sendMessage({ action: 'errorDetected', error: processedError });
      
      return;
    }
    
    // Identify associated DOM elements
    const elements = elementIdentifier.identifyElements(processedError);
    
    // Highlight the elements
    if (elements.length > 0) {
      processedError.associatedElements = elements.map(element => {
        const errorId = highlighter.highlightElement(element, processedError);
        return { element, errorId };
      });
    }
    
    // Add the error to the captured errors list
    capturedErrors.push(processedError);
    
    // Notify the background script
    chrome.runtime.sendMessage({ action: 'errorDetected', error: processedError });
  } catch (e) {
    console.error('Error handling captured error:', e);
  }
}

/**
 * Find a similar error in the captured errors list
 * @param {Object} error - The error to find
 * @returns {number} - The index of the similar error, or -1 if not found
 */
function findSimilarError(error) {
  return capturedErrors.findIndex(capturedError => 
    areSimilarErrors(capturedError, error)
  );
}

/**
 * Handle messages from the background script or popup
 * @param {Object} message - The message
 * @param {Object} sender - The sender information
 * @param {Function} sendResponse - Function to send a response
 * @returns {boolean} - Whether the response will be sent asynchronously
 */
function handleMessage(message, sender, sendResponse) {
  switch (message.action) {
    case 'getErrors':
      sendResponse({ errors: capturedErrors });
      break;
      
    case 'clearErrors':
      clearErrors();
      sendResponse({ success: true });
      break;
      
    case 'clearError':
      if (message.errorId) {
        clearError(message.errorId);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No error ID provided' });
      }
      break;
      
    case 'flashHighlight':
      if (message.elementId) {
        flashHighlight(message.elementId);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No element ID provided' });
      }
      break;
      
    case 'settingsUpdated':
      if (message.settings) {
        updateSettings(message.settings);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No settings provided' });
      }
      break;
      
    case 'clearHighlights':
      highlighter.removeAllHighlightsFromPage();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return false; // Will not respond asynchronously
}

/**
 * Clear all errors
 */
function clearErrors() {
  // Remove all highlights
  highlighter.removeAllHighlightsFromPage();
  
  // Clear the errors list
  capturedErrors = [];
}

/**
 * Clear a specific error
 * @param {string} errorId - The ID of the error to clear
 */
function clearError(errorId) {
  // Find the error
  const errorIndex = capturedErrors.findIndex(error => 
    error.associatedElements && 
    error.associatedElements.some(el => el.errorId === errorId)
  );
  
  if (errorIndex === -1) return;
  
  const error = capturedErrors[errorIndex];
  
  // Remove the highlight for this error
  if (error.associatedElements) {
    error.associatedElements.forEach(({ element, errorId }) => {
      highlighter.removeHighlight(element, errorId);
    });
  }
  
  // Remove the error from the list
  capturedErrors.splice(errorIndex, 1);
}

/**
 * Flash a highlight to draw attention to it
 * @param {string} elementId - The ID of the element to flash
 */
function flashHighlight(elementId) {
  // Find all elements with this error ID
  const elements = document.querySelectorAll(`[data-jev-error-id*="${elementId}"]`);
  
  elements.forEach(element => {
    highlighter.flashHighlight(element);
  });
}

/**
 * Update settings
 * @param {Object} settings - The new settings
 */
function updateSettings(settings) {
  // Update the settings manager
  settingsManager.updateSettings(settings);
  
  // Check if the extension is enabled for this domain
  const domain = getDomainFromUrl(window.location.href);
  const isEnabled = settingsManager.isEnabledForDomain(domain);
  
  // Enable/disable error capturing
  errorCapturer.setEnabled(isEnabled);
  
  // Update ignored patterns
  errorCapturer.setIgnoredPatterns(settings.ignoredPatterns);
  
  // Update highlighter style
  highlighter.updateStyle({
    color: settings.highlightColor,
    borderStyle: settings.borderStyle,
    borderWidth: settings.borderWidth,
    useBackground: settings.useBackground,
    backgroundOpacity: settings.backgroundOpacity
  });
  
  // Update source mapper settings
  sourceMapper.init({
    sourcemapTimeout: settings.sourcemapTimeout,
    sourcemapRetries: settings.sourcemapRetries
  });
}

// Initialize the content script
init();
