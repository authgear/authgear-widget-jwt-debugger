import React, { useRef, useEffect } from 'react';
import { useClipboard } from '../utils';
import { getErrorMessage } from '../utils/errorHandling';

const JWTTokenInput = ({ jwtToken, setJwtToken, decodedJWT, signatureResult }) => {
  const [copied, copy] = useClipboard();
  
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

  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  // Sync overlay scroll with textarea scroll
  const handleScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    // Sync on mount and when token changes
    handleScroll();
  }, [jwtToken]);

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
                    {signatureResult.error && `: ${getErrorMessage(signatureResult.error)}`}
                  </span>
                )
              )}
            </>
          )}
          {decodedJWT && decodedJWT.error && (
            <span className="status-indicator status-invalid">
              ✗ {getErrorMessage(decodedJWT.error)}
            </span>
          )}
        </div>
      </div>
      <div className="panel-content">
        <div className="input-container">
          <div className="jwt-input-wrapper" style={{ maxHeight: 240, position: 'relative' }}>
            {shouldColorText() && (
              <div
                className="jwt-color-overlay"
                ref={overlayRef}
                style={{
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: 'hidden',
                  padding: '12px 16px',
                  paddingRight: 40,
                  fontSize: 14,
                  fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  lineHeight: 1.4,
                  zIndex: 1,
                  margin: 0,
                  border: 'none',
                  background: 'transparent',
                  maxHeight: 240,
                }}
              >
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
            <textarea
              ref={textareaRef}
              className={`form-input jwt-textarea ${shouldColorText() ? 'jwt-transparent' : ''}`}
              placeholder="Paste a JSON web token here"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              rows={6}
              style={{
                position: 'relative',
                background: 'transparent',
                overflow: 'auto',
                resize: 'none',
                width: '100%',
                minHeight: 120,
                maxHeight: 240,
                boxSizing: 'border-box',
                zIndex: 2,
              }}
              onScroll={handleScroll}
            />
          </div>
          <button 
            className={`copy-icon${copied ? ' copied' : ''}`}
            onClick={() => copy(jwtToken)}
            title="Copy JWT Token"
          >
            {copied ? '✓' : 'COPY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JWTTokenInput;