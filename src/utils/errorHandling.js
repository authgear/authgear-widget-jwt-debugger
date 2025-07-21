// Centralized error handling utilities

// Error types
export const ERROR_TYPES = {
  JWT_DECODE: 'JWT_DECODE',
  JWT_ENCODE: 'JWT_ENCODE',
  SIGNATURE_VERIFICATION: 'SIGNATURE_VERIFICATION',
  KEY_GENERATION: 'KEY_GENERATION',
  VALIDATION: 'VALIDATION'
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_JWT_FORMAT: 'Invalid JWT format - JWT should have 3 parts separated by dots',
  INVALID_JWT_DECODE: 'Invalid JWT format - Unable to decode',
  INVALID_JSON: 'Invalid JSON',
  MISSING_ALGORITHM: 'Missing "alg" in header',
  UNSUPPORTED_ALGORITHM: 'Unsupported algorithm',
  SECRET_REQUIRED: 'Secret required for HMAC',
  PRIVATE_KEY_REQUIRED: 'Private key required',
  INVALID_JWK_JSON: 'Invalid JWK JSON',
  ENCODING_FAILED: 'Encoding failed',
  KEY_GENERATION_FAILED: 'Key generation failed'
};

// Create standardized error objects
export function createError(type, message, details = null) {
  return {
    type,
    message,
    details,
    timestamp: new Date().toISOString()
  };
}

// Create JWT decode errors
export function createJWTDecodeError(message, details = null) {
  return createError(ERROR_TYPES.JWT_DECODE, message, details);
}

// Create JWT encode errors
export function createJWTEncodeError(message, details = null) {
  return createError(ERROR_TYPES.JWT_ENCODE, message, details);
}

// Create signature verification errors
export function createSignatureError(message, details = null) {
  return createError(ERROR_TYPES.SIGNATURE_VERIFICATION, message, details);
}

// Create validation errors
export function createValidationError(message, details = null) {
  return createError(ERROR_TYPES.VALIDATION, message, details);
}

// Check if an object is an error
export function isError(obj) {
  return obj && typeof obj === 'object' && 'error' in obj;
}

// Check if an object is a standardized error
export function isStandardError(obj) {
  return obj && typeof obj === 'object' && 'type' in obj && 'message' in obj;
}

// Get error message from various error formats
export function getErrorMessage(error) {
  if (!error) return '';
  
  if (typeof error === 'string') return error;
  
  if (isStandardError(error)) return error.message;
  
  if (isError(error)) return error.error;
  
  if (error.message) return error.message;
  
  return 'An unknown error occurred';
}

// Handle async operations with standardized error handling
export async function handleAsyncOperation(operation, errorType, defaultMessage) {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${errorType}:`, error);
    const message = error.message || defaultMessage;
    return createError(errorType, message, error);
  }
} 