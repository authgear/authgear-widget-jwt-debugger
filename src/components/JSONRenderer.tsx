import React from 'react';
import { CLAIM_DESCRIPTIONS, TIMESTAMP_CLAIMS } from '../constants';
import { formatTimestamp, isTimestampClaim } from '../utils';

interface JSONRendererProps {
  obj: any;
  type: string;
}

const JSONRenderer: React.FC<JSONRendererProps> = ({ obj, type }) => {
  if (!obj) obj = {};
  
  return (
    <div className={`json-display json-${type}`}>
      {renderObject(obj, 0)}
    </div>
  );
};

// Helper function to render an object with proper indentation
const renderObject = (obj: any, indentLevel: number): React.ReactNode => {
  const indent = '  '.repeat(indentLevel);
  const nextIndent = '  '.repeat(indentLevel + 1);
  
  return (
    <>
      <div className="json-line">
        <span className="json-indent">{indent}</span>
        <span className="json-brace">{'{'}</span>
      </div>
      {Object.entries(obj).map(([key, value], index) => {
        const description = CLAIM_DESCRIPTIONS[key];
        const isTimestamp = isTimestampClaim(key) && typeof value === 'number';
        const isLast = index === Object.keys(obj).length - 1;
        
        return (
          <div key={key} className="json-line">
            <span className="json-indent">{nextIndent}</span>
            <span className="json-quote">"</span>
            <span 
              className="json-key"
              style={{ 
                cursor: description ? 'help' : 'default',
                textDecoration: description ? 'underline dotted' : 'none',
                position: 'relative'
              }}
            >
              {key}
              {description && (
                <div className="claim-description" style={{ display: 'none' }}>
                  {description}
                </div>
              )}
            </span>
            <span className="json-quote">"</span>
            <span className="json-colon">: </span>
            <span 
              className="json-value"
              style={{ 
                position: 'relative',
                cursor: isTimestamp ? 'help' : 'default',
                textDecoration: isTimestamp ? 'underline dotted' : 'none'
              }}
            >
              {renderValue(value)}
              {isTimestamp && (
                <div className="claim-description" style={{ display: 'none' }}>
                  {formatTimestamp(value)}
                </div>
              )}
            </span>
            {!isLast && <span className="json-comma">,</span>}
          </div>
        );
      })}
      <div className="json-line">
        <span className="json-indent">{indent}</span>
        <span className="json-brace">{'}'}</span>
      </div>
    </>
  );
};

// Helper function to properly render JSON values
const renderValue = (value: any): React.ReactNode => {
  if (value === null) {
    return <span style={{ color: '#6c757d' }}>null</span>;
  }
  
  if (typeof value === 'string') {
    return (
      <>
        <span className="json-quote">"</span>
        {value}
        <span className="json-quote">"</span>
      </>
    );
  }
  
  if (typeof value === 'number') {
    return <span style={{ color: '#0066cc' }}>{value}</span>;
  }
  
  if (typeof value === 'boolean') {
    return <span style={{ color: '#cc6600' }}>{value.toString()}</span>;
  }
  
  if (Array.isArray(value)) {
    return (
      <>
        <span className="json-brace">[</span>
        {value.map((item, index) => (
          <React.Fragment key={index}>
            {renderValue(item)}
            {index < value.length - 1 && <span className="json-comma">, </span>}
          </React.Fragment>
        ))}
        <span className="json-brace">]</span>
      </>
    );
  }
  
  if (typeof value === 'object') {
    return (
      <>
        <span className="json-brace">{'{'}</span>
        {Object.entries(value).map(([key, val], index) => (
          <React.Fragment key={key}>
            <span className="json-quote">"</span>
            <span className="json-key">{key}</span>
            <span className="json-quote">"</span>
            <span className="json-colon">: </span>
            {renderValue(val)}
            {index < Object.keys(value).length - 1 && <span className="json-comma">, </span>}
          </React.Fragment>
        ))}
        <span className="json-brace">{'}'}</span>
      </>
    );
  }
  
  return String(value);
};

export default JSONRenderer; 