import React from 'react';
import { SUPPORTED_ALGORITHMS } from '../constants';

const TabNavigation = ({ 
  activeTab, 
  setActiveTab, 
  showExampleDropdown, 
  setShowExampleDropdown, 
  selectedAlg, 
  setSelectedAlg, 
  generateExample 
}) => {
  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExampleDropdown && !event.target.closest('.example-section-header')) {
        setShowExampleDropdown(false);
      }
    };

    if (showExampleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExampleDropdown, setShowExampleDropdown]);

  return (
    <div className="header-section">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'decoder' ? 'active' : ''}`}
          onClick={() => setActiveTab('decoder')}
        >
          JWT Decoder
        </button>
        <button 
          className={`tab ${activeTab === 'encoder' ? 'active' : ''}`}
          onClick={() => setActiveTab('encoder')}
        >
          JWT Encoder
        </button>
      </div>
      <div className="example-section-header">
        <label>JWT Example:</label>
        <select
          className="form-select"
          value={selectedAlg}
          onChange={(e) => {
            setSelectedAlg(e.target.value);
          }}
        >
          {SUPPORTED_ALGORITHMS.map(alg => (
            <option key={alg.value} value={alg.value}>
              {alg.label}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 8 }}
          onClick={() => {
            generateExample();
          }}
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default TabNavigation; 