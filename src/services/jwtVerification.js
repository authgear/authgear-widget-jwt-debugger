import * as jose from 'jose';
import { createSignatureError, ERROR_MESSAGES, handleAsyncOperation } from '../utils/errorHandling';

// Utility: base64url encode ArrayBuffer
function base64urlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Utility: UTF-8 encode string
function utf8Encode(str) {
  return new TextEncoder().encode(str);
}

// Get HMAC algorithm from algorithm string
function getHmacAlgorithm(algorithm) {
  switch (algorithm) {
    case 'HS256': return { name: 'HMAC', hash: { name: 'SHA-256' } };
    case 'HS384': return { name: 'HMAC', hash: { name: 'SHA-384' } };
    case 'HS512': return { name: 'HMAC', hash: { name: 'SHA-512' } };
    default: throw new Error('Unsupported algorithm');
  }
}

// Get secret bytes based on encoding
function getSecretBytes(secret, encoding) {
  if (encoding === 'base64url') {
    return Uint8Array.from(atob(secret.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  }
  return new TextEncoder().encode(secret);
}

// Verify JWT signature
export const verifyJWTSignature = async (decodedJWT, jwtToken, secret, publicKey, jwkEndpoint, secretEncoding, keyType) => {
  if (!decodedJWT || decodedJWT.error) return null;

  return await handleAsyncOperation(async () => {
    const algorithm = decodedJWT.header.alg;
    
    if (algorithm.startsWith('HS')) {
      return await verifySymmetricSignature(decodedJWT, jwtToken, secret, secretEncoding, algorithm);
    } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
      return await verifyAsymmetricSignature(decodedJWT, jwtToken, publicKey, jwkEndpoint, keyType, algorithm);
    }

    return createSignatureError(ERROR_MESSAGES.UNSUPPORTED_ALGORITHM);
  }, 'SIGNATURE_VERIFICATION', ERROR_MESSAGES.ENCODING_FAILED);
};

// Verify symmetric signature (HS256, HS384, HS512)
const verifySymmetricSignature = async (decodedJWT, jwtToken, secret, secretEncoding, algorithm) => {
  if (!secret) return null;

  let secretBytes = getSecretBytes(secret, secretEncoding);

  const [headerB64, payloadB64] = jwtToken.split('.');
  const message = `${headerB64}.${payloadB64}`;

  // Import key
  const algo = getHmacAlgorithm(algorithm);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    secretBytes,
    algo,
    false,
    ['sign', 'verify']
  );

  // Sign
  const signature = await window.crypto.subtle.sign(
    algo,
    cryptoKey,
    utf8Encode(message)
  );

  const computedSignature = base64urlEncode(signature);
  const providedSignature = decodedJWT.signature;

  return {
    valid: computedSignature === providedSignature,
    algorithm: algorithm
  };
};

// Verify asymmetric signature (RS256, RS384, RS512, ES256, etc.)
const verifyAsymmetricSignature = async (decodedJWT, jwtToken, publicKey, jwkEndpoint, keyType, algorithm) => {
  if (keyType === 'pem' && !publicKey) return null;
  if (keyType === 'jwk' && !jwkEndpoint) return null;

  try {
    let key;
    if (keyType === 'pem') {
      key = await jose.importSPKI(publicKey, algorithm);
    } else {
      // Parse JWK JSON from textarea
      let jwk;
      try {
        jwk = JSON.parse(jwkEndpoint);
      } catch (e) {
        return createSignatureError(ERROR_MESSAGES.INVALID_JWK_JSON);
      }
      key = await jose.importJWK(jwk, algorithm);
    }

    const { payload } = await jose.jwtVerify(jwtToken, key);
    return {
      valid: true,
      algorithm: algorithm,
      payload
    };
  } catch (error) {
    return createSignatureError(error.message, error);
  }
}; 