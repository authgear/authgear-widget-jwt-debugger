import React, { useState, useEffect } from 'react';
import * as jose from 'jose';
import { useClipboard } from '../utils';

interface JWEEncryptProps {
  initialJwt?: string;
}

const JWEEncrypt: React.FC<JWEEncryptProps> = ({ initialJwt = '' }) => {
  const [jwt, setJwt] = useState(initialJwt);
  const [publicKey, setPublicKey] = useState('');
  const [keyFormat, setKeyFormat] = useState('pem');
  const [alg, setAlg] = useState('RSA-OAEP');
  const [enc, setEnc] = useState('A256GCM');
  const [jwe, setJwe] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [error, setError] = useState('');
  const [compatError, setCompatError] = useState('');
  const [copied, copy] = useClipboard();

  // Supported algorithms and encryption methods
  const supportedAlgs = [
    { value: 'RSA-OAEP', label: 'RSA-OAEP' },
    { value: 'RSA-OAEP-256', label: 'RSA-OAEP-256' },
    { value: 'RSA1_5', label: 'RSA1_5' },
    { value: 'A128KW', label: 'A128KW' },
    { value: 'A192KW', label: 'A192KW' },
    { value: 'A256KW', label: 'A256KW' },
    { value: 'dir', label: 'Direct' },
    { value: 'ECDH-ES', label: 'ECDH-ES' },
    { value: 'ECDH-ES+A128KW', label: 'ECDH-ES+A128KW' },
    { value: 'ECDH-ES+A192KW', label: 'ECDH-ES+A192KW' },
    { value: 'ECDH-ES+A256KW', label: 'ECDH-ES+A256KW' },
    { value: 'PBES2-HS256+A128KW', label: 'PBES2-HS256+A128KW' },
    { value: 'PBES2-HS384+A192KW', label: 'PBES2-HS384+A192KW' },
    { value: 'PBES2-HS512+A256KW', label: 'PBES2-HS512+A256KW' }
  ];

  const supportedEnc = [
    { value: 'A128CBC-HS256', label: 'A128CBC-HS256' },
    { value: 'A192CBC-HS384', label: 'A192CBC-HS384' },
    { value: 'A256CBC-HS512', label: 'A256CBC-HS512' },
    { value: 'A128GCM', label: 'A128GCM' },
    { value: 'A192GCM', label: 'A192GCM' },
    { value: 'A256GCM', label: 'A256GCM' }
  ];

  // Update JWT when initialJwt prop changes
  useEffect(() => {
    if (initialJwt) {
      setJwt(initialJwt);
    }
  }, [initialJwt]);

  // Real-time compatibility check for publicKey and alg
  useEffect(() => {
    if (!publicKey) {
      setCompatError('');
      return;
    }
    // Only check if publicKey is present
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
  }, [publicKey, alg, keyFormat]);

  const handleEncrypt = async () => {
    setError('');
    setJwe('');
    setEncrypting(true);
    try {
      let importedKey;
      if (keyFormat === 'pem') {
        importedKey = await jose.importSPKI(publicKey, alg);
      } else {
        importedKey = await jose.importJWK(JSON.parse(publicKey), alg);
      }
      const jweResult = await new jose.CompactEncrypt(new TextEncoder().encode(jwt))
        .setProtectedHeader({ alg, enc })
        .encrypt(importedKey);
      setJwe(jweResult);
    } catch (e) {
      setError(e.message || 'Encryption failed');
    } finally {
      setEncrypting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>JWE Encrypt</h2>
      
      <div className="content-panel" style={{ marginBottom: 32 }}>
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

      <div className="content-panel" style={{ marginBottom: 32 }}>
        <div className="input-header">
          <label className="form-label">Public Key</label>
        </div>
        <div className="panel-content">
          <textarea
            value={publicKey}
            onChange={e => setPublicKey(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder={keyFormat === 'pem' ? 'Enter public key in PEM format' : 'Enter public key in JWK format'}
            style={{ width: '100%', minHeight: 80, padding: 16, border: '1.5px solid #ced4da', borderRadius: 16, fontFamily: 'monospace', fontSize: 16, resize: 'none', marginBottom: 0 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
            <span style={{ fontWeight: 500, marginRight: 8 }}>Key Format</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="radio" name="jweEncryptKeyFormat" value="pem" checked={keyFormat === 'pem'} onChange={() => setKeyFormat('pem')} /> PEM
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="radio" name="jweEncryptKeyFormat" value="jwk" checked={keyFormat === 'jwk'} onChange={() => setKeyFormat('jwk')} /> JWK
            </label>
          </div>
          {compatError && (
            <div className="error-msg" style={{ marginTop: 8, color: '#e74c3c' }}>{compatError}</div>
          )}
          {error && <div className="error-msg" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      <div className="content-panel" style={{ marginBottom: 32 }}>
        <div className="input-header">
          <label className="form-label">Encryption Configuration</label>
        </div>
        <div className="panel-content">
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
        <div style={{ marginTop: 16, textAlign: 'left' }}>
          <button
            className="btn btn-primary"
            style={{ minWidth: 120, padding: '10px 20px', fontSize: 16 }}
            disabled={!jwt || !publicKey || encrypting}
            onClick={handleEncrypt}
          >
            {encrypting ? 'Encrypting...' : 'Encrypt'}
          </button>
        </div>
      </div>

      <div className="content-panel">
        <div className="input-header">
          <label className="form-label">JWE Output</label>
        </div>
        <div className="panel-content" style={{ width: '100%', position: 'relative' }}>
          <textarea
            className="form-input jwt-token-display"
            value={jwe}
            readOnly
            rows={5}
            spellCheck={false}
            style={{ background: '#f9f9f9', minHeight: 100, width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}
          />
          {!jwe && (
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
          <button
            className="copy-icon"
            onClick={() => copy(jwe)}
            disabled={!jwe}
            title="Copy JWE"
            style={{ position: 'absolute', top: 8, right: 8, pointerEvents: 'auto', zIndex: 3 }}
          >
            {copied ? '✓' : 'COPY'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setJwe('')}
            disabled={!jwe}
            title="Clear JWE"
            style={{ marginTop: 8, fontSize: 12, padding: '2px 10px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#333', cursor: 'pointer', display: 'block' }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default JWEEncrypt; 