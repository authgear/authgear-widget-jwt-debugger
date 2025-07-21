import React from 'react';
import JSONRenderer from './JSONRenderer';

const DecodedSections = ({ decodedJWT, copiedHeader, copiedPayload, copyHeader, copyPayload }) => {
  const renderJSON = (obj, type) => {
    return <JSONRenderer obj={obj} type={type} />;
  };

  return (
    <>
      <div className="content-panel">
        <div className="input-header">
          <label className="form-label">Decoded Header</label>
        </div>
        <div className="panel-content">
          <div className="json-container">
            {decodedJWT && !decodedJWT.error ? (
              <>
                <button 
                  className={`copy-icon json-copy-icon ${copiedHeader ? 'copied' : ''}`}
                  onClick={() => decodedJWT && !decodedJWT.error && copyHeader(JSON.stringify(decodedJWT.header, null, 2))}
                  title="Copy Decoded Header"
                  disabled={!decodedJWT || decodedJWT.error}
                >
                  {copiedHeader ? '✓' : 'COPY'}
                </button>
                {renderJSON(decodedJWT.header, 'header')}
              </>
            ) : (
              <div className="json-display json-header" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                {decodedJWT && decodedJWT.error ? 'Invalid JWT' : 'Decoded header will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-panel">
        <div className="input-header">
          <label className="form-label">Decoded Payload</label>
        </div>
        <div className="panel-content">
          <div className="json-container">
            {decodedJWT && !decodedJWT.error ? (
              <>
                <button 
                  className={`copy-icon json-copy-icon ${copiedPayload ? 'copied' : ''}`}
                  onClick={() => decodedJWT && !decodedJWT.error && copyPayload(JSON.stringify(decodedJWT.payload, null, 2))}
                  title="Copy Decoded Payload"
                  disabled={!decodedJWT || decodedJWT.error}
                >
                  {copiedPayload ? '✓' : 'COPY'}
                </button>
                {renderJSON(decodedJWT.payload, 'payload')}
              </>
            ) : (
              <div className="json-display json-payload" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                {decodedJWT && decodedJWT.error ? 'Invalid JWT' : 'Decoded payload will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DecodedSections; 