import React from 'react';
import { SUPPORTED_ALGORITHMS } from '../constants';

const TabNavigation = ({ 
  activeTab, 
  setActiveTab
}) => {
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
        <button
          className={`tab ${activeTab === 'jwe-encrypt' ? 'active' : ''}`}
          onClick={() => setActiveTab('jwe-encrypt')}
        >
          JWE Encrypt
        </button>
        <button
          className={`tab ${activeTab === 'jwe-decrypt' ? 'active' : ''}`}
          onClick={() => setActiveTab('jwe-decrypt')}
        >
          JWE Decrypt
        </button>
      </div>
    </div>
  );
};

export default TabNavigation; 