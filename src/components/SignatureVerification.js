import React from 'react';

const SignatureVerification = ({ 
  decodedJWT, 
  secret, 
  setSecret, 
  publicKey, 
  setPublicKey, 
  jwkEndpoint, 
  setJwkEndpoint, 
  secretEncoding, 
  setSecretEncoding, 
  keyType, 
  setKeyType, 
  copyToClipboard 
}) => {
  return (
    <div className="content-panel" style={{ marginTop: '24px' }}>
      <div className="input-header">
        <label className="form-label">JWT Signature Verification</label>
        {decodedJWT && !decodedJWT.error && secret && (
          <span className="status-indicator status-valid">
            ✓ Valid secret
          </span>
        )}
      </div>
      <div className="panel-content">
        {decodedJWT && !decodedJWT.error ? (
          <>
            <p>Algorithm: <strong>{decodedJWT.header.alg}</strong></p>

            {decodedJWT.header.alg?.startsWith('HS') && (
              <>
                <div className="form-group">
                  <label className="form-label">Secret</label>
                  <div className="input-container">
                    <textarea
                      className="form-input"
                      placeholder="Enter a secret to verify the JWT signature"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      rows={4}
                    />
                    <button 
                      className="copy-icon"
                      onClick={() => copyToClipboard(secret, 'secret')}
                      title="Copy Secret"
                    >
                      COPY
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Encoding Format</label>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="utf8"
                        name="encoding"
                        value="utf8"
                        checked={secretEncoding === 'utf8'}
                        onChange={(e) => setSecretEncoding(e.target.value)}
                      />
                      <label htmlFor="utf8">UTF-8</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="base64url"
                        name="encoding"
                        value="base64url"
                        checked={secretEncoding === 'base64url'}
                        onChange={(e) => setSecretEncoding(e.target.value)}
                      />
                      <label htmlFor="base64url">base64url</label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {(decodedJWT.header.alg?.startsWith('RS') || decodedJWT.header.alg?.startsWith('ES')) && (
              <>
                <div className="form-group">
                  <label className="form-label">Key Type</label>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="pem"
                        name="keyType"
                        value="pem"
                        checked={keyType === 'pem'}
                        onChange={(e) => setKeyType(e.target.value)}
                      />
                      <label htmlFor="pem">PEM</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="jwk"
                        name="keyType"
                        value="jwk"
                        checked={keyType === 'jwk'}
                        onChange={(e) => setKeyType(e.target.value)}
                      />
                      <label htmlFor="jwk">JWK</label>
                    </div>
                  </div>
                </div>

                {keyType === 'pem' && (
                  <div className="form-group">
                    <label className="form-label">PEM Public Key</label>
                    <textarea
                      className="form-input"
                      placeholder="Enter PEM public key"
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                {keyType === 'jwk' && (
                  <div className="form-group">
                    <label className="form-label">JWK Endpoint</label>
                    <input
                      type="url"
                      className="form-input"
                      style={{ minHeight: 'auto' }}
                      placeholder="Enter JWK endpoint URL"
                      value={jwkEndpoint}
                      onChange={(e) => setJwkEndpoint(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
            {decodedJWT && decodedJWT.error ? 'Invalid JWT - cannot verify signature' : 'Enter a valid JWT token above to verify its signature'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureVerification; 