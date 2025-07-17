import * as jose from 'jose';
import CryptoJS from 'crypto-js';

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
  
  let secretBytes;
  if (secretEncoding === 'base64url') {
    secretBytes = CryptoJS.enc.Base64url.parse(secret);
  } else {
    secretBytes = CryptoJS.enc.Utf8.parse(secret);
  }

  const [headerB64, payloadB64] = jwtToken.split('.');
  const message = `${headerB64}.${payloadB64}`;
  
  let hash;
  switch (algorithm) {
    case 'HS256':
      hash = CryptoJS.HmacSHA256(message, secretBytes);
      break;
    case 'HS384':
      hash = CryptoJS.HmacSHA384(message, secretBytes);
      break;
    case 'HS512':
      hash = CryptoJS.HmacSHA512(message, secretBytes);
      break;
    default:
      return { error: 'Unsupported algorithm' };
  }

  const computedSignature = CryptoJS.enc.Base64url.stringify(hash);
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