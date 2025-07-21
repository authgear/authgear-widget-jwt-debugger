import React, { useState } from 'react';
import * as jose from 'jose';
import { useClipboard } from '../utils';

const JWEEncrypt = () => {
  const [jwt, setJwt] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [keyFormat, setKeyFormat] = useState('pem');
  const [jwe, setJwe] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [error, setError] = useState('');
  const [copied, copy] = useClipboard();

  const handleEncrypt = async () => {
    setError('');
    setJwe('');
    setEncrypting(true);
    try {
      let importedKey;
      if (keyFormat === 'pem') {
        importedKey = await jose.importSPKI(publicKey, 'RSA-OAEP');
      } else {
        importedKey = await jose.importJWK(JSON.parse(publicKey), 'RSA-OAEP');
      }
      const jweResult = await new jose.CompactEncrypt(new TextEncoder().encode(jwt))
        .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
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
              <input type="radio" name="keyFormat" value="pem" checked={keyFormat === 'pem'} onChange={() => setKeyFormat('pem')} /> PEM
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="radio" name="keyFormat" value="jwk" checked={keyFormat === 'jwk'} onChange={() => setKeyFormat('jwk')} /> JWK
            </label>
            <button
              className="btn btn-primary"
              style={{ marginLeft: 16, minWidth: 100 }}
              disabled={!jwt || !publicKey || encrypting}
              onClick={handleEncrypt}
            >
              {encrypting ? 'Encrypting...' : 'Encrypt'}
            </button>
          </div>
          {error && <div className="error-msg" style={{ marginTop: 8 }}>{error}</div>}
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
          {/* Placeholder overlay inside textarea */}
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
          {/* Copy button in top right */}
          <button
            className="copy-icon"
            onClick={() => copy(jwe)}
            disabled={!jwe}
            title="Copy JWE"
            style={{ position: 'absolute', top: 8, right: 8, pointerEvents: 'auto', zIndex: 3 }}
          >
            {copied ? '✓' : 'COPY'}
          </button>
          {/* Clear button below the textarea */}
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