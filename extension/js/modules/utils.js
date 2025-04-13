/**
 * Utils Module
 * 
 * Utility functions used across the extension.
 */

/**
 * Format a timestamp into a human-readable string
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted timestamp
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // If the timestamp is from today, just show the time
  const now = new Date();
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  // Otherwise, show the date and time
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} - The truncated string
 */
export function truncateString(str, maxLength = 100) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Get the domain from a URL
 * @param {string} url - The URL
 * @returns {string} - The domain
 */
export function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    // If the URL is invalid, return an empty string
    return '';
  }
}

/**
 * Escape HTML special characters
 * @param {string} html - The HTML string to escape
 * @returns {string} - The escaped HTML string
 */
export function escapeHtml(html) {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Generate a unique ID
 * @returns {string} - A unique ID
 */
export function generateUniqueId() {
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 10000);
  return `id-${timestamp}-${randomPart}`;
}

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} - The cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
  
  return obj;
}

/**
 * Compare two objects for equality
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} - Whether the objects are equal
 */
export function areObjectsEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 === null || obj2 === null || 
      typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => {
    return keys2.includes(key) && areObjectsEqual(obj1[key], obj2[key]);
  });
}

/**
 * Get a simplified stack trace from an error
 * @param {string} stack - The full stack trace
 * @returns {string} - A simplified stack trace
 */
export function simplifyStackTrace(stack) {
  if (!stack) return '';
  
  // Split the stack trace into lines
  const lines = stack.split('\n');
  
  // Remove the first line (error message)
  const stackLines = lines.slice(1);
  
  // Simplify each line
  return stackLines.map(line => {
    // Extract the function name, file, and line number
    const match = line.match(/at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+))?/);
    if (!match) return line.trim();
    
    const [, fnName, file, lineNo, colNo] = match;
    
    // Get the file name without the path
    const fileName = file ? file.split('/').pop() : 'unknown';
    
    return `${fnName ? fnName + ' ' : ''}(${fileName}:${lineNo}:${colNo})`.trim();
  }).join('\n');
}

/**
 * Get the error type from an error object
 * @param {Error} error - The error object
 * @returns {string} - The error type
 */
export function getErrorType(error) {
  if (!error) return 'Unknown';
  
  if (error instanceof Error) {
    return error.constructor.name;
  }
  
  if (typeof error === 'object' && error.type) {
    return error.type;
  }
  
  return 'Unknown';
}

/**
 * Check if two errors are similar
 * @param {Object} error1 - First error
 * @param {Object} error2 - Second error
 * @returns {boolean} - Whether the errors are similar
 */
export function areSimilarErrors(error1, error2) {
  // If the messages are the same, they're similar
  if (error1.message === error2.message) {
    return true;
  }
  
  // If the file and line number are the same, they might be similar
  if (error1.filename === error2.filename && 
      error1.lineno === error2.lineno && 
      error1.colno === error2.colno) {
    return true;
  }
  
  return false;
}
