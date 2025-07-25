import * as jose from 'jose';
import { generateRSAKeyPair, generateECKeyPair, arrayBufferToPem, exportKeyPairToPEM, exportKeyPairToJWK } from './keyUtils';
import { createError, ERROR_TYPES, ERROR_MESSAGES, handleAsyncOperation } from '../utils/errorHandling';

// Generate example JWT
export const generateExampleJWT = async (selectedAlg, keyPairArg) => {
  return await handleAsyncOperation(async () => {
    const header = {
      alg: selectedAlg,
      typ: 'JWT'
    };

    const payload = {
      sub: 'uid_12345',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
    };

    let jwt;
    let generatedSecret = '';
    let generatedPublicKey = '';
    let generatedPrivateKey = '';
    let keyPair = keyPairArg;
    
    if (selectedAlg.startsWith('HS')) {
      switch (selectedAlg) {
        case 'HS256':
          generatedSecret = 'your-256-bit-secret';
          break;
        case 'HS384':
          generatedSecret = 'your-384-bit-secret';
          break;
        case 'HS512':
          generatedSecret = 'your-512-bit-secret';
          break;
        default:
          generatedSecret = 'your-secret';
      }
      const secret = new TextEncoder().encode(generatedSecret);
      jwt = await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
    } else if (selectedAlg.startsWith('RS')) {
      // Use provided keyPair or generate a new one
      if (!keyPair) {
        keyPair = await generateRSAKeyPair();
      }
      const jwkKeys = await exportKeyPairToJWK(keyPair);
      const privateKey = await jose.importJWK(JSON.parse(jwkKeys.privateKey), selectedAlg);
      jwt = await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);
      // Export keys as JWK
      generatedPrivateKey = jwkKeys.privateKey;
      generatedPublicKey = jwkKeys.publicKey;
    } else if (selectedAlg.startsWith('ES')) {
      // Use provided keyPair or generate a new one
      if (!keyPair) {
        keyPair = await generateECKeyPair(selectedAlg);
      }
      const jwkKeys = await exportKeyPairToJWK(keyPair);
      const privateKey = await jose.importJWK(JSON.parse(jwkKeys.privateKey), selectedAlg);
      jwt = await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);
      // Export keys as JWK
      generatedPrivateKey = jwkKeys.privateKey;
      generatedPublicKey = jwkKeys.publicKey;
    }

    return { jwt, generatedSecret, generatedPrivateKey, generatedPublicKey, keyPair };
  }, ERROR_TYPES.KEY_GENERATION, ERROR_MESSAGES.KEY_GENERATION_FAILED);
};

// Utility to get default header, payload, and secret for a given algorithm
export function getDefaultJWTExampleData(selectedAlg) {
  const header = {
    alg: selectedAlg,
    typ: 'JWT'
  };
  const payload = {
    sub: 'uid_12345',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  };
  let secret = '';
  if (selectedAlg.startsWith('HS')) {
    switch (selectedAlg) {
      case 'HS256': secret = 'your-256-bit-secret'; break;
      case 'HS384': secret = 'your-384-bit-secret'; break;
      case 'HS512': secret = 'your-512-bit-secret'; break;
      default: secret = 'your-secret';
    }
  } else if (selectedAlg.startsWith('RS') || selectedAlg.startsWith('ES')) {
    secret = '...'; // Placeholder, real key generated elsewhere
  }
  return { header, payload, secret };
}

// Generate example JWE with basic JWT and RSA public key
export const generateExampleJWE = async () => {
  return await handleAsyncOperation(async () => {
    // Generate a basic JWT first
    const { jwt } = await generateExampleJWT('HS256');
    
    // Generate RSA key pair for JWE encryption
    const keyPair = await generateRSAKeyPair();
    const pemKeys = await exportKeyPairToPEM(keyPair);
    
    return {
      jwt,
      publicKey: pemKeys.publicKey,
      privateKey: pemKeys.privateKey,
      keyPair
    };
  }, ERROR_TYPES.KEY_GENERATION, ERROR_MESSAGES.KEY_GENERATION_FAILED);
}; 