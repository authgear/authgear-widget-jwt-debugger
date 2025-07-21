import { createJWTDecodeError, ERROR_MESSAGES } from './utils/errorHandling';

// Format timestamp to human readable date
export const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp * 1000);
    return date.toUTCString();
  } catch (error) {
    return timestamp;
  }
};

// Decode JWT token
export const decodeJWT = (jwtToken) => {
  if (!jwtToken) return null;

  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      return createJWTDecodeError(ERROR_MESSAGES.INVALID_JWT_FORMAT);
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    return {
      header,
      payload,
      signature: parts[2],
      valid: true
    };
  } catch (error) {
    return createJWTDecodeError(ERROR_MESSAGES.INVALID_JWT_DECODE, error);
  }
};

// Check if a claim is a timestamp claim
export const isTimestampClaim = (key) => {
  return ['iat', 'exp', 'nbf'].includes(key);
};

// Custom hook for clipboard copy logic
import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
      return true;
    } catch (error) {
      setCopied(false);
      return false;
    }
  }, [timeout]);

  return [copied, copy];
} 