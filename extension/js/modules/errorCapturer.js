/**
 * ErrorCapturer Module
 * 
 * Responsible for setting up error listeners and capturing JavaScript errors
 * on the current page.
 */

class ErrorCapturer {
  constructor(settings) {
    this.settings = settings;
    this.errorHandlers = [];
    this.isEnabled = true;
    this.ignoredPatterns = [];
  }

  /**
   * Initialize the error capturer with the provided settings
   * @param {Object} settings - The settings object
   */
  init(settings) {
    if (settings) {
      this.settings = settings;
      this.isEnabled = settings.globalEnabled;
      this.ignoredPatterns = settings.ignoredPatterns || [];
    }
    
    this.setupErrorListeners();
  }

  /**
   * Set up all error listeners
   */
  setupErrorListeners() {
    // Uncaught exceptions
    window.addEventListener('error', this.handleRuntimeError.bind(this), true);
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this), true);
    
    // Optionally capture console.error
    if (this.settings && this.settings.captureConsoleErrors) {
      this.overrideConsoleError();
    }
  }

  /**
   * Handle runtime errors (window.onerror)
   * @param {ErrorEvent} event - The error event
   */
  handleRuntimeError(event) {
    if (!this.isEnabled) return;
    
    const error = {
      type: 'runtime',
      message: event.message || 'Unknown error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error ? event.error.stack : null,
      timestamp: new Date().toISOString(),
      count: 1,
      eventTarget: event.target,
      associatedElements: []
    };
    
    if (this.shouldIgnoreError(error)) return;
    
    this.notifyHandlers(error);
  }

  /**
   * Handle unhandled promise rejections
   * @param {PromiseRejectionEvent} event - The promise rejection event
   */
  handlePromiseRejection(event) {
    if (!this.isEnabled) return;
    
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    
    const error = {
      type: 'promise',
      message: message,
      filename: reason instanceof Error && reason.fileName ? reason.fileName : null,
      lineno: reason instanceof Error && reason.lineNumber ? reason.lineNumber : null,
      colno: reason instanceof Error && reason.columnNumber ? reason.columnNumber : null,
      error: reason instanceof Error ? reason : new Error(message),
      stack: reason instanceof Error ? reason.stack : null,
      timestamp: new Date().toISOString(),
      count: 1,
      eventTarget: event.target,
      associatedElements: []
    };
    
    if (this.shouldIgnoreError(error)) return;
    
    this.notifyHandlers(error);
  }

  /**
   * Override console.error to capture errors logged through it
   */
  overrideConsoleError() {
    const originalConsoleError = console.error;
    const self = this;
    
    console.error = function(...args) {
      // Call the original console.error
      originalConsoleError.apply(console, args);
      
      if (!self.isEnabled) return;
      
      const message = args.map(arg => {
        if (arg instanceof Error) {
          return arg.message;
        } else if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        } else {
          return String(arg);
        }
      }).join(' ');
      
      const error = {
        type: 'console',
        message: message,
        filename: null,
        lineno: null,
        colno: null,
        error: args[0] instanceof Error ? args[0] : new Error(message),
        stack: args[0] instanceof Error ? args[0].stack : (new Error()).stack,
        timestamp: new Date().toISOString(),
        count: 1,
        associatedElements: []
      };
      
      if (self.shouldIgnoreError(error)) return;
      
      self.notifyHandlers(error);
    };
  }

  /**
   * Check if an error should be ignored based on the ignored patterns
   * @param {Object} error - The error object
   * @returns {boolean} - Whether the error should be ignored
   */
  shouldIgnoreError(error) {
    if (!this.ignoredPatterns || this.ignoredPatterns.length === 0) {
      return false;
    }
    
    return this.ignoredPatterns.some(pattern => {
      try {
        const regex = new RegExp(pattern);
        return regex.test(error.message);
      } catch (e) {
        // If the pattern is not a valid regex, treat it as a simple string
        return error.message.includes(pattern);
      }
    });
  }

  /**
   * Register an error handler
   * @param {Function} handler - The handler function to call when an error is captured
   */
  registerErrorHandler(handler) {
    if (typeof handler === 'function' && !this.errorHandlers.includes(handler)) {
      this.errorHandlers.push(handler);
    }
  }

  /**
   * Unregister an error handler
   * @param {Function} handler - The handler function to remove
   */
  unregisterErrorHandler(handler) {
    const index = this.errorHandlers.indexOf(handler);
    if (index !== -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  /**
   * Notify all registered handlers about a new error
   * @param {Object} error - The error object
   */
  notifyHandlers(error) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        console.error('Error in error handler:', e);
      }
    });
  }

  /**
   * Enable or disable error capturing
   * @param {boolean} enabled - Whether error capturing should be enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Update the ignored patterns
   * @param {Array<string>} patterns - The patterns to ignore
   */
  setIgnoredPatterns(patterns) {
    this.ignoredPatterns = patterns || [];
  }
}

export default ErrorCapturer;
