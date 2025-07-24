import React, { useState } from 'react';
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

  // Extract functions from useClipboard tuples
  const copyHeaderFn = typeof copyHeader === 'function' ? copyHeader : () => Promise.resolve(false);
  const copyPayloadFn = typeof copyPayload === 'function' ? copyPayload : () => Promise.resolve(false);
  const copiedHeaderBool = typeof copiedHeader === 'boolean' ? copiedHeader : false;
  const copiedPayloadBool = typeof copiedPayload === 'boolean' ? copiedPayload : false;

  // Decode the JWT when it changes
  const decodedJWT = decodeJWT(jwt);

  const handleDecrypt = async () => {
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
  };

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

          <div className="content-panel" style={{ marginBottom: 0 }}>
            <div className="panel-content">
              <button
                className="btn btn-primary"
                style={{ minWidth: 120, padding: '10px 20px', fontSize: 16 }}
                disabled={!jwe || !privateKey || decrypting}
                onClick={handleDecrypt}
              >
                {decrypting ? 'Decrypting...' : 'Decrypt'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="right-column" style={{ flex: 1 }}>
          {/* Decoded JWT Sections */}
          {jwt && (
            <>
              <div className="content-panel" style={{ marginBottom: 24 }}>
                <div className="input-header">
                  <label className="form-label">Decoded Header</label>
                </div>
                <div className="panel-content">
                  <div className="json-container">
                    {decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error ? (
                      <>
                        <button 
                          className={`copy-icon json-copy-icon ${copiedHeaderBool ? 'copied' : ''}`}
                          onClick={() => decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error && copyHeaderFn(JSON.stringify(decodedJWT.header, null, 2))}
                          title="Copy Decoded Header"
                          disabled={!decodedJWT || !isValidJWT(decodedJWT) || !!decodedJWT.error}
                        >
                          {copiedHeaderBool ? '✓' : 'COPY'}
                        </button>
                        <JSONRenderer obj={decodedJWT.header} type="header" />
                      </>
                    ) : (
                      <div className="json-display json-header" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        {decodedJWT && isValidJWT(decodedJWT) && decodedJWT.error ? 'Invalid JWT' : 'Decoded header will appear here'}
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
            </>
          )}

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
                {!jwt && (
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