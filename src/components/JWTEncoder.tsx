import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as jose from 'jose';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import { useClipboard } from '../utils';
import { ERROR_MESSAGES } from '../utils/errorHandling';
import TimeConversionModal from './TimeConversionModal';

interface JWTEncoderProps {
  onEncryptToken: (jwt: string) => void;
}

const defaultHeader = `{
  "typ": "JWT",
  "alg": "HS256"
}`;
const defaultPayload = `{
  "sub": "uid_1234567890",
  "name": "Rany",
  "iat": 17356
}`;

const highlightWithPrism = (code: string) =>
  Prism.highlight(code, Prism.languages.json, 'json');

const JWTEncoder = forwardRef<{ setExampleData: (header: string, payload: string, secret: string) => void }, JWTEncoderProps>((props, ref) => {
  const { onEncryptToken } = props;
  const [header, setHeader] = useState(defaultHeader);
  const [payload, setPayload] = useState(defaultPayload);
  const [secretOrKey, setSecretOrKey] = useState('');
  const [jwt, setJwt] = useState('');
  const [headerError, setHeaderError] = useState('');
  const [payloadError, setPayloadError] = useState('');
  const [secretError, setSecretError] = useState('');
  const [encodingFormat, setEncodingFormat] = useState('utf8');
  const [privateKeyFormat, setPrivateKeyFormat] = useState('pem');
  const [copied, copy] = useClipboard();

  // Encryption state
  const [encryptionKey, setEncryptionKey] = useState('');
  const [encryptionKeyFormat, setEncryptionKeyFormat] = useState('pem');
  const [encryptionError, setEncryptionError] = useState('');
  const [jwe, setJwe] = useState('');
  const [copiedJwe, copyJwe] = useClipboard();
  const [encrypting, setEncrypting] = useState(false);

  // Time conversion modal state
  const [showTimeModal, setShowTimeModal] = useState(false);

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
        setHeaderError(ERROR_MESSAGES.INVALID_JSON);
        return;
      }
      
      try {
        payloadObj = JSON.parse(payload);
      } catch (e) {
        setPayloadError(ERROR_MESSAGES.INVALID_JSON);
        return;
      }
      
      if (!headerObj.alg) {
        setHeaderError(ERROR_MESSAGES.MISSING_ALGORITHM);
        return;
      }
      
      if (headerObj.alg.startsWith('HS')) {
        if (!secretOrKey) {
          setSecretError(ERROR_MESSAGES.SECRET_REQUIRED);
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
          setSecretError(`${ERROR_MESSAGES.ENCODING_FAILED}: ${(e as Error).message}`);
        }
      } else if (headerObj.alg.startsWith('RS') || headerObj.alg.startsWith('ES')) {
        if (!secretOrKey) {
          setSecretError(ERROR_MESSAGES.PRIVATE_KEY_REQUIRED);
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
          setSecretError(`${ERROR_MESSAGES.ENCODING_FAILED}: ${(e as Error).message}`);
        }
      } else {
        setHeaderError(ERROR_MESSAGES.UNSUPPORTED_ALGORITHM);
      }
    };
    encodeJWT();
  }, [header, payload, secretOrKey, encodingFormat, privateKeyFormat]);

  useImperativeHandle(ref, () => ({
    setExampleData: (header, payload, secret) => {
      setHeader(header);
      setPayload(payload);
      setSecretOrKey(secret);
      // If alg is RS* or ES*, set privateKeyFormat to 'pem'
      try {
        const alg = JSON.parse(header).alg;
        if (alg && (alg.startsWith('RS') || alg.startsWith('ES'))) {
          setPrivateKeyFormat('pem');
        }
      } catch {}
    }
  }));

  // Handle inserting NumericDate into payload
  const handleInsertNumericDate = (numericDate: string) => {
    try {
      // Try to parse the current payload as JSON
      let payloadObj: any = {};
      if (payload.trim()) {
        payloadObj = JSON.parse(payload);
      }
      
      // Add the NumericDate to the payload
      payloadObj.iat = parseInt(numericDate, 10);
      
      // Update the payload with the new value
      setPayload(JSON.stringify(payloadObj, null, 2));
    } catch (error) {
      console.error('Error inserting NumericDate into payload:', error);
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
    <div style={{ width: '100%' }}>
      <div className="main-columns" style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 24 }}>
        <div className="left-column" style={{ flex: 1 }}>
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
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setShowTimeModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0B63E9',
                  textDecoration: 'underline',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 400
                }}
                title="Convert between datetime and NumericDate for JWT payload"
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
                  <rect x="3" y="7" width="10" height="10" rx="2" stroke="#0B63E9" strokeWidth="1.5"/>
                  <path d="M9 7V3H17V11H13" stroke="#0B63E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 3L9 11" stroke="#0B63E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Time Conversion
              </button>
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
        <div className="right-column" style={{ flex: 1 }}>
          <div className="content-panel" style={{ height: '100%' }}>
            <div className="input-header">
              <label className="form-label">JSON Web Token</label>
            </div>
            <div className="panel-content" style={{ position: 'relative', height: 'auto' }}>
              <div className="input-container" style={{ position: 'relative', minHeight: 360, maxHeight: 480, overflowY: 'auto' }}>
                {jwt ? (
                  <div style={{ maxHeight: 480, overflowY: 'auto', width: '100%' }}>
                    <pre className="jwt-color-overlay" style={{ padding: '12px 48px 12px 16px', fontSize: 16, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.4, zIndex: 1, background: '#f9f9f9', borderRadius: 8, boxSizing: 'border-box', margin: 0, minHeight: 360, maxHeight: 480 }}>
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
                    </pre>
                  </div>
                ) : (
                  <textarea
                    className="form-input jwt-token-display"
                    value={''}
                    readOnly
                    rows={10}
                    spellCheck={false}
                    style={{ background: '#f9f9f9', minHeight: 180, height: '100%', width: '100%', resize: 'vertical', overflowY: 'auto' }}
                  />
                )}
                <button 
                  className="copy-icon"
                  onClick={() => typeof copy === 'function' && copy(jwt)}
                  disabled={!jwt}
                  title="Copy JWT"
                  style={{ position: 'absolute', top: 8, right: 8, pointerEvents: 'auto', zIndex: 2 }}
                >
                  {copied ? '✓' : 'COPY'}
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
                  Generated JWT will appear here
                </div>
              )}
              {jwt && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onEncryptToken && onEncryptToken(jwt)}
                    style={{ padding: '4px 12px', fontSize: 12, border: '1px solid #ced4da', background: '#fff', color: '#333' }}
                  >
                    Encrypt this token
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time Conversion Modal */}
      <TimeConversionModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
      />
    </div>
  );
});

export default JWTEncoder; 