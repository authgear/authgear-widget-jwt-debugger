import React from 'react';

const JWTTokenInput = ({ jwtToken, setJwtToken, decodedJWT, signatureResult, copyToClipboard }) => {
  // Function to determine if text should be colored
  const shouldColorText = () => {
    if (!jwtToken || !jwtToken.trim()) return false;
    const parts = jwtToken.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  };

  // Function to get the color class for each character
  const getColorClass = (char, index, jwtString) => {
    const parts = jwtString.split('.');
    let charCount = 0;
    
    for (let i = 0; i < parts.length; i++) {
      if (index < charCount + parts[i].length) {
        if (i === 0) return 'jwt-header';
        if (i === 1) return 'jwt-payload';
        if (i === 2) return 'jwt-signature';
        break;
      }
      charCount += parts[i].length + 1; // +1 for the dot
    }
    
    // Check if this is a dot
    if (char === '.') return 'jwt-dot';
    
    return '';
  };

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
              className={`form-input jwt-textarea ${shouldColorText() ? 'jwt-transparent' : ''}`}
              placeholder="Paste a JSON web token here"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              rows={6}
            />
            {shouldColorText() && (
              <div className="jwt-color-overlay">
                {jwtToken.split('').map((char, index) => (
                  <span 
                    key={index} 
                    className={getColorClass(char, index, jwtToken)}
                  >
                    {char}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button 
            className="copy-icon"
            onClick={() => copyToClipboard(jwtToken, 'token')}
            title="Copy JWT Token"
          >
            COPY
          </button>
        </div>
      </div>
    </div>
  );
};

export default JWTTokenInput; 