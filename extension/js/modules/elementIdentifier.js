/**
 * ElementIdentifier Module
 * 
 * Responsible for identifying DOM elements associated with JavaScript errors
 * using various heuristics.
 */

class ElementIdentifier {
  constructor() {
    this.eventListenerRegistry = new Map();
    this.setupEventListenerTracking();
  }

  /**
   * Set up tracking for event listeners to help identify elements
   * associated with errors
   */
  setupEventListenerTracking() {
    // Store original addEventListener
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const registry = this.eventListenerRegistry;
    
    // Override addEventListener to track event listeners
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      // Call original method
      const result = originalAddEventListener.call(this, type, listener, options);
      
      try {
        // Only track if this is a DOM element
        if (this instanceof Element) {
          // Get the stack trace to find where the event listener was added
          const stack = new Error().stack;
          
          // Store in registry
          if (!registry.has(listener)) {
            registry.set(listener, []);
          }
          
          registry.get(listener).push({
            element: this,
            type: type,
            stack: stack
          });
        }
      } catch (e) {
        console.error('Error tracking event listener:', e);
      }
      
      return result;
    };
  }

  /**
   * Identify DOM elements associated with an error
   * @param {Object} error - The error object
   * @returns {Array<Element>} - Array of identified DOM elements
   */
  identifyElements(error) {
    if (!error) return [];
    
    const elements = new Set();
    
    // Try different heuristics to identify elements
    this.findElementsFromEventListeners(error, elements);
    this.findElementsFromEventTarget(error, elements);
    this.findElementsFromStackTrace(error, elements);
    
    return Array.from(elements);
  }

  /**
   * Find elements by looking at event listeners that might be related to the error
   * @param {Object} error - The error object
   * @param {Set<Element>} elements - Set to add found elements to
   */
  findElementsFromEventListeners(error, elements) {
    if (!error.stack) return;
    
    // Extract function names from the stack trace
    const functionNames = this.extractFunctionNamesFromStack(error.stack);
    
    // Check if any of these functions are event listeners
    for (const [listener, registrations] of this.eventListenerRegistry.entries()) {
      // Try to get the function name
      const listenerName = listener.name || listener.toString().match(/function\s*([^(]*)/)?.[1]?.trim();
      
      if (listenerName && functionNames.includes(listenerName)) {
        // This listener might be related to the error
        registrations.forEach(reg => {
          if (reg.element && document.contains(reg.element)) {
            elements.add(reg.element);
          }
        });
      }
    }
  }

  /**
   * Find elements from the event target if the error occurred in an event handler
   * @param {Object} error - The error object
   * @param {Set<Element>} elements - Set to add found elements to
   */
  findElementsFromEventTarget(error, elements) {
    if (error.eventTarget && error.eventTarget instanceof Element && document.contains(error.eventTarget)) {
      elements.add(error.eventTarget);
    }
  }

  /**
   * Find elements by analyzing the stack trace for references to DOM elements
   * @param {Object} error - The error object
   * @param {Set<Element>} elements - Set to add found elements to
   */
  findElementsFromStackTrace(error, elements) {
    if (!error.stack) return;
    
    // Look for common DOM selector patterns in the stack trace
    const selectorPatterns = [
      /document\.getElementById\(['"]([^'"]+)['"]\)/g,
      /document\.querySelector\(['"]([^'"]+)['"]\)/g,
      /document\.getElementsByClassName\(['"]([^'"]+)['"]\)/g,
      /\$\(['"]([^'"]+)['"]\)/g, // jQuery
      /document\.getElementsByTagName\(['"]([^'"]+)['"]\)/g
    ];
    
    for (const pattern of selectorPatterns) {
      let match;
      while ((match = pattern.exec(error.stack)) !== null) {
        const selector = match[1];
        try {
          // Try different selector types
          let foundElements = [];
          
          if (pattern.source.includes('getElementById')) {
            const element = document.getElementById(selector);
            if (element) foundElements = [element];
          } else if (pattern.source.includes('getElementsByClassName')) {
            foundElements = Array.from(document.getElementsByClassName(selector));
          } else if (pattern.source.includes('getElementsByTagName')) {
            foundElements = Array.from(document.getElementsByTagName(selector));
          } else {
            // querySelector or jQuery
            foundElements = Array.from(document.querySelectorAll(selector));
          }
          
          foundElements.forEach(el => {
            if (document.contains(el)) {
              elements.add(el);
            }
          });
        } catch (e) {
          // Invalid selector, ignore
        }
      }
    }
    
    // If we still don't have elements, try a more aggressive approach
    if (elements.size === 0) {
      this.findElementsFromDOMReferences(error, elements);
    }
  }

  /**
   * Find elements by looking for DOM element IDs and classes in the code
   * @param {Object} error - The error object
   * @param {Set<Element>} elements - Set to add found elements to
   */
  findElementsFromDOMReferences(error, elements) {
    if (!error.stack) return;
    
    // Extract potential element IDs (assuming camelCase or with 'Id' suffix)
    const idPattern = /['"](#[a-zA-Z0-9_-]+)['"]/g;
    let match;
    
    while ((match = idPattern.exec(error.stack)) !== null) {
      const id = match[1].substring(1); // Remove the # character
      const element = document.getElementById(id);
      if (element && document.contains(element)) {
        elements.add(element);
      }
    }
    
    // Look for class references
    const classPattern = /['"](\.[a-zA-Z0-9_-]+)['"]/g;
    while ((match = classPattern.exec(error.stack)) !== null) {
      const className = match[1].substring(1); // Remove the . character
      const matchingElements = document.getElementsByClassName(className);
      Array.from(matchingElements).forEach(el => {
        if (document.contains(el)) {
          elements.add(el);
        }
      });
    }
  }

  /**
   * Extract function names from a stack trace
   * @param {string} stack - The stack trace
   * @returns {Array<string>} - Array of function names
   */
  extractFunctionNamesFromStack(stack) {
    const functionNames = [];
    const lines = stack.split('\n');
    
    for (const line of lines) {
      // Match "at functionName (" pattern
      const match = line.match(/at\s+([^\s(]+)\s*\(/);
      if (match && match[1] !== 'new' && match[1] !== 'async') {
        functionNames.push(match[1]);
      }
    }
    
    return functionNames;
  }

  /**
   * Clear the event listener registry
   */
  clearRegistry() {
    this.eventListenerRegistry.clear();
  }
}

export default ElementIdentifier;
