// Crypto polyfill for browser compatibility
// This ensures that the crypto API is available and compatible with the jose library

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Ensure crypto is available
  if (!window.crypto) {
    window.crypto = {};
  }

  // Ensure crypto.subtle is available
  if (!window.crypto.subtle) {
    console.warn('Web Crypto API not available. Some features may not work.');
    window.crypto.subtle = {
      generateKey: () => Promise.reject(new Error('Web Crypto API not available')),
      importKey: () => Promise.reject(new Error('Web Crypto API not available')),
      exportKey: () => Promise.reject(new Error('Web Crypto API not available')),
      sign: () => Promise.reject(new Error('Web Crypto API not available')),
      verify: () => Promise.reject(new Error('Web Crypto API not available')),
    };
  }

  // Add crypto.hash polyfill if it doesn't exist
  if (!window.crypto.hash) {
    window.crypto.hash = async (algorithm, data) => {
      // Use crypto.subtle.digest instead of crypto.hash
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      let hashAlgorithm;
      switch (algorithm) {
        case 'SHA-256':
          hashAlgorithm = 'SHA-256';
          break;
        case 'SHA-384':
          hashAlgorithm = 'SHA-384';
          break;
        case 'SHA-512':
          hashAlgorithm = 'SHA-512';
          break;
        default:
          throw new Error(`Unsupported hash algorithm: ${algorithm}`);
      }
      
      return await window.crypto.subtle.digest(hashAlgorithm, dataBuffer);
    };
  }

  // Add crypto.getRandomValues polyfill if it doesn't exist
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = (array) => {
      // Fallback to Math.random() if crypto.getRandomValues is not available
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
}

// Export for use in other modules
export default window?.crypto; 