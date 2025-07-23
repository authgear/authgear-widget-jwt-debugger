import React, { useState } from 'react';
import JSONRenderer from './JSONRenderer';
import TimeConversionModal from './TimeConversionModal';

interface DecodedSectionsProps {
  decodedJWT: {
    header: any;
    payload: any;
    error?: string;
  } | { type: any; message: any; details: null; timestamp: string } | null;
  copiedHeader: boolean | ((text: any) => Promise<boolean>);
  copiedPayload: boolean | ((text: any) => Promise<boolean>);
  copyHeader: boolean | ((text: any) => Promise<boolean>);
  copyPayload: boolean | ((text: any) => Promise<boolean>);
}

const DecodedSections: React.FC<DecodedSectionsProps> = ({ decodedJWT, copiedHeader, copiedPayload, copyHeader, copyPayload }) => {
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Type guards
  const isValidJWT = (obj: any): obj is { header: any; payload: any; error?: string } => {
    return obj && typeof obj === 'object' && 'header' in obj && 'payload' in obj;
  };

  const isErrorObject = (obj: any): obj is { type: any; message: any; details: null; timestamp: string } => {
    return obj && typeof obj === 'object' && 'type' in obj && 'message' in obj;
  };

  // Extract functions from useClipboard tuples
  const copyHeaderFn = typeof copyHeader === 'function' ? copyHeader : () => Promise.resolve(false);
  const copyPayloadFn = typeof copyPayload === 'function' ? copyPayload : () => Promise.resolve(false);
  const copiedHeaderBool = typeof copiedHeader === 'boolean' ? copiedHeader : false;
  const copiedPayloadBool = typeof copiedPayload === 'boolean' ? copiedPayload : false;

  const renderJSON = (obj: any, type: string) => {
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
            {decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error ? (
              <>
                <button 
                  className={`copy-icon json-copy-icon ${copiedHeaderBool ? 'copied' : ''}`}
                  onClick={() => decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error && copyHeaderFn(JSON.stringify(decodedJWT.header, null, 2))}
                  title="Copy Decoded Header"
                  disabled={!decodedJWT || !isValidJWT(decodedJWT) || !!decodedJWT.error}
                >
                  {copiedHeaderBool ? '✓' : 'COPY'}
                </button>
                {renderJSON(decodedJWT.header, 'header')}
              </>
            ) : (
              <div className="json-display json-header" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                {decodedJWT && isValidJWT(decodedJWT) && decodedJWT.error ? 'Invalid JWT' : 'Decoded header will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-panel">
        <div className="input-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label className="form-label">Decoded Payload</label>
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
            title="Open time conversion modal"
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <rect x="3" y="7" width="10" height="10" rx="2" stroke="#0B63E9" strokeWidth="1.5"/>
              <path d="M9 7V3H17V11H13" stroke="#0B63E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 3L9 11" stroke="#0B63E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Time Conversion
          </button>
        </div>
        <div className="panel-content">
          <div className="json-container">
            {decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error ? (
              <>
                <button 
                  className={`copy-icon json-copy-icon ${copiedPayloadBool ? 'copied' : ''}`}
                  onClick={() => decodedJWT && isValidJWT(decodedJWT) && !decodedJWT.error && copyPayloadFn(JSON.stringify(decodedJWT.payload, null, 2))}
                  title="Copy Decoded Payload"
                  disabled={!decodedJWT || !isValidJWT(decodedJWT) || !!decodedJWT.error}
                >
                  {copiedPayloadBool ? '✓' : 'COPY'}
                </button>
                {renderJSON(decodedJWT.payload, 'payload')}
              </>
            ) : (
              <div className="json-display json-payload" style={{ color: '#6c757d', fontStyle: 'italic' }}>
                {decodedJWT && isValidJWT(decodedJWT) && decodedJWT.error ? 'Invalid JWT' : 'Decoded payload will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>
      <TimeConversionModal isOpen={showTimeModal} onClose={() => setShowTimeModal(false)} />
    </>
  );
};

export default DecodedSections; 