import * as jose from 'jose';

// Helper to convert ArrayBuffer to PEM
function arrayBufferToPem(buffer, type) {
  const b64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${type} KEY-----\n${lines}\n-----END ${type} KEY-----`;
}

// Generate example JWT
export const generateExampleJWT = async (selectedAlg, keyPairArg) => {
  try {
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
        keyPair = await window.crypto.subtle.generateKey(
          { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: { name: 'SHA-256' } },
          true,
          ['sign', 'verify']
        );
      }
      const privateKeyPEM = arrayBufferToPem(await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey), 'PRIVATE');
      const privateKey = await jose.importPKCS8(privateKeyPEM, selectedAlg);
      jwt = await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);
      // Export keys as PEM
      const exportedPriv = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const exportedPub = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      generatedPrivateKey = arrayBufferToPem(exportedPriv, 'PRIVATE');
      generatedPublicKey = arrayBufferToPem(exportedPub, 'PUBLIC');
    }

    return { jwt, generatedSecret, generatedPrivateKey, generatedPublicKey, keyPair };
  } catch (error) {
    console.error('Error generating example:', error);
    return { jwt: '', generatedSecret: '', generatedPrivateKey: '', generatedPublicKey: '', keyPair: null };
  }
}; 