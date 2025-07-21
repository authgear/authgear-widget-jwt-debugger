// Utility functions for key generation and PEM export

// Helper to convert ArrayBuffer to PEM
export function arrayBufferToPem(buffer, type) {
  const b64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${type} KEY-----\n${lines}\n-----END ${type} KEY-----`;
}

// Generate RSA key pair
export async function generateRSAKeyPair() {
  return await window.crypto.subtle.generateKey(
    { 
      name: 'RSASSA-PKCS1-v1_5', 
      modulusLength: 2048, 
      publicExponent: new Uint8Array([1, 0, 1]), 
      hash: { name: 'SHA-256' } 
    },
    true,
    ['sign', 'verify']
  );
}

// Export key pair to PEM format
export async function exportKeyPairToPEM(keyPair) {
  const exportedPriv = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const exportedPub = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  
  return {
    privateKey: arrayBufferToPem(exportedPriv, 'PRIVATE'),
    publicKey: arrayBufferToPem(exportedPub, 'PUBLIC')
  };
}

// Generate RSA key pair and export to PEM
export async function generateAndExportRSAKeyPair() {
  const keyPair = await generateRSAKeyPair();
  const pemKeys = await exportKeyPairToPEM(keyPair);
  return { keyPair, ...pemKeys };
} 