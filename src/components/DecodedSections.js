import React from 'react';
import JSONRenderer from './JSONRenderer';

const DecodedSections = ({ decodedJWT, copiedHeader, copiedPayload, copyToClipboard }) => {
  const renderJSON = (obj, type) => {
    return <JSONRenderer obj={obj} type={type} />;
  };

  return (
    <>
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
    </>
  );
};

export default DecodedSections; 