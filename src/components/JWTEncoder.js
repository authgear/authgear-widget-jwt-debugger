import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as jose from 'jose';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';

const defaultHeader = `{
  "typ": "JWT",
  "alg": "HS256"
}`;
const defaultPayload = `{
  "sub": "uid_1234567890",
  "name": "Rany",
  "iat": 17356
}`;

const highlightWithPrism = (code) =>
  Prism.highlight(code, Prism.languages.json, 'json');

const JWTEncoder = forwardRef((props, ref) => {
  const [header, setHeader] = useState(defaultHeader);
  const [payload, setPayload] = useState(defaultPayload);
  const [secretOrKey, setSecretOrKey] = useState('');
  const [jwt, setJwt] = useState('');
  const [headerError, setHeaderError] = useState('');
  const [payloadError, setPayloadError] = useState('');
  const [secretError, setSecretError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [encodingFormat, setEncodingFormat] = useState('utf8');
  const [privateKeyFormat, setPrivateKeyFormat] = useState('pem');

  useEffect(() => {
    const encodeJWT = async () => {
      setHeaderError('');
      setPayloadError('');
      setSecretError('');
      setJwt('');
      let headerObj, payloadObj;
      try {
        headerObj = JSON.parse(header);
      } catch (e) {
        setHeaderError('Invalid JSON');
        return;
      }
      try {
        payloadObj = JSON.parse(payload);
      } catch (e) {
        setPayloadError('Invalid JSON');
        return;
      }
      if (!headerObj.alg) {
        setHeaderError('Missing "alg" in header');
        return;
      }
      if (headerObj.alg.startsWith('HS')) {
        if (!secretOrKey) {
          setSecretError('Secret required for HMAC');
          return;
        }
        try {
          let secretBytes;
          if (encodingFormat === 'base64url') {
            secretBytes = Uint8Array.from(atob(secretOrKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
          } else {
            secretBytes = new TextEncoder().encode(secretOrKey);
          }
          const jwt = await new jose.SignJWT(payloadObj)
            .setProtectedHeader(headerObj)
            .sign(secretBytes);
          setJwt(jwt);
        } catch (e) {
          setSecretError('Encoding failed: ' + e.message);
        }
      } else if (headerObj.alg.startsWith('RS') || headerObj.alg.startsWith('ES')) {
        if (!secretOrKey) {
          setSecretError('Private key required');
          return;
        }
        try {
          let privateKey;
          if (privateKeyFormat === 'pem') {
            privateKey = await jose.importPKCS8(secretOrKey, headerObj.alg);
          } else {
            // JWK format
            privateKey = await jose.importJWK(JSON.parse(secretOrKey), headerObj.alg);
          }
          const jwt = await new jose.SignJWT(payloadObj)
            .setProtectedHeader(headerObj)
            .sign(privateKey);
          setJwt(jwt);
        } catch (e) {
          setSecretError('Encoding failed: ' + e.message);
        }
      } else {
        setHeaderError('Unsupported alg');
      }
    };
    encodeJWT();
  }, [header, payload, secretOrKey, encodingFormat, privateKeyFormat]);

  useImperativeHandle(ref, () => ({
    setExampleData: (header, payload, secret) => {
      setHeader(header);
      setPayload(payload);
      setSecretOrKey(secret);
      // If alg is RS*, set privateKeyFormat to 'pem'
      try {
        const alg = JSON.parse(header).alg;
        if (alg && alg.startsWith('RS')) {
          setPrivateKeyFormat('pem');
        }
      } catch {}
    }
  }));

  const handleCopy = () => {
    if (jwt) {
      navigator.clipboard.writeText(jwt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  let algLabel = 'Secret';
  let parsedAlg = 'HS256';
  try {
    parsedAlg = JSON.parse(header).alg || 'HS256';
  } catch {}
  if (parsedAlg && (parsedAlg.startsWith('RS') || parsedAlg.startsWith('ES'))) {
    algLabel = 'Private Key';
  }

  // Validation for header and payload
  let headerStatus = null;
  if (header.trim().length === 0) {
    headerStatus = null;
  } else if (!headerError) {
    headerStatus = <span className="status-indicator status-valid">✓ Valid header</span>;
  } else {
    headerStatus = <span className="status-indicator status-invalid">✗ Invalid header</span>;
  }
  let payloadStatus = null;
  if (payload.trim().length === 0) {
    payloadStatus = null;
  } else if (!payloadError) {
    payloadStatus = <span className="status-indicator status-valid">✓ Valid payload</span>;
  } else {
    payloadStatus = <span className="status-indicator status-invalid">✗ Invalid payload</span>;
  }

  return (
    <div className="main-layout">
      <div className="left-column">
        <div style={{ marginBottom: 24 }}>
          <div className="content-panel">
            <div className="input-header">
              <label className="form-label">Header</label>
              {headerStatus}
            </div>
            <div className="panel-content">
              <div className="input-container" style={{ width: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    border: headerError && header.trim() ? '1.5px solid #e74c3c' : '1.5px solid #ced4da',
                    borderRadius: 16,
                    background: '#fff',
                    minHeight: 120,
                    fontFamily: 'monospace',
                    fontSize: 16,
                    position: 'relative',
                    transition: 'border 0.2s',
                  }}
                >
                  <Editor
                    value={header}
                    onValueChange={setHeader}
                    highlight={highlightWithPrism}
                    padding={16}
                    textareaClassName="jwt-encoder-editor-textarea"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 16,
                      minHeight: 120,
                      outline: 'none',
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      resize: 'none',
                    }}
                    placeholder="Enter header here"
                  />
                  {header.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      color: '#bbb',
                      fontFamily: 'monospace',
                      fontSize: 16,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}>
                      Enter header here
                    </div>
                  )}
                </div>
              </div>
              {headerError && header.trim() && <div className="error-msg">{headerError}</div>}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div className="content-panel">
            <div className="input-header">
              <label className="form-label">Payload</label>
              {payloadStatus}
            </div>
            <div className="panel-content">
              <div className="input-container" style={{ width: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    border: payloadError && payload.trim() ? '1.5px solid #e74c3c' : '1.5px solid #ced4da',
                    borderRadius: 16,
                    background: '#fff',
                    minHeight: 120,
                    fontFamily: 'monospace',
                    fontSize: 16,
                    position: 'relative',
                    transition: 'border 0.2s',
                  }}
                >
                  <Editor
                    value={payload}
                    onValueChange={setPayload}
                    highlight={highlightWithPrism}
                    padding={16}
                    textareaClassName="jwt-encoder-editor-textarea"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 16,
                      minHeight: 120,
                      outline: 'none',
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      resize: 'none',
                    }}
                    placeholder="Enter payload here"
                  />
                  {payload.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      color: '#bbb',
                      fontFamily: 'monospace',
                      fontSize: 16,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}>
                      Enter payload here
                    </div>
                  )}
                </div>
              </div>
              {payloadError && payload.trim() && <div className="error-msg">{payloadError}</div>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
        
          <div className="content-panel">
            <div className="panel-content">
            <div className="input-header">
              <label className="form-label">{`Sign JWT: ${algLabel}`}</label>
            </div>
              <div className="input-container">
                <div
                  style={{
                    width: '100%',
                    border: secretError && secretOrKey.trim() ? '1.5px solid #e74c3c' : '1.5px solid #ced4da',
                    borderRadius: 16,
                    background: '#fff',
                    minHeight: 120,
                    fontFamily: 'monospace',
                    fontSize: 16,
                    position: 'relative',
                    transition: 'border 0.2s',
                  }}
                >
                  <textarea
                    value={secretOrKey}
                    onChange={e => setSecretOrKey(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    placeholder={algLabel === 'Secret' ? 'Enter secret for HMAC algorithms' : 'Enter private key for RSA/ECDSA algorithms'}
                    style={{
                      width: '100%',
                      minHeight: 120,
                      padding: 16,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'monospace',
                      fontSize: 16,
                      resize: 'none',
                    }}
                  />
                  {secretOrKey.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      color: '#bbb',
                      fontFamily: 'monospace',
                      fontSize: 16,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}>
                      {algLabel === 'Secret' ? 'Enter secret for HMAC algorithms' : 'Enter private key for RSA/ECDSA algorithms'}
                    </div>
                  )}
                </div>
              </div>
              {secretError && secretOrKey.trim() && <div className="error-msg">{secretError}</div>}
              {/* Encoding/Key format radio buttons */}
              {algLabel === 'Secret' && (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, gap: 16 }}>
                  <span style={{ fontWeight: 500, marginRight: 8 }}>Encoding Format</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="encodingFormat" value="utf8" checked={encodingFormat === 'utf8'} onChange={() => setEncodingFormat('utf8')} /> UTF-8
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="encodingFormat" value="base64url" checked={encodingFormat === 'base64url'} onChange={() => setEncodingFormat('base64url')} /> base64url
                  </label>
                </div>
              )}
              {algLabel === 'Private Key' && (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, gap: 16 }}>
                  <span style={{ fontWeight: 500, marginRight: 8 }}>Private Key Format</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="privateKeyFormat" value="pem" checked={privateKeyFormat === 'pem'} onChange={() => setPrivateKeyFormat('pem')} /> PEM
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="privateKeyFormat" value="jwk" checked={privateKeyFormat === 'jwk'} onChange={() => setPrivateKeyFormat('jwk')} /> JWK
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="right-column">
        <div className="content-panel" style={{ height: '100%' }}>
          <div className="input-header">
            <label className="form-label">JSON Web Token</label>
          </div>
          <div className="panel-content" style={{ position: 'relative', height: '100%' }}>
            <div className="input-container" style={{ position: 'relative', height: '100%' }}>
              {jwt ? (
                <div className="jwt-color-overlay" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, minHeight: 180, height: '100%', maxHeight: '100%', overflow: 'auto', padding: '12px 48px 12px 16px', fontSize: 16, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.4, zIndex: 1, background: '#f9f9f9', borderRadius: 8 }}>
                  {(() => {
                    const parts = jwt.split('.');
                    return [
                      <span key="header" style={{ color: '#28a745', fontWeight: 500 }}>{parts[0]}</span>,
                      <span key="dot1" style={{ color: '#6c757d' }}>.</span>,
                      <span key="payload" style={{ color: '#495057', fontWeight: 500 }}>{parts[1]}</span>,
                      <span key="dot2" style={{ color: '#6c757d' }}>.</span>,
                      <span key="signature" style={{ color: '#6f42c1', fontWeight: 500 }}>{parts[2]}</span>
                    ];
                  })()}
                </div>
              ) : (
                <textarea
                  className="form-input jwt-token-display"
                  value={''}
                  readOnly
                  rows={10}
                  spellCheck={false}
                  style={{ background: '#f9f9f9', minHeight: 180, height: '100%', maxHeight: '100%' }}
                />
              )}
              <button 
                className="copy-icon"
                onClick={handleCopy}
                disabled={!jwt}
                title="Copy JWT"
                style={{ position: 'absolute', top: 8, right: 8, pointerEvents: 'auto', zIndex: 2 }}
              >
                {copySuccess ? '✓' : 'COPY'}
              </button>
            </div>
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
              }}>
                {'{header}.{payload}.{signature}'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default JWTEncoder; 