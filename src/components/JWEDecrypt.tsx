import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as jose from 'jose';
import { useClipboard, decodeJWT } from '../utils';
import JSONRenderer from './JSONRenderer';

interface JWEDecryptProps {
  // No props needed for this component
}

const JWEDecrypt: React.FC<JWEDecryptProps> = () => {
  const [jwe, setJwe] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keyFormat, setKeyFormat] = useState('pem');
  const [jwt, setJwt] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState('');
  const [copied, copy] = useClipboard();
  const [copiedHeader, copyHeader] = useClipboard();
  const [copiedPayload, copyPayload] = useClipboard();
  const [copiedJWEHeader, copyJWEHeader] = useClipboard();
  const lastDecryptInputRef = useRef<string>('');

  // Extract functions from useClipboard tuples
  const copyHeaderFn = typeof copyHeader === 'function' ? copyHeader : () => Promise.resolve(false);
  const copyPayloadFn = typeof copyPayload === 'function' ? copyPayload : () => Promise.resolve(false);
  const copyJWEHeaderFn = typeof copyJWEHeader === 'function' ? copyJWEHeader : () => Promise.resolve(false);
  const copiedHeaderBool = typeof copiedHeader === 'boolean' ? copiedHeader : false;
  const copiedPayloadBool = typeof copiedPayload === 'boolean' ? copiedPayload : false;
  const copiedJWEHeaderBool = typeof copiedJWEHeader === 'boolean' ? copiedJWEHeader : false;

  // Decode the JWT when it changes
  const decodedJWT = decodeJWT(jwt);

  // Decode JWE header (doesn't require private key)
  const decodedJWEHeader = useMemo(() => {
    if (!jwe) return null;
    
    try {
      const parts = jwe.split('.');
      if (parts.length !== 5) {
        return { error: 'Invalid JWE format' };
      }
      
      // The first part is the JWE header (base64url encoded)
      const headerPart = parts[0];
      const decodedHeader = JSON.parse(atob(headerPart.replace(/-/g, '+').replace(/_/g, '/')));
      
      return {
        header: decodedHeader,
        valid: true
      };
    } catch (error) {
      return { error: 'Failed to decode JWE header' };
    }
  }, [jwe]);

  const handleDecrypt = useCallback(async () => {
    setError('');
    setJwt('');
    setDecrypting(true);
    try {
      let importedKey;
      if (keyFormat === 'pem') {
        importedKey = await jose.importPKCS8(privateKey, 'RSA-OAEP');
      } else {
        importedKey = await jose.importJWK(JSON.parse(privateKey), 'RSA-OAEP');
      }
      const { plaintext } = await jose.compactDecrypt(jwe, importedKey);
      setJwt(new TextDecoder().decode(plaintext));
    } catch (e) {
      setError((e as Error)?.message || 'Decryption failed');
    } finally {
      setDecrypting(false);
    }
  }, [jwe, privateKey, keyFormat]);

  // Auto-decrypt when both JWE and private key are available
  useEffect(() => {
    // Clear errors when inputs are empty
    if (!jwe || !privateKey) {
      setError('');
      setJwt('');
      setDecrypting(false);
      lastDecryptInputRef.current = '';
      return;
    }

    // Don't auto-decrypt if there's an existing error and inputs haven't changed
    if (error && lastDecryptInputRef.current === `${jwe}-${privateKey}-${keyFormat}`) {
      return;
    }

    // Auto-decrypt when both JWE and private key are available
    const shouldDecrypt = jwe && privateKey;
    if (shouldDecrypt && !decrypting) {
      // Create a unique key for the current input state
      const currentInputKey = `${jwe}-${privateKey}-${keyFormat}`;
      
      // Only decrypt if we haven't already decrypted for this exact input state
      if (lastDecryptInputRef.current !== currentInputKey) {
        lastDecryptInputRef.current = currentInputKey;
        
        // Add a small delay to prevent rapid successive calls
        const timeoutId = setTimeout(() => {
          handleDecrypt();
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jwe, privateKey, keyFormat, decrypting, handleDecrypt, error]);

  // Add a safety timeout to reset decrypting state if it gets stuck
  useEffect(() => {
    if (decrypting) {
      const timeout = setTimeout(() => {
        setDecrypting(false);
        setError('Decryption timed out. Please try again.');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [decrypting]);

  // Type guards for decoded JWT
  const isValidJWT = (obj: any): obj is { header: any; payload: any; error?: string } => {
    return obj && typeof obj === 'object' && 'header' in obj && 'payload' in obj;
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>JWE Decrypt</h2>

      <div className="main-columns" style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 24 }}>
        <div className="left-column" style={{ flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <div className="content-panel">
              <div className="input-header">
                <label className="form-label">JWE Input</label>
              </div>
              <div className="panel-content">
                <textarea
                  value={jwe}
                  onChange={e => setJwe(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  placeholder="Paste or enter a JWE token here"
                  style={{ width: '100%', minHeight: 200, padding: 16, border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, resize: 'vertical', marginBottom: 0 }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="content-panel">
              <div className="input-header">
                <label className="form-label">Private Key</label>
              </div>
              <div className="panel-content">
                <textarea
                  value={privateKey}
                  onChange={e => setPrivateKey(e.target.value)}
                  rows={4}
                  spellCheck={false}
                  placeholder={keyFormat === 'pem' ? 'Enter private key in PEM format' : 'Enter private key in JWK format'}
                  style={{ width: '100%', minHeight: 80, padding: 16, border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, resize: 'none', marginBottom: 0 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                  <span style={{ fontWeight: 500, marginRight: 8 }}>Key Format</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="jweDecryptKeyFormat" value="pem" checked={keyFormat === 'pem'} onChange={() => setKeyFormat('pem')} /> PEM
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="jweDecryptKeyFormat" value="jwk" checked={keyFormat === 'jwk'} onChange={() => setKeyFormat('jwk')} /> JWK
                  </label>
                </div>
                {error && <div className="error-msg" style={{ marginTop: 8 }}>{error}</div>}
              </div>
            </div>
          </div>


        </div>
        
        <div className="right-column" style={{ flex: 1 }}>
          {/* JWE Header Section */}
          <div className="content-panel" style={{ marginBottom: 24 }}>
            <div className="input-header">
              <label className="form-label">JWE Header</label>
            </div>
            <div className="panel-content">
              <div className="json-container">
                {decodedJWEHeader && decodedJWEHeader.valid ? (
                  <>
                    <button 
                      className={`copy-icon json-copy-icon ${copiedJWEHeaderBool ? 'copied' : ''}`}
                      onClick={() => decodedJWEHeader && decodedJWEHeader.valid && copyJWEHeaderFn(JSON.stringify(decodedJWEHeader.header, null, 2))}
                      title="Copy JWE Header"
                      disabled={!decodedJWEHeader || !decodedJWEHeader.valid}
                    >
                      {copiedJWEHeaderBool ? '✓' : 'COPY'}
                    </button>
                    <JSONRenderer obj={decodedJWEHeader.header} type="header" />
                  </>
                ) : (
                  <div className="json-display json-header" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    {decodedJWEHeader && decodedJWEHeader.error ? decodedJWEHeader.error : 'JWE header will appear here'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decoded JWT Sections */}
          <div className="content-panel" style={{ marginBottom: 24 }}>
            <div className="input-header">
              <label className="form-label">Decoded JWT Header</label>
            </div>
            <div className="panel-content">
              <div className="json-container">
                {decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error ? (
                  <>
                    <button 
                      className={`copy-icon json-copy-icon ${copiedHeaderBool ? 'copied' : ''}`}
                      onClick={() => decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error && copyHeaderFn(JSON.stringify(decodedJWT.header, null, 2))}
                      title="Copy Decoded JWT Header"
                      disabled={!decodedJWT || !isValidJWT(decodedJWT) || !!decodedJWT.error}
                    >
                      {copiedHeaderBool ? '✓' : 'COPY'}
                    </button>
                    <JSONRenderer obj={decodedJWT.header} type="header" />
                  </>
                ) : (
                  <div className="json-display json-header" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    {decodedJWT && isValidJWT(decodedJWT) && decodedJWT.error ? 'Invalid JWT' : 'Decoded JWT header will appear here'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="content-panel" style={{ marginBottom: 24 }}>
            <div className="input-header">
              <label className="form-label">Decoded Payload</label>
            </div>
            <div className="panel-content">
              <div className="json-container">
                {decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error ? (
                  <>
                    <button 
                      className={`copy-icon json-copy-icon ${copiedPayloadBool ? 'copied' : ''}`}
                      onClick={() => decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error && copyPayloadFn(JSON.stringify(decodedJWT.payload, null, 2))}
                      title="Copy Decoded Payload"
                      disabled={!decodedJWT || !isValidJWT(decodedJWT) || !!decodedJWT.error}
                    >
                      {copiedPayloadBool ? '✓' : 'COPY'}
                    </button>
                    <JSONRenderer obj={decodedJWT.payload} type="payload" />
                  </>
                ) : (
                  <div className="json-display json-payload" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    {decodedJWT && isValidJWT(decodedJWT) && decodedJWT.error ? 'Invalid JWT' : 'Decoded payload will appear here'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="content-panel" style={{ height: '100%' }}>
            <div className="input-header">
              <label className="form-label">JWT Output</label>
            </div>
            <div className="panel-content" style={{ position: 'relative', height: 'auto' }}>
              <div className="input-container" style={{ position: 'relative', minHeight: 120, maxHeight: 200, overflowY: 'auto' }}>
                <textarea
                  className="form-input jwt-token-display"
                  value={jwt}
                  readOnly
                  rows={5}
                  spellCheck={false}
                  style={{ background: '#f9f9f9', minHeight: 120, height: '100%', width: '100%', resize: 'vertical', overflowY: 'auto', padding: 16, border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, boxSizing: 'border-box' }}
                />
                {!jwt && !decrypting && (
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
                    Decrypted JWT will appear here
                  </div>
                )}
                {decrypting && (
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
                    Decrypting...
                  </div>
                )}
                <button
                  className="copy-icon"
                  onClick={() => typeof copy === 'function' && copy(jwt)}
                  disabled={!jwt}
                  title="Copy JWT"
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

export default JWEDecrypt; 