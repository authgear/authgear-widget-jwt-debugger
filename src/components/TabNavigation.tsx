import React from 'react';
import { SUPPORTED_ALGORITHMS } from '../constants';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showExampleDropdown: boolean;
  setShowExampleDropdown: (show: boolean) => void;
  selectedAlg: string;
  setSelectedAlg: (alg: string) => void;
  generateExample: () => Promise<void>;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  showExampleDropdown,
  setShowExampleDropdown,
  selectedAlg,
  setSelectedAlg,
  generateExample
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
      <div className="authgear-logo-section">
        <span className="powered-by-text">Powered by</span>
        <img 
          src="/authgear-logo.svg" 
          alt="Authgear Logo" 
          className="authgear-logo"
        />
      </div>
    </div>
  );
};

export default TabNavigation; 