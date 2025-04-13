/**
 * SourceMapper Module
 * 
 * Responsible for fetching and parsing source maps and translating
 * stack traces from minified/transpiled code back to the original source.
 */

import { SourceMapConsumer } from 'source-map';

class SourceMapper {
  constructor(settings = {}) {
    this.settings = settings;
    this.sourceMapCache = new Map();
    this.fetchTimeout = settings.sourcemapTimeout || 5000;
    this.fetchRetries = settings.sourcemapRetries || 2;
  }

  /**
   * Initialize the source mapper with the provided settings
   * @param {Object} settings - The settings object
   */
  init(settings) {
    if (settings) {
      this.settings = settings;
      this.fetchTimeout = settings.sourcemapTimeout || 5000;
      this.fetchRetries = settings.sourcemapRetries || 2;
    }
  }

  /**
   * Process an error object to translate its stack trace using source maps
   * @param {Object} error - The error object to process
   * @returns {Promise<Object>} - The processed error object with source-mapped stack trace
   */
  async processError(error) {
    if (!error || !error.stack) {
      return error;
    }

    try {
      const stackLines = error.stack.split('\n');
      const processedLines = [];

      for (const line of stackLines) {
        const mappedLine = await this.processStackLine(line);
        processedLines.push(mappedLine);
      }

      // Create a new error object with the processed stack
      const processedError = { ...error };
      processedError.originalStack = error.stack;
      processedError.stack = processedLines.join('\n');

      // Update filename and line numbers if we have them from the first stack frame
      const firstFrameMatch = processedLines[1]?.match(/at\s+(?:\w+\s+)?\(?([^:]+):(\d+):(\d+)/);
      if (firstFrameMatch) {
        processedError.mappedFilename = firstFrameMatch[1];
        processedError.mappedLineno = parseInt(firstFrameMatch[2], 10);
        processedError.mappedColno = parseInt(firstFrameMatch[3], 10);
      }

      return processedError;
    } catch (e) {
      console.error('Error processing stack trace:', e);
      return error;
    }
  }

  /**
   * Process a single line from a stack trace
   * @param {string} line - The stack trace line
   * @returns {Promise<string>} - The processed line with source map information
   */
  async processStackLine(line) {
    // Match the filename, line, and column from the stack trace line
    const match = line.match(/at\s+(?:\w+\s+)?\(?([^:]+):(\d+):(\d+)/);
    if (!match) {
      return line;
    }

    const [, filename, lineNo, colNo] = match;
    
    // Try to get the source map for this file
    try {
      const sourceMapData = await this.getSourceMap(filename);
      if (!sourceMapData) {
        return line;
      }

      // Create a source map consumer
      const consumer = await new SourceMapConsumer(sourceMapData);
      
      // Get the original position
      const originalPosition = consumer.originalPositionFor({
        line: parseInt(lineNo, 10),
        column: parseInt(colNo, 10)
      });
      
      consumer.destroy();
      
      if (originalPosition.source) {
        // Replace the minified position with the original position
        const originalSource = originalPosition.source.replace(/^webpack:\/\/\//, '');
        const originalLine = originalPosition.line || lineNo;
        const originalColumn = originalPosition.column || colNo;
        const originalName = originalPosition.name ? ` (${originalPosition.name})` : '';
        
        return line.replace(
          `${filename}:${lineNo}:${colNo}`,
          `${originalSource}:${originalLine}:${originalColumn}${originalName}`
        );
      }
    } catch (e) {
      console.error('Error mapping stack trace line:', e);
    }
    
    return line;
  }

  /**
   * Get the source map for a JavaScript file
   * @param {string} jsUrl - The URL of the JavaScript file
   * @returns {Promise<Object|null>} - The source map data or null if not found
   */
  async getSourceMap(jsUrl) {
    // Check if we already have this source map in cache
    if (this.sourceMapCache.has(jsUrl)) {
      return this.sourceMapCache.get(jsUrl);
    }
    
    // Try to fetch the source map
    try {
      // First, try to fetch the JavaScript file to find the sourceMappingURL
      const jsContent = await this.fetchWithRetry(jsUrl);
      
      // Extract the sourceMappingURL comment
      const sourceMappingURLMatch = jsContent.match(/\/\/[#@]\s*sourceMappingURL=([^\s]+)/);
      if (!sourceMappingURLMatch) {
        this.sourceMapCache.set(jsUrl, null);
        return null;
      }
      
      const sourceMappingURL = sourceMappingURLMatch[1];
      let sourceMapUrl;
      
      // Handle different types of sourceMappingURL
      if (sourceMappingURL.startsWith('data:application/json;base64,')) {
        // Inline source map
        const base64Data = sourceMappingURL.replace('data:application/json;base64,', '');
        const jsonString = atob(base64Data);
        const sourceMapData = JSON.parse(jsonString);
        this.sourceMapCache.set(jsUrl, sourceMapData);
        return sourceMapData;
      } else if (sourceMappingURL.startsWith('http')) {
        // Absolute URL
        sourceMapUrl = sourceMappingURL;
      } else {
        // Relative URL
        const jsUrlObj = new URL(jsUrl);
        const jsPath = jsUrlObj.pathname.substring(0, jsUrlObj.pathname.lastIndexOf('/') + 1);
        sourceMapUrl = `${jsUrlObj.origin}${jsPath}${sourceMappingURL}`;
      }
      
      // Fetch the source map
      const sourceMapContent = await this.fetchWithRetry(sourceMapUrl);
      const sourceMapData = JSON.parse(sourceMapContent);
      
      // Cache the source map
      this.sourceMapCache.set(jsUrl, sourceMapData);
      
      return sourceMapData;
    } catch (e) {
      console.error('Error fetching source map:', e);
      this.sourceMapCache.set(jsUrl, null);
      return null;
    }
  }

  /**
   * Fetch a URL with retry logic
   * @param {string} url - The URL to fetch
   * @returns {Promise<string>} - The response text
   */
  async fetchWithRetry(url) {
    let retries = this.fetchRetries;
    let lastError;
    
    while (retries >= 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.fetchTimeout);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.text();
      } catch (e) {
        lastError = e;
        retries--;
        
        if (retries < 0) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    throw lastError;
  }

  /**
   * Clear the source map cache
   */
  clearCache() {
    this.sourceMapCache.clear();
  }
}

export default SourceMapper;
