// Centralized error handling system with toast notifications

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface AppError {
  code?: string;
  message: string;
  type: 'network' | 'validation' | 'permission' | 'system' | 'api';
  originalError?: any;
}

/**
 * Error type detection and categorization
 */
export const categorizeError = (error: any): AppError => {
  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network request failed')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your internet connection.',
      type: 'network',
      originalError: error
    };
  }

  // Timeout errors
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: 'Request timed out. Please try again.',
      type: 'network',
      originalError: error
    };
  }

  // Permission errors
  if (error.code === 'PERMISSION_DENIED' || error.message?.includes('permission')) {
    return {
      code: 'PERMISSION_DENIED',
      message: 'Permission denied. Please check your app settings.',
      type: 'permission',
      originalError: error
    };
  }

  // API errors with status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: 'Invalid request. Please check your input.',
          type: 'api',
          originalError: error
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Please log in to continue.',
          type: 'api',
          originalError: error
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'You don\'t have permission to perform this action.',
          type: 'api',
          originalError: error
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found.',
          type: 'api',
          originalError: error
        };
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Server error. Please try again later.',
          type: 'api',
          originalError: error
        };
      default:
        return {
          code: 'API_ERROR',
          message: 'An error occurred. Please try again.',
          type: 'api',
          originalError: error
        };
    }
  }

  // Validation errors
  if (error.type === 'validation' || error.name === 'ValidationError') {
    return {
      code: 'VALIDATION_ERROR',
      message: error.message || 'Please check your input and try again.',
      type: 'validation',
      originalError: error
    };
  }

  // Default system error
  return {
    code: 'SYSTEM_ERROR',
    message: error.message || 'An unexpected error occurred.',
    type: 'system',
    originalError: error
  };
};

/**
 * Creates user-friendly toast messages based on error type
 */
export const createErrorToast = (error: AppError): ToastMessage => {
  const id = Date.now().toString();
  
  switch (error.type) {
    case 'network':
      return {
        id,
        type: 'error',
        title: 'Connection Error',
        message: error.message,
        duration: 5000
      };
    
    case 'permission':
      return {
        id,
        type: 'error',
        title: 'Permission Required',
        message: error.message,
        duration: 6000
      };
    
    case 'validation':
      return {
        id,
        type: 'warning',
        title: 'Validation Error',
        message: error.message,
        duration: 4000
      };
    
    case 'api':
      return {
        id,
        type: 'error',
        title: 'API Error',
        message: error.message,
        duration: 5000
      };
    
    default:
      return {
        id,
        type: 'error',
        title: 'Error',
        message: error.message,
        duration: 5000
      };
  }
};

/**
 * Creates success toast messages
 */
export const createSuccessToast = (title: string, message?: string): ToastMessage => {
  return {
    id: Date.now().toString(),
    type: 'success',
    title,
    message,
    duration: 3000
  };
};

/**
 * Creates info toast messages
 */
export const createInfoToast = (title: string, message?: string): ToastMessage => {
  return {
    id: Date.now().toString(),
    type: 'info',
    title,
    message,
    duration: 4000
  };
};

/**
 * Creates warning toast messages
 */
export const createWarningToast = (title: string, message?: string): ToastMessage => {
  return {
    id: Date.now().toString(),
    type: 'warning',
    title,
    message,
    duration: 4000
  };
};

/**
 * Handles API errors and returns appropriate toast message
 */
export const handleApiError = (error: any): ToastMessage => {
  const appError = categorizeError(error);
  
  // Log error for debugging
  console.error('API Error:', {
    code: appError.code,
    message: appError.message,
    type: appError.type,
    originalError: appError.originalError
  });
  
  return createErrorToast(appError);
};

/**
 * Handles form submission errors
 */
export const handleFormError = (error: any, formName?: string): ToastMessage => {
  const appError = categorizeError(error);
  
  // Add context for form errors
  if (appError.type === 'validation') {
    return {
      id: Date.now().toString(),
      type: 'warning',
      title: 'Form Validation Error',
      message: appError.message,
      duration: 4000
    };
  }
  
  return createErrorToast(appError);
};

/**
 * Handles network request errors with retry suggestion
 */
export const handleNetworkError = (error: any): ToastMessage => {
  const appError = categorizeError(error);
  
  if (appError.type === 'network') {
    return {
      id: Date.now().toString(),
      type: 'error',
      title: 'Network Error',
      message: 'Unable to connect. Please check your internet connection and try again.',
      duration: 6000
    };
  }
  
  return createErrorToast(appError);
};

/**
 * Common error messages for specific scenarios
 */
export const ERROR_MESSAGES = {
  // Network related
  OFFLINE: 'You appear to be offline. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_UNREACHABLE: 'Unable to reach the server. Please try again later.',
  
  // Authentication related
  LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You don\'t have permission to access this resource.',
  
  // Form related
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long.',
  
  // Data related
  NO_DATA_FOUND: 'No data found.',
  DATA_LOAD_FAILED: 'Failed to load data. Please try again.',
  DATA_SAVE_FAILED: 'Failed to save data. Please try again.',
  
  // Camera/Permissions
  CAMERA_PERMISSION_DENIED: 'Camera permission is required to scan QR codes.',
  CAMERA_UNAVAILABLE: 'Camera is not available on this device.',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.'
};

/**
 * Gets a predefined error message by code
 */
export const getErrorMessage = (code: keyof typeof ERROR_MESSAGES): string => {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Error boundary fallback message
 */
export const createErrorBoundaryToast = (): ToastMessage => {
  return {
    id: Date.now().toString(),
    type: 'error',
    title: 'Application Error',
    message: 'Something went wrong. The app has been reset to prevent further issues.',
    duration: 8000
  };
};
