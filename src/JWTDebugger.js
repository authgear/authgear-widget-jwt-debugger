import React, { useState, useCallback, useMemo } from 'react';
import * as jose from 'jose';
import CryptoJS from 'crypto-js';

const JWTDebugger = () => {
  const [activeTab, setActiveTab] = useState('decoder');
  const [jwtToken, setJwtToken] = useState('');
  const [secret, setSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [jwkEndpoint, setJwkEndpoint] = useState('');
  const [secretEncoding, setSecretEncoding] = useState('utf8');
  const [keyType, setKeyType] = useState('pem');
  const [selectedAlg, setSelectedAlg] = useState('HS256');
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showExampleDropdown, setShowExampleDropdown] = useState(false);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExampleDropdown && !event.target.closest('.example-section-header')) {
        setShowExampleDropdown(false);
      }
    };

    if (showExampleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExampleDropdown]);

  // Standard claim descriptions
  const claimDescriptions = {
    alg: 'Signature or encryption algorithm',
    typ: 'Token type',
    cty: 'Content Type',
    sub: 'Subject - Identifies the user of this JWT',
    iss: 'Issuer - Identifies of the issuer of the JWT',
    aud: 'Audience - Identifies the recipients that the JWT is intended for',
    exp: 'Expiration time - The expiration time on or after which the JWT MUST NOT be accepted for processing in NumericDate type, representing seconds',
    nbf: 'Not Before - The time before which the JWT MUST NOT be accepted for processing in NumericDate type, representing seconds',
    iat: 'Issued At - The time at which the JWT was issued in NumericDate type, representing seconds',
    jti: 'JWT ID - A unique identifier for the JWT'
  };

  // Format timestamp to human readable date
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toUTCString();
    } catch (error) {
      return timestamp;
    }
  };

  // Decode JWT token
  const decodedJWT = useMemo(() => {
    if (!jwtToken) return null;

    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        return { error: 'Invalid JWT format - JWT should have 3 parts separated by dots' };
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      return {
        header,
        payload,
        signature: parts[2],
        valid: true
      };
    } catch (error) {
      return { error: 'Invalid JWT format - Unable to decode' };
    }
  }, [jwtToken]);

  // Verify JWT signature
  const verifySignature = useCallback(async () => {
    if (!decodedJWT || decodedJWT.error) return null;

    try {
      const algorithm = decodedJWT.header.alg;
      
      if (algorithm.startsWith('HS')) {
        // Symmetric verification
        if (!secret) return null;
        
        let secretBytes;
        if (secretEncoding === 'base64url') {
          secretBytes = CryptoJS.enc.Base64url.parse(secret);
        } else {
          secretBytes = CryptoJS.enc.Utf8.parse(secret);
        }

        const [headerB64, payloadB64] = jwtToken.split('.');
        const message = `${headerB64}.${payloadB64}`;
        
        let hash;
        switch (algorithm) {
          case 'HS256':
            hash = CryptoJS.HmacSHA256(message, secretBytes);
            break;
          case 'HS384':
            hash = CryptoJS.HmacSHA384(message, secretBytes);
            break;
          case 'HS512':
            hash = CryptoJS.HmacSHA512(message, secretBytes);
            break;
          default:
            return { error: 'Unsupported algorithm' };
        }

        const computedSignature = CryptoJS.enc.Base64url.stringify(hash);
        const providedSignature = decodedJWT.signature;
        
        return {
          valid: computedSignature === providedSignature,
          algorithm: algorithm
        };
      } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
        // Asymmetric verification
        if (keyType === 'pem' && !publicKey) return null;
        if (keyType === 'jwk' && !jwkEndpoint) return null;

        try {
          let key;
          if (keyType === 'pem') {
            key = await jose.importSPKI(publicKey, algorithm);
          } else {
            // For JWK, we'd need to fetch from endpoint
            const response = await fetch(jwkEndpoint);
            const jwk = await response.json();
            key = await jose.importJWK(jwk, algorithm);
          }

          const { payload } = await jose.jwtVerify(jwtToken, key);
          return {
            valid: true,
            algorithm: algorithm,
            payload
          };
        } catch (error) {
          return {
            valid: false,
            algorithm: algorithm,
            error: error.message
          };
        }
      }

      return { error: 'Unsupported algorithm' };
    } catch (error) {
      return { error: error.message };
    }
  }, [decodedJWT, secret, publicKey, jwkEndpoint, secretEncoding, keyType, jwtToken]);

  // Generate example JWT
  const generateExample = useCallback(async () => {
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
      
      if (selectedAlg.startsWith('HS')) {
        generatedSecret = 'your-256-bit-secret';
        const secret = new TextEncoder().encode(generatedSecret);
        jwt = await new jose.SignJWT(payload)
          .setProtectedHeader(header)
          .setIssuedAt()
          .setExpirationTime('1h')
          .sign(secret);
      } else if (selectedAlg.startsWith('RS')) {
        // For demo purposes, we'll create a simple example
        jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWRfMTIzNDUiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE3MzU2MTM0M30.example-signature-would-be-here';
        generatedSecret = 'RS256 example - requires actual private key for verification';
      }

      setJwtToken(jwt);
      setSecret(generatedSecret);
    } catch (error) {
      console.error('Error generating example:', error);
    }
  }, [selectedAlg]);

  // Copy to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'header') {
        setCopiedHeader(true);
        setTimeout(() => setCopiedHeader(false), 2000);
      } else if (type === 'payload') {
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2000);
      }
      // For token and secret, we don't need to track copy state as they use icons
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Render JSON with proper formatting and colors
  const renderJSON = (obj, type) => {
    const jsonString = JSON.stringify(obj, null, 2);
    const lines = jsonString.split('\n');
    
    return (
      <div className={`json-display json-${type}`}>
        {lines.map((line, index) => {
          // Check if line contains a claim with description
          const claimMatch = line.match(/"([^"]+)":\s*(.+)/);
          if (claimMatch) {
            const key = claimMatch[1];
            const value = claimMatch[2].replace(/,$/, '').replace(/^"|"$/g, '');
            const description = claimDescriptions[key];
            
            return (
              <div key={index} className="json-line" style={{ position: 'relative' }}>
                <span className="json-indent">{line.match(/^(\s*)/)[1]}</span>
                <span className="json-quote">"</span>
                <span 
                  className="json-key"
                  style={{ 
                    cursor: description ? 'help' : 'default',
                    textDecoration: description ? 'underline dotted' : 'none'
                  }}
                >
                  {key}
                </span>
                <span className="json-quote">"</span>
                <span className="json-colon">: </span>
                <span className="json-value">
                  {typeof obj[key] === 'string' ? (
                    <>
                      <span className="json-quote">"</span>
                      {obj[key]}
                      <span className="json-quote">"</span>
                    </>
                  ) : (
                    obj[key]
                  )}
                </span>
                {line.includes(',') && <span className="json-comma">,</span>}
                {description && (
                  <div className="claim-description" style={{ display: 'none' }}>
                    {key === 'iat' && typeof obj[key] === 'number' ? (
                      `Issued At: ${formatTimestamp(obj[key])}`
                    ) : key === 'exp' && typeof obj[key] === 'number' ? (
                      `Expiration: ${formatTimestamp(obj[key])}`
                    ) : key === 'nbf' && typeof obj[key] === 'number' ? (
                      `Not Before: ${formatTimestamp(obj[key])}`
                    ) : (
                      `${key}: ${description}`
                    )}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <div key={index} className="json-line">
              <span className="json-indent">{line.match(/^(\s*)/)[1]}</span>
              <span className="json-brace">{line.trim()}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render JSON with claim descriptions
  const renderJSONWithDescriptions = (obj, isHeader = false) => {
    return Object.entries(obj).map(([key, value]) => 
      renderClaimWithDescription(key, value, isHeader)
    );
  };

  const [signatureResult, setSignatureResult] = useState(null);

  // Verify signature when relevant data changes
  React.useEffect(() => {
    const verify = async () => {
      const result = await verifySignature();
      setSignatureResult(result);
    };
    verify();
  }, [verifySignature]);

  return (
    <div className="jwt-debugger">
      <div className="header-section">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'decoder' ? 'active' : ''}`}
            onClick={() => setActiveTab('decoder')}
          >
            JWT Decoder
          </button>
          <button 
            className={`tab ${activeTab === 'encoder' ? 'active' : ''}`}
            onClick={() => setActiveTab('encoder')}
          >
            JWT Encoder
          </button>
        </div>
        <div className="example-section-header">
          {showExampleDropdown ? (
            <>
              <label>JWT Example:</label>
              <select
                className="form-select"
                value={selectedAlg}
                onChange={(e) => {
                  setSelectedAlg(e.target.value);
                  // Auto-generate example when algorithm changes
                  setTimeout(() => {
                    generateExample();
                    setShowExampleDropdown(false);
                  }, 100);
                }}
                autoFocus
              >
                <option value="HS256">HS256</option>
                <option value="HS384">HS384</option>
                <option value="HS512">HS512</option>
                <option value="RS256">RS256</option>
                <option value="RS384">RS384</option>
                <option value="RS512">RS512</option>
              </select>
            </>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => setShowExampleDropdown(true)}
            >
              Generate Example
            </button>
          )}
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'decoder' && (
          <>
            <div className="main-layout">
              <div className="left-column">
                <div className="content-panel">
                  <div className="input-header">
                    <label className="form-label">JWT Token</label>
                    <div className="status-indicators">
                      {decodedJWT && !decodedJWT.error && (
                        <>
                          <span className="status-indicator status-valid">
                            ✓ Valid JWT
                          </span>
                          {signatureResult && (
                            signatureResult.valid ? (
                              <span className="status-indicator status-valid">
                                ✓ Signature Valid
                              </span>
                            ) : (
                              <span className="status-indicator status-invalid">
                                ✗ Signature Invalid
                                {signatureResult.error && `: ${signatureResult.error}`}
                              </span>
                            )
                          )}
                        </>
                      )}
                      {decodedJWT && decodedJWT.error && (
                        <span className="status-indicator status-invalid">
                          ✗ {decodedJWT.error}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="panel-content">
                    <div className="input-container">
                      <div className="jwt-input-wrapper">
                        <textarea
                          className="form-input jwt-textarea"
                          placeholder="Paste a JSON web token here"
                          value={jwtToken}
                          onChange={(e) => setJwtToken(e.target.value)}
                          rows={6}
                        />
                        {jwtToken && jwtToken.trim() && (
                          <div className="jwt-color-overlay">
                            {jwtToken.split('.').map((part, index) => {
                              let colorClass = '';
                              if (index === 0) colorClass = 'jwt-header';
                              else if (index === 1) colorClass = 'jwt-payload';
                              else if (index === 2) colorClass = 'jwt-signature';
                              
                              return (
                                <span key={index} className={`jwt-part ${colorClass}`}>
                                  {part}
                                  {index < 2 && <span className="jwt-dot">.</span>}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <button 
                        className="copy-icon"
                        onClick={() => copyToClipboard(jwtToken, 'token')}
                        title="Copy JWT Token"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="content-panel">
                  <div className="input-header">
                    <label className="form-label">Decoded Header</label>
                    <button 
                      className={`copy-icon ${copiedHeader ? 'copied' : ''}`}
                      onClick={() => decodedJWT && !decodedJWT.error && copyToClipboard(JSON.stringify(decodedJWT.header, null, 2), 'header')}
                      title="Copy Decoded Header"
                      disabled={!decodedJWT || decodedJWT.error}
                    >
                      {copiedHeader ? '✓' : '📋'}
                    </button>
                  </div>
                  <div className="panel-content">
                    {decodedJWT && !decodedJWT.error ? (
                      renderJSON(decodedJWT.header, 'header')
                    ) : (
                      <div className="json-content" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        {decodedJWT && decodedJWT.error ? 'Invalid JWT' : 'Decoded header will appear here'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="content-panel">
                  <div className="input-header">
                    <label className="form-label">Decoded Payload</label>
                    <button 
                      className={`copy-icon ${copiedPayload ? 'copied' : ''}`}
                      onClick={() => decodedJWT && !decodedJWT.error && copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2), 'payload')}
                      title="Copy Decoded Payload"
                      disabled={!decodedJWT || decodedJWT.error}
                    >
                      {copiedPayload ? '✓' : '📋'}
                    </button>
                  </div>
                  <div className="panel-content">
                    {decodedJWT && !decodedJWT.error ? (
                      renderJSON(decodedJWT.payload, 'payload')
                    ) : (
                      <div className="json-content" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        {decodedJWT && decodedJWT.error ? 'Invalid JWT' : 'Decoded payload will appear here'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                              📋
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
          </>
        )}

        {activeTab === 'encoder' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <h3>JWT Encoder</h3>
            <p>JWT encoding functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JWTDebugger; 