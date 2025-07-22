import React, { useState, useEffect } from 'react';

const TimeConversionModal = ({ isOpen, onClose }) => {
  const [datetimeInput, setDatetimeInput] = useState('');
  const [numericDateInput, setNumericDateInput] = useState('');
  const [convertedNumericDate, setConvertedNumericDate] = useState('');
  const [convertedDatetime, setConvertedDatetime] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Set default datetime to current time when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Format for datetime-local input (YYYY-MM-DDTHH:mm)
      const formattedNow = now.toISOString().slice(0, 16);
      setDatetimeInput(formattedNow);
      setNumericDateInput('');
      setConvertedNumericDate('');
      setConvertedDatetime('');
      setError('');
      setCopied(false);
    }
  }, [isOpen]);

  // Convert datetime to NumericDate
  const convertDatetimeToNumeric = () => {
    if (!datetimeInput) {
      setError('Please enter a date and time');
      return;
    }

    try {
      const date = new Date(datetimeInput);
      if (isNaN(date.getTime())) {
        setError('Invalid date format');
        return;
      }
      // NumericDate is seconds since Unix epoch
      const numericDate = Math.floor(date.getTime() / 1000);
      setConvertedNumericDate(numericDate.toString());
      setError('');
      setCopied(false);
    } catch (err) {
      setError('Error converting datetime: ' + err.message);
    }
  };

  // Convert NumericDate to datetime
  const convertNumericToDatetime = () => {
    if (!numericDateInput) {
      setError('Please enter a NumericDate value');
      return;
    }

    try {
      const numericDate = parseInt(numericDateInput, 10);
      if (isNaN(numericDate)) {
        setError('Invalid NumericDate value');
        return;
      }

      const date = new Date(numericDate * 1000);
      if (isNaN(date.getTime())) {
        setError('Invalid NumericDate value');
        return;
      }

      // Format for display: local time string with timezone
      const formattedDate = date.toString();
      setConvertedDatetime(formattedDate);
      setError('');
    } catch (err) {
      setError('Error converting NumericDate: ' + err.message);
    }
  };

  // Copy NumericDate to clipboard
  const handleCopy = async () => {
    if (convertedNumericDate) {
      try {
        await navigator.clipboard.writeText(convertedNumericDate);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (err) {
        setError('Failed to copy');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Time Conversion</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Datetime to NumericDate */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
              Convert Local Date/Time to NumericDate
            </h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="datetime-local"
                value={datetimeInput}
                onChange={(e) => setDatetimeInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={convertDatetimeToNumeric}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Convert
              </button>
            </div>
            {convertedNumericDate && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                <span>NumericDate: {convertedNumericDate}</span>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: copied ? '#28a745' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'background 0.2s'
                  }}
                  title="Copy NumericDate"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* NumericDate to Datetime */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
              Convert NumericDate to Date/Time
            </h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="number"
                value={numericDateInput}
                onChange={(e) => setNumericDateInput(e.target.value)}
                placeholder="Enter NumericDate (Unix timestamp)"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={convertNumericToDatetime}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Convert
              </button>
            </div>
            {convertedDatetime && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                Date/Time: {convertedDatetime}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '6px',
              color: '#721c24',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '20px'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeConversionModal; 