import React from 'react';

const JWTTokenInput = ({ jwtToken, setJwtToken, decodedJWT, signatureResult, copyToClipboard }) => {
  return (
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
  );
};

export default JWTTokenInput; 