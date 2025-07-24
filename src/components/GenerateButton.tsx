import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_ALGORITHMS } from '../constants';

interface GenerateButtonProps {
  onGenerate: (algorithm: string) => void;
  label?: string;
  showAlgorithmDropdown?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  onGenerate, 
  label = "Generate",
  showAlgorithmDropdown = true
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAlgorithmSelect = (algorithm: string) => {
    onGenerate(algorithm);
    setShowDropdown(false);
  };

  const handleGenerateClick = () => {
    if (!showAlgorithmDropdown) {
      // For JWE, just call onGenerate without algorithm parameter
      onGenerate('');
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-secondary"
        style={{
          background: '#fff',
          color: '#333',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          fontSize: '12px',
          padding: '4px 14px',
          fontWeight: 500,
          cursor: 'pointer',
          margin: 0,
          height: 24,
          minWidth: '80px'
        }}
        onClick={handleGenerateClick}
      >
        {label}
      </button>
      
      {showDropdown && showAlgorithmDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            marginTop: '2px'
          }}
        >
          {SUPPORTED_ALGORITHMS.map(alg => (
            <div
              key={alg.value}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
              }}
              onClick={() => handleAlgorithmSelect(alg.value)}
            >
              {alg.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateButton; 