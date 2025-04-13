/**
 * Highlighter Module
 * 
 * Responsible for visually highlighting DOM elements associated with JavaScript errors
 * and managing tooltips.
 */

class Highlighter {
  constructor(settings = {}) {
    this.settings = settings;
    this.highlights = new Map(); // Map of element to highlight info
    this.tooltipElement = null;
    this.tooltipTimeout = null;
    this.styleElement = null;
    
    // Default highlight style
    this.defaultStyle = {
      color: '#ff0000',
      borderStyle: 'dashed',
      borderWidth: 2,
      useBackground: false,
      backgroundOpacity: 0.2
    };
    
    this.style = { ...this.defaultStyle, ...settings };
  }

  /**
   * Initialize the highlighter with the provided settings
   * @param {Object} settings - The settings object
   */
  init(settings) {
    if (settings) {
      this.settings = settings;
      this.style = {
        color: settings.highlightColor || this.defaultStyle.color,
        borderStyle: settings.borderStyle || this.defaultStyle.borderStyle,
        borderWidth: settings.borderWidth || this.defaultStyle.borderWidth,
        useBackground: settings.useBackground || this.defaultStyle.useBackground,
        backgroundOpacity: settings.backgroundOpacity || this.defaultStyle.backgroundOpacity
      };
    }
    
    this.injectStyles();
    this.createTooltip();
    this.setupTooltipListeners();
  }

  /**
   * Inject the necessary styles for highlights and tooltips
   */
  injectStyles() {
    // Remove existing style element if it exists
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
    }
    
    // Create a new style element
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'jev-highlighter-styles';
    
    // Generate CSS for highlights
    const css = `
      .jev-error-highlight {
        position: relative !important;
        box-shadow: 0 0 0 ${this.style.borderWidth}px ${this.style.color} !important;
        border: ${this.style.borderWidth}px ${this.style.borderStyle} ${this.style.color} !important;
        ${this.style.useBackground ? `background-color: ${this.hexToRgba(this.style.color, this.style.backgroundOpacity)} !important;` : ''}
        z-index: 9998 !important;
      }
      
      .jev-error-highlight-multiple {
        box-shadow: 0 0 0 ${this.style.borderWidth + 1}px ${this.style.color} !important;
        border: ${this.style.borderWidth + 1}px ${this.style.borderStyle} ${this.style.color} !important;
      }
    `;
    
    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);
    
    // Load tooltip styles from the extension
    this.loadTooltipStyles();
  }

  /**
   * Load tooltip styles from the extension's CSS file
   */
  loadTooltipStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('assets/css/tooltip.css');
    document.head.appendChild(link);
  }

  /**
   * Create the tooltip element
   */
  createTooltip() {
    // Remove existing tooltip if it exists
    if (this.tooltipElement) {
      document.body.removeChild(this.tooltipElement);
    }
    
    // Create a new tooltip element
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'jev-error-tooltip';
    document.body.appendChild(this.tooltipElement);
  }

  /**
   * Set up event listeners for the tooltip
   */
  setupTooltipListeners() {
    // Global mouseover event to show tooltips
    document.addEventListener('mouseover', (event) => {
      const target = event.target;
      
      // Check if the target or any of its parents has the highlight class
      let highlightElement = null;
      let currentElement = target;
      
      while (currentElement && currentElement !== document.body) {
        if (currentElement.classList.contains('jev-error-highlight')) {
          highlightElement = currentElement;
          break;
        }
        currentElement = currentElement.parentElement;
      }
      
      if (highlightElement) {
        this.showTooltip(highlightElement, event);
      } else {
        this.hideTooltip();
      }
    });
    
    // Global mouseout event to hide tooltips
    document.addEventListener('mouseout', (event) => {
      const target = event.target;
      const relatedTarget = event.relatedTarget;
      
      // Check if we're moving from a highlighted element to a non-highlighted element
      let leavingHighlight = false;
      
      if (target.classList.contains('jev-error-highlight')) {
        // Check if we're moving to an element that's not a child of the highlight
        if (!relatedTarget || !target.contains(relatedTarget)) {
          leavingHighlight = true;
        }
      }
      
      if (leavingHighlight) {
        this.hideTooltip();
      }
    });
    
    // Click event to open the extension panel
    document.addEventListener('click', (event) => {
      const target = event.target;
      
      // Check if the target or any of its parents has the highlight class
      let highlightElement = null;
      let currentElement = target;
      
      while (currentElement && currentElement !== document.body) {
        if (currentElement.classList.contains('jev-error-highlight')) {
          highlightElement = currentElement;
          break;
        }
        currentElement = currentElement.parentElement;
      }
      
      if (highlightElement) {
        // Send a message to the background script to open the extension panel
        chrome.runtime.sendMessage({
          action: 'openPanel',
          elementId: highlightElement.dataset.jevErrorId
        });
      }
    });
  }

  /**
   * Highlight a DOM element associated with an error
   * @param {Element} element - The DOM element to highlight
   * @param {Object} error - The error object
   * @returns {string} - The unique ID assigned to this highlight
   */
  highlightElement(element, error) {
    if (!element || !document.contains(element)) {
      return null;
    }
    
    // Generate a unique ID for this error
    const errorId = this.generateErrorId(error);
    
    // Check if this element is already highlighted
    if (this.highlights.has(element)) {
      const highlightInfo = this.highlights.get(element);
      
      // Check if this error is already associated with this element
      if (!highlightInfo.errors.some(e => e.id === errorId)) {
        highlightInfo.errors.push({
          id: errorId,
          error: error
        });
        
        // Update the element's data attribute
        element.dataset.jevErrorId = highlightInfo.errors.map(e => e.id).join(',');
        
        // Add the multiple errors class if there are multiple errors
        if (highlightInfo.errors.length > 1) {
          element.classList.add('jev-error-highlight-multiple');
        }
      }
      
      return errorId;
    }
    
    // Add the highlight class
    element.classList.add('jev-error-highlight');
    
    // Store the original styles
    const originalStyles = {
      boxShadow: element.style.boxShadow,
      border: element.style.border,
      backgroundColor: element.style.backgroundColor,
      position: element.style.position,
      zIndex: element.style.zIndex
    };
    
    // Store the highlight info
    this.highlights.set(element, {
      originalStyles: originalStyles,
      errors: [{
        id: errorId,
        error: error
      }]
    });
    
    // Set the data attribute
    element.dataset.jevErrorId = errorId;
    
    return errorId;
  }

  /**
   * Remove the highlight from a DOM element
   * @param {Element} element - The DOM element to remove the highlight from
   * @param {string} [errorId] - Optional error ID to remove. If not provided, all highlights are removed.
   */
  removeHighlight(element, errorId) {
    if (!element || !this.highlights.has(element)) {
      return;
    }
    
    const highlightInfo = this.highlights.get(element);
    
    if (errorId) {
      // Remove only the specified error
      highlightInfo.errors = highlightInfo.errors.filter(e => e.id !== errorId);
      
      if (highlightInfo.errors.length === 0) {
        // No more errors, remove the highlight completely
        this.removeAllHighlights(element);
      } else {
        // Update the data attribute
        element.dataset.jevErrorId = highlightInfo.errors.map(e => e.id).join(',');
        
        // Remove the multiple errors class if there's only one error left
        if (highlightInfo.errors.length === 1) {
          element.classList.remove('jev-error-highlight-multiple');
        }
      }
    } else {
      // Remove all highlights
      this.removeAllHighlights(element);
    }
  }

  /**
   * Remove all highlights from a DOM element
   * @param {Element} element - The DOM element to remove all highlights from
   */
  removeAllHighlights(element) {
    if (!element || !this.highlights.has(element)) {
      return;
    }
    
    const highlightInfo = this.highlights.get(element);
    
    // Restore original styles
    element.style.boxShadow = highlightInfo.originalStyles.boxShadow;
    element.style.border = highlightInfo.originalStyles.border;
    element.style.backgroundColor = highlightInfo.originalStyles.backgroundColor;
    element.style.position = highlightInfo.originalStyles.position;
    element.style.zIndex = highlightInfo.originalStyles.zIndex;
    
    // Remove classes
    element.classList.remove('jev-error-highlight');
    element.classList.remove('jev-error-highlight-multiple');
    
    // Remove data attribute
    delete element.dataset.jevErrorId;
    
    // Remove from highlights map
    this.highlights.delete(element);
  }

  /**
   * Remove all highlights from all elements
   */
  removeAllHighlightsFromPage() {
    for (const element of this.highlights.keys()) {
      if (document.contains(element)) {
        this.removeAllHighlights(element);
      }
    }
    
    this.highlights.clear();
  }

  /**
   * Flash a highlight to draw attention to it
   * @param {Element} element - The DOM element to flash
   */
  flashHighlight(element) {
    if (!element || !document.contains(element) || !this.highlights.has(element)) {
      return;
    }
    
    // Scroll the element into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    
    // Add a temporary flash class
    const flashClass = 'jev-error-highlight-flash';
    
    // Create a style for the flash if it doesn't exist
    if (!document.getElementById('jev-flash-style')) {
      const style = document.createElement('style');
      style.id = 'jev-flash-style';
      style.textContent = `
        @keyframes jev-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .${flashClass} {
          animation: jev-flash 0.5s ease-in-out 3;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add the flash class
    element.classList.add(flashClass);
    
    // Remove the flash class after the animation
    setTimeout(() => {
      element.classList.remove(flashClass);
    }, 1500);
  }

  /**
   * Show the tooltip for a highlighted element
   * @param {Element} element - The highlighted element
   * @param {MouseEvent} event - The mouse event that triggered the tooltip
   */
  showTooltip(element, event) {
    if (!element || !this.highlights.has(element)) {
      return;
    }
    
    // Clear any existing timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }
    
    const highlightInfo = this.highlights.get(element);
    const errors = highlightInfo.errors;
    
    // Build the tooltip content
    let tooltipContent = '';
    
    if (errors.length === 1) {
      // Single error
      const error = errors[0].error;
      tooltipContent = `
        <div class="jev-error-tooltip-header">JavaScript Error</div>
        <div class="jev-error-tooltip-message">${this.escapeHtml(error.message)}</div>
        <div class="jev-error-tooltip-location">${error.mappedFilename || error.filename || 'Unknown location'}:${error.mappedLineno || error.lineno || '?'}</div>
        <div class="jev-error-tooltip-prompt">Click for more details</div>
      `;
    } else {
      // Multiple errors
      tooltipContent = `
        <div class="jev-error-tooltip-header">Multiple JavaScript Errors <span class="jev-error-tooltip-count">${errors.length}</span></div>
        <div class="jev-error-tooltip-message">${this.escapeHtml(errors[0].error.message)}</div>
        <div class="jev-error-tooltip-location">+ ${errors.length - 1} more errors</div>
        <div class="jev-error-tooltip-prompt">Click for more details</div>
      `;
    }
    
    // Set the tooltip content
    this.tooltipElement.innerHTML = tooltipContent;
    
    // Position the tooltip
    this.positionTooltip(element, event);
    
    // Show the tooltip
    this.tooltipElement.classList.add('visible');
  }

  /**
   * Position the tooltip relative to the element and mouse position
   * @param {Element} element - The highlighted element
   * @param {MouseEvent} event - The mouse event
   */
  positionTooltip(element, event) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    // Remove any existing position classes
    this.tooltipElement.classList.remove('top', 'bottom', 'left', 'right');
    
    // Default position (above the element)
    let top = rect.top - tooltipRect.height - 10;
    let left = event.clientX - (tooltipRect.width / 2);
    let position = 'top';
    
    // Check if the tooltip would go off the top of the viewport
    if (top < 0) {
      // Position below the element
      top = rect.bottom + 10;
      position = 'bottom';
    }
    
    // Check if the tooltip would go off the left or right of the viewport
    if (left < 10) {
      left = 10;
    } else if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    
    // Set the position
    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
    this.tooltipElement.classList.add(position);
  }

  /**
   * Hide the tooltip
   */
  hideTooltip() {
    // Set a timeout to hide the tooltip
    this.tooltipTimeout = setTimeout(() => {
      this.tooltipElement.classList.remove('visible');
      this.tooltipTimeout = null;
    }, 200);
  }

  /**
   * Generate a unique ID for an error
   * @param {Object} error - The error object
   * @returns {string} - A unique ID
   */
  generateErrorId(error) {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000);
    return `error-${timestamp}-${randomPart}`;
  }

  /**
   * Convert a hex color to rgba
   * @param {string} hex - The hex color
   * @param {number} opacity - The opacity (0-1)
   * @returns {string} - The rgba color string
   */
  hexToRgba(hex, opacity) {
    // Remove the hash if it exists
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return the rgba string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Escape HTML special characters
   * @param {string} html - The HTML string to escape
   * @returns {string} - The escaped HTML string
   */
  escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Update the highlighter style
   * @param {Object} style - The new style object
   */
  updateStyle(style) {
    this.style = { ...this.style, ...style };
    this.injectStyles();
  }

  /**
   * Get all highlighted elements
   * @returns {Map} - Map of highlighted elements to their info
   */
  getHighlights() {
    return this.highlights;
  }
}

export default Highlighter;
