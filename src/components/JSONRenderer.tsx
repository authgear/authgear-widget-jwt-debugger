import React from 'react';
import { CLAIM_DESCRIPTIONS, TIMESTAMP_CLAIMS } from '../constants';
import { formatTimestamp, isTimestampClaim } from '../utils';

interface JSONRendererProps {
  obj: any;
  type: string;
}

const JSONRenderer: React.FC<JSONRendererProps> = ({ obj, type }) => {
  if (!obj) obj = {};
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
          const description = CLAIM_DESCRIPTIONS[key];
          const isTimestamp = isTimestampClaim(key) && typeof obj[key] === 'number';
          
          return (
            <div key={index} className="json-line">
              <span className="json-indent">{line.match(/^(\s*)/)[1]}</span>
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
                {typeof obj[key] === 'string' ? (
                  <>
                    <span className="json-quote">"</span>
                    {obj[key]}
                    <span className="json-quote">"</span>
                  </>
                ) : (
                  obj[key]
                )}
                {isTimestamp && (
                  <div className="claim-description" style={{ display: 'none' }}>
                    {formatTimestamp(obj[key])}
                  </div>
                )}
              </span>
              {line.includes(',') && <span className="json-comma">,</span>}
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

export default JSONRenderer; 