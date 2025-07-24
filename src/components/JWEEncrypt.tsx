import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as jose from 'jose';
import { useClipboard } from '../utils';
import { generateExampleJWE } from '../services/exampleGenerator';
import GenerateButton from './GenerateButton';

interface JWEEncryptProps {
  initialJwt?: string;
}

const JWEEncrypt: React.FC<JWEEncryptProps> = ({ initialJwt = '' }) => {
  const [jwt, setJwt] = useState(initialJwt);
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [keyFormat, setKeyFormat] = useState('pem');
  const [secretEncoding, setSecretEncoding] = useState('utf-8');
  const [alg, setAlg] = useState('RSA-OAEP');
  const [enc, setEnc] = useState('A256GCM');
  const [jwe, setJwe] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [error, setError] = useState('');
  const [compatError, setCompatError] = useState('');
  const [copied, copy] = useClipboard();
  const lastEncryptInputRef = useRef<string>('');

  // Generate example JWE
  const handleGenerateExample = useCallback(async (algorithm: string) => {
    try {
      const { jwt: exampleJwt, publicKey: examplePublicKey, privateKey: examplePrivateKey } = await generateExampleJWE();
      setJwt(exampleJwt);
      setPublicKey(examplePublicKey);
      setAlg('RSA-OAEP');
      setEnc('A256GCM');
      setKeyFormat('pem');
      
      // Log private key in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Generated Private Key (for debugging):');
        console.log(examplePrivateKey);
        console.log('📋 Generated Public Key:');
        console.log(examplePublicKey);
        console.log('🎫 Generated JWT:');
        console.log(exampleJwt);
      }
    } catch (error) {
      console.error('Failed to generate JWE example:', error);
    }
  }, []);

  // Determine if the selected algorithm is symmetric
  const isSymmetricAlg = alg.startsWith('A') && alg.includes('KW') && !alg.includes('ECDH-ES+');
  


  // Supported algorithms and encryption methods (JWE standard only)
  const supportedAlgs = [
    { value: 'RSA-OAEP', label: 'RSA-OAEP - RSA using Optimal Asymmetric Encryption Padding' },
    { value: 'RSA-OAEP-256', label: 'RSA-OAEP-256 - RSA using OAEP with SHA-256' },
    { value: 'ECDH-ES', label: 'ECDH-ES - Elliptic Curve Diffie-Hellman Ephemeral Static' },
    { value: 'ECDH-ES+A128KW', label: 'ECDH-ES+A128KW - ECDH-ES with AES Key Wrap' },
    { value: 'ECDH-ES+A192KW', label: 'ECDH-ES+A192KW - ECDH-ES with AES Key Wrap' },
    { value: 'ECDH-ES+A256KW', label: 'ECDH-ES+A256KW - ECDH-ES with AES Key Wrap' },
    { value: 'A128KW', label: 'A128KW - AES Key Wrap Algorithm using 128 bit keys' },
    { value: 'A256KW', label: 'A256KW - AES Key Wrap Algorithm using 256 bit keys' }
  ];

  const supportedEnc = [
    { value: 'A128GCM', label: 'A128GCM - AES using 128 bit keys in Galois/Counter Mode' },
    { value: 'A256GCM', label: 'A256GCM - AES using 256 bit keys in Galois/Counter Mode' }
  ];

  const handleEncrypt = useCallback(async () => {
    setError('');
    setJwe('');
    setEncrypting(true);
    try {

      
      let importedKey;
      
      if (isSymmetricAlg) {
        // For symmetric algorithms, use the secret key
        if (!secretKey) {
          throw new Error('Secret key is required for symmetric algorithms');
        }
        // For symmetric algorithms, we need to use the Web Crypto API directly
        let keyData: Uint8Array;
        if (secretEncoding === 'utf-8') {
          keyData = new TextEncoder().encode(secretKey);
        } else {
          // base64url decoding
          keyData = jose.base64url.decode(secretKey);
        }
        importedKey = await crypto.subtle.importKey('raw', keyData, alg, false, ['encrypt']);
      } else {
        // For asymmetric algorithms, use the public key
        if (!publicKey) {
          throw new Error('Public key is required for asymmetric algorithms');
        }
        if (keyFormat === 'pem') {
          importedKey = await jose.importSPKI(publicKey, alg);
        } else {
          importedKey = await jose.importJWK(JSON.parse(publicKey), alg);
        }
      }
      
      const jweResult = await new jose.CompactEncrypt(new TextEncoder().encode(jwt))
        .setProtectedHeader({ alg, enc })
        .encrypt(importedKey);
      setJwe(jweResult);
    } catch (e) {
      setError((e as Error)?.message || 'Encryption failed');
      // Reset the ref on error so we can retry
      lastEncryptInputRef.current = '';
    } finally {
      setEncrypting(false);
    }
  }, [jwt, publicKey, secretKey, alg, enc, keyFormat, isSymmetricAlg, secretEncoding]);

  // Update JWT when initialJwt prop changes
  useEffect(() => {
    if (initialJwt) {
      setJwt(initialJwt);
    }
  }, [initialJwt]);

  // Real-time compatibility check and auto-encryption
  useEffect(() => {
    // Clear errors when inputs are empty
    if (!jwt || (isSymmetricAlg ? !secretKey : !publicKey)) {
      setError('');
      setJwe('');
      setEncrypting(false);
      lastEncryptInputRef.current = '';
      return;
    }

    if (isSymmetricAlg) {
      // For symmetric algorithms, no compatibility check needed
      setCompatError('');
    } else {
      if (!publicKey) {
        setCompatError('');
        return;
      }
      // Only check if publicKey is present for asymmetric algorithms
      const checkCompatibility = async () => {
        try {
          // Try to import the key with the selected alg
          if (keyFormat === 'pem') {
            await jose.importSPKI(publicKey, alg);
          } else {
            await jose.importJWK(JSON.parse(publicKey), alg);
          }
          setCompatError('');
        } catch (e) {
          setCompatError('Selected algorithm is incompatible with the provided public key.');
        }
      };
      checkCompatibility();
    }

    // Auto-encrypt when both JWT and key are available
    const shouldEncrypt = jwt && (isSymmetricAlg ? secretKey : publicKey) && !compatError;
    if (shouldEncrypt && !encrypting) {
      // Create a unique key for the current input state
      const currentInputKey = `${jwt}-${isSymmetricAlg ? secretKey : publicKey}-${alg}-${enc}-${keyFormat}`;
      
      // Only encrypt if we haven't already encrypted for this exact input state
      if (lastEncryptInputRef.current !== currentInputKey) {
        lastEncryptInputRef.current = currentInputKey;
        
        // Add a small delay to prevent rapid successive calls
        const timeoutId = setTimeout(() => {
          handleEncrypt();
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jwt, publicKey, secretKey, alg, enc, keyFormat, isSymmetricAlg, compatError, encrypting, handleEncrypt]);

  // Add a safety timeout to reset encrypting state if it gets stuck
  useEffect(() => {
    if (encrypting) {
      const timeout = setTimeout(() => {
        setEncrypting(false);
        setError('Encryption timed out. Please try again.');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [encrypting]);

  return (
    <div style={{ width: '100%' }}>
      {/* JWE Example dropdown at the top, styled small and left-aligned */}
      <div className="example-section-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: 0, marginBottom: 16, padding: 0 }}>
        <label style={{ fontSize: '12px', color: '#333', marginRight: 6 }}>JWE Example:</label>
        <GenerateButton onGenerate={handleGenerateExample} label="Generate" showAlgorithmDropdown={false} />
      </div>
      
      <div className="main-columns" style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 24 }}>
        <div className="left-column" style={{ flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <div className="content-panel">
              <div className="input-header">
                <label className="form-label">JWT Input</label>
              </div>
              <div className="panel-content">
                <textarea
                  value={jwt}
                  onChange={e => setJwt(e.target.value)}
                  rows={4}
                  spellCheck={false}
                  placeholder="Paste or enter a JWT here"
                  style={{ width: '100%', minHeight: 80, padding: 16, border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, resize: 'none', marginBottom: 0 }}
                />
              </div>
            </div>
          </div>

          <div className="content-panel">
            <div className="input-header">
              <label className="form-label">Encryption Configuration</label>
            </div>
            <div className="panel-content">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Algorithm (alg)
                      <span style={{ position: 'relative', display: 'inline-block' }}>
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                          <circle cx="10" cy="10" r="9" stroke="#007bff" strokeWidth="1.5" fill="#fff"/>
                          <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#007bff" fontFamily="Arial" fontWeight="bold">i</text>
                        </svg>
                        <span style={{
                          visibility: 'hidden',
                          opacity: 0,
                          width: 220,
                          backgroundColor: '#222',
                          color: '#fff',
                          textAlign: 'left',
                          borderRadius: 6,
                          padding: '8px 12px',
                          position: 'absolute',
                          zIndex: 10,
                          bottom: '120%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 12,
                          transition: 'opacity 0.2s',
                          pointerEvents: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }} className="alg-tooltip">
                          The algorithm used to encrypt the Content Encryption Key (CEK).
                        </span>
                      </span>
                    </label>
                    <select
                      value={alg}
                      onChange={(e) => setAlg(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1.5px solid #ced4da',
                        borderRadius: 8,
                        fontSize: 14,
                        background: '#fff'
                      }}
                    >
                      {supportedAlgs.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Encryption Method (enc)
                      <span style={{ position: 'relative', display: 'inline-block' }}>
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                          <circle cx="10" cy="10" r="9" stroke="#007bff" strokeWidth="1.5" fill="#fff"/>
                          <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#007bff" fontFamily="Arial" fontWeight="bold">i</text>
                        </svg>
                        <span style={{
                          visibility: 'hidden',
                          opacity: 0,
                          width: 220,
                          backgroundColor: '#222',
                          color: '#fff',
                          textAlign: 'left',
                          borderRadius: 6,
                          padding: '8px 12px',
                          position: 'absolute',
                          zIndex: 10,
                          bottom: '120%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 12,
                          transition: 'opacity 0.2s',
                          pointerEvents: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }} className="enc-tooltip">
                          The algorithm used to encrypt the actual JWT payload.
                        </span>
                      </span>
                    </label>
                    <select
                      value={enc}
                      onChange={(e) => setEnc(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1.5px solid #ced4da',
                        borderRadius: 8,
                        fontSize: 14,
                        background: '#fff'
                      }}
                    >
                      {supportedEnc.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="form-label">{isSymmetricAlg ? 'Secret Key' : 'Public Key'}</label>
                {isSymmetricAlg ? (
                  <>
                    <textarea
                      value={secretKey}
                      onChange={e => setSecretKey(e.target.value)}
                      rows={4}
                      spellCheck={false}
                      placeholder="Enter secret key"
                      style={{ width: '100%', minHeight: 80, padding: 16, border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, resize: 'none', marginBottom: 0, marginTop: 8 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                      <span style={{ fontWeight: 500, marginRight: 8 }}>Encoding Format</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                        <input type="radio" name="secretEncoding" value="utf-8" checked={secretEncoding === 'utf-8'} onChange={() => setSecretEncoding('utf-8')} /> UTF-8
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                        <input type="radio" name="secretEncoding" value="base64url" checked={secretEncoding === 'base64url'} onChange={() => setSecretEncoding('base64url')} /> Base64URL
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <textarea
                      value={publicKey}
                      onChange={e => setPublicKey(e.target.value)}
                      rows={4}
                      spellCheck={false}
                      placeholder={keyFormat === 'pem' ? 'Enter public key in PEM format' : 'Enter public key in JWK format'}
                      style={{ width: '100%', minHeight: 80, padding: 16, border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, resize: 'none', marginBottom: 0, marginTop: 8 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                      <span style={{ fontWeight: 500, marginRight: 8 }}>Key Format</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                        <input type="radio" name="jweEncryptKeyFormat" value="pem" checked={keyFormat === 'pem'} onChange={() => setKeyFormat('pem')} /> PEM
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                        <input type="radio" name="jweEncryptKeyFormat" value="jwk" checked={keyFormat === 'jwk'} onChange={() => setKeyFormat('jwk')} /> JWK
                      </label>
                    </div>
                  </>
                )}
                {compatError && (
                  <div className="error-msg" style={{ marginTop: 8, color: '#e74c3c' }}>{compatError}</div>
                )}
                {error && <div className="error-msg" style={{ marginTop: 8 }}>{error}</div>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="right-column" style={{ flex: 1 }}>
          <div className="content-panel" style={{ height: '100%' }}>
            <div className="input-header">
              <label className="form-label">JWE Output</label>
            </div>
            <div className="panel-content" style={{ position: 'relative', height: 'auto' }}>
              <div className="input-container" style={{ position: 'relative', minHeight: 360, maxHeight: 480, overflowY: 'auto' }}>
                <textarea
                  className="form-input jwt-token-display"
                  value={jwe}
                  readOnly
                  rows={10}
                  spellCheck={false}
                  style={{ background: '#f9f9f9', minHeight: 360, height: '100%', width: '100%', resize: 'vertical', overflowY: 'auto', padding: '16px 16px 16px 16px', paddingRight: '60px', border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, boxSizing: 'border-box' }}
                />
                {!jwe && !encrypting && (
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    color: '#bbb',
                    fontFamily: 'monospace',
                    fontSize: 16,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    zIndex: 2,
                  }}>
                    Encrypted JWE will appear here
                  </div>
                )}
                {encrypting && (
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    color: '#007bff',
                    fontFamily: 'monospace',
                    fontSize: 16,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    zIndex: 2,
                  }}>
                    Encrypting...
                  </div>
                )}
                <button
                  className="copy-icon"
                  onClick={() => typeof copy === 'function' && copy(jwe)}
                  disabled={!jwe}
                  title="Copy JWE"
                  style={{ position: 'absolute', top: 8, right: 8, pointerEvents: 'auto', zIndex: 3 }}
                >
                  {copied ? '✓' : 'COPY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JWEEncrypt; 