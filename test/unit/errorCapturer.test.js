/**
 * Unit tests for the ErrorCapturer module
 */

import ErrorCapturer from '../../extension/js/modules/errorCapturer';

// Mock window event listeners
const mockAddEventListener = jest.fn();
const originalAddEventListener = window.addEventListener;

describe('ErrorCapturer', () => {
  let errorCapturer;
  let mockErrorHandler;
  
  beforeEach(() => {
    // Setup mocks
    window.addEventListener = mockAddEventListener;
    mockErrorHandler = jest.fn();
    
    // Create a new instance for each test
    errorCapturer = new ErrorCapturer({
      globalEnabled: true,
      captureConsoleErrors: false,
      ignoredPatterns: []
    });
    
    // Register the mock error handler
    errorCapturer.registerErrorHandler(mockErrorHandler);
  });
  
  afterEach(() => {
    // Restore original functions
    window.addEventListener = originalAddEventListener;
    jest.clearAllMocks();
  });
  
  test('should initialize with correct settings', () => {
    expect(errorCapturer.isEnabled).toBe(true);
    expect(errorCapturer.ignoredPatterns).toEqual([]);
  });
  
  test('should set up error listeners on init', () => {
    errorCapturer.init();
    
    // Should set up listeners for errors and unhandled rejections
    expect(mockAddEventListener).toHaveBeenCalledTimes(2);
    expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function), true);
    expect(mockAddEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function), true);
  });
  
  test('should handle runtime errors', () => {
    const mockError = new Error('Test error');
    const mockEvent = {
      message: 'Test error',
      filename: 'test.js',
      lineno: 10,
      colno: 5,
      error: mockError
    };
    
    errorCapturer.handleRuntimeError(mockEvent);
    
    // Should call the error handler with the error object
    expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    const errorArg = mockErrorHandler.mock.calls[0][0];
    expect(errorArg.type).toBe('runtime');
    expect(errorArg.message).toBe('Test error');
    expect(errorArg.filename).toBe('test.js');
    expect(errorArg.lineno).toBe(10);
    expect(errorArg.colno).toBe(5);
    expect(errorArg.error).toBe(mockError);
  });
  
  test('should handle promise rejections', () => {
    const mockReason = new Error('Promise rejected');
    const mockEvent = {
      reason: mockReason,
      target: window
    };
    
    errorCapturer.handlePromiseRejection(mockEvent);
    
    // Should call the error handler with the error object
    expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    const errorArg = mockErrorHandler.mock.calls[0][0];
    expect(errorArg.type).toBe('promise');
    expect(errorArg.message).toBe('Promise rejected');
    expect(errorArg.error).toBe(mockReason);
  });
  
  test('should not handle errors when disabled', () => {
    errorCapturer.setEnabled(false);
    
    const mockEvent = {
      message: 'Test error',
      filename: 'test.js',
      lineno: 10,
      colno: 5,
      error: new Error('Test error')
    };
    
    errorCapturer.handleRuntimeError(mockEvent);
    
    // Should not call the error handler
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });
  
  test('should ignore errors matching ignored patterns', () => {
    errorCapturer.setIgnoredPatterns(['ignored error']);
    
    const mockEvent = {
      message: 'This is an ignored error message',
      filename: 'test.js',
      lineno: 10,
      colno: 5,
      error: new Error('This is an ignored error message')
    };
    
    errorCapturer.handleRuntimeError(mockEvent);
    
    // Should not call the error handler
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });
  
  test('should handle regex patterns in ignored patterns', () => {
    errorCapturer.setIgnoredPatterns(['^Error: \\d+$']);
    
    // This should be ignored
    const mockEvent1 = {
      message: 'Error: 123',
      filename: 'test.js',
      lineno: 10,
      colno: 5,
      error: new Error('Error: 123')
    };
    
    // This should not be ignored
    const mockEvent2 = {
      message: 'Error: abc',
      filename: 'test.js',
      lineno: 10,
      colno: 5,
      error: new Error('Error: abc')
    };
    
    errorCapturer.handleRuntimeError(mockEvent1);
    errorCapturer.handleRuntimeError(mockEvent2);
    
    // Should only call the error handler for the second event
    expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    const errorArg = mockErrorHandler.mock.calls[0][0];
    expect(errorArg.message).toBe('Error: abc');
  });
  
  test('should register and unregister error handlers', () => {
    const anotherHandler = jest.fn();
    
    // Register another handler
    errorCapturer.registerErrorHandler(anotherHandler);
    
    const mockEvent = {
      message: 'Test error',
      filename: 'test.js',
      lineno: 10,
      colno: 5,
      error: new Error('Test error')
    };
    
    errorCapturer.handleRuntimeError(mockEvent);
    
    // Both handlers should be called
    expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    expect(anotherHandler).toHaveBeenCalledTimes(1);
    
    // Unregister the first handler
    errorCapturer.unregisterErrorHandler(mockErrorHandler);
    
    // Clear the mocks
    jest.clearAllMocks();
    
    errorCapturer.handleRuntimeError(mockEvent);
    
    // Only the second handler should be called
    expect(mockErrorHandler).not.toHaveBeenCalled();
    expect(anotherHandler).toHaveBeenCalledTimes(1);
  });
});
