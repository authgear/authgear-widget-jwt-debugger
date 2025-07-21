import * as jose from 'jose';

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

// Utility: base64url decode to Uint8Array
function base64urlDecode(str) {
  // Pad string to multiple of 4
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Utility: encode string to Uint8Array (UTF-8)
function utf8Encode(str) {
  return new TextEncoder().encode(str);
}

// Utility: get key bytes from secret and encoding
function getSecretBytes(secret, encoding) {
  if (encoding === 'base64url') {
    return base64urlDecode(secret);
  } else {
    return utf8Encode(secret);
  }
}

// Utility: get Web Crypto algorithm name
function getHmacAlgorithm(alg) {
  switch (alg) {
    case 'HS256': return { name: 'HMAC', hash: 'SHA-256' };
    case 'HS384': return { name: 'HMAC', hash: 'SHA-384' };
    case 'HS512': return { name: 'HMAC', hash: 'SHA-512' };
    default: throw new Error('Unsupported algorithm');
  }
}

// Verify JWT signature
export const verifyJWTSignature = async (decodedJWT, jwtToken, secret, publicKey, jwkEndpoint, secretEncoding, keyType) => {
  if (!decodedJWT || decodedJWT.error) return null;

  try {
    const algorithm = decodedJWT.header.alg;
    
    if (algorithm.startsWith('HS')) {
      return await verifySymmetricSignature(decodedJWT, jwtToken, secret, secretEncoding, algorithm);
    } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
      return await verifyAsymmetricSignature(decodedJWT, jwtToken, publicKey, jwkEndpoint, keyType, algorithm);
    }

    return { error: 'Unsupported algorithm' };
  } catch (error) {
    return { error: error.message };
  }
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
      // For JWK, we'd need to fetch from endpoint
      const response = await fetch(jwkEndpoint);
      const jwk = await response.json();
      key = await jose.importJWK(jwk, algorithm);
    }

    const { payload } = await jose.jwtVerify(jwtToken, key);
    return {
      valid: true,
      algorithm: algorithm,
      payload
    };
  } catch (error) {
    return {
      valid: false,
      algorithm: algorithm,
      error: error.message
    };
  }
}; 