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

  // Debug logging in development environment
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.log('🔍 [JWT Debug] Starting JWT decode for token:', jwtToken.substring(0, 50) + '...');
  }

  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      if (isDev) {
        console.error('❌ [JWT Debug] Invalid JWT format - expected 3 parts, got:', parts.length);
        console.error('❌ [JWT Debug] Token parts:', parts);
      }
      return createJWTDecodeError(ERROR_MESSAGES.INVALID_JWT_FORMAT);
    }

    if (isDev) {
      console.log('✅ [JWT Debug] JWT has correct format (3 parts)');
    }

    // Decode header
    let header;
    try {
      const headerBase64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
      const headerJson = atob(headerBase64);
      header = JSON.parse(headerJson);
      
      if (isDev) {
        console.log('📋 [JWT Debug] Header decoded successfully:', header);
      }
    } catch (headerError) {
      if (isDev) {
        console.error('❌ [JWT Debug] Header decode failed:', headerError);
        console.error('❌ [JWT Debug] Header part:', parts[0]);
      }
      throw headerError;
    }

    // Decode payload
    let payload;
    try {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64);
      payload = JSON.parse(payloadJson);
      
      if (isDev) {
        console.log('📦 [JWT Debug] Payload decoded successfully:', payload);
      }
    } catch (payloadError) {
      if (isDev) {
        console.error('❌ [JWT Debug] Payload decode failed:', payloadError);
        console.error('❌ [JWT Debug] Payload part:', parts[1]);
      }
      throw payloadError;
    }

    const result = {
      header,
      payload,
      signature: parts[2],
      valid: true
    };

    if (isDev) {
      console.log('🎉 [JWT Debug] JWT decode completed successfully');
      console.log('🎉 [JWT Debug] Final result:', result);
    }

    return result;
  } catch (error) {
    if (isDev) {
      console.error('💥 [JWT Debug] JWT decode failed with error:', error);
      console.error('💥 [JWT Debug] Error message:', error.message);
      console.error('💥 [JWT Debug] Error stack:', error.stack);
    }
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
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      }
    } catch (error) {
      // Modern API failed, try fallback method
    }

    // Fallback method for iframes and older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      }
    } catch (error) {
      console.warn('Copy failed:', error);
    }

    setCopied(false);
    return false;
  }, [timeout]);

  return [copied, copy];
} 