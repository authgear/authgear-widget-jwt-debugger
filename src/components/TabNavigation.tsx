import React, { useState, useEffect } from 'react';
import { SUPPORTED_ALGORITHMS } from '../constants';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAlg: string;
  setSelectedAlg: (alg: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  selectedAlg,
  setSelectedAlg
}) => {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if the page is running in an iframe
    const checkIfInIframe = () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        // If we can't access window.top due to cross-origin restrictions,
        // it means we're in an iframe
        return true;
      }
    };
    
    setIsInIframe(checkIfInIframe());
  }, []);

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener');
  };

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
        <button
          className="tab external-link-tab"
          onClick={() => handleExternalLink('https://www.authgear.com/tools/jwk-generator?utm_source=authgear&utm_medium=link&utm_campaign=jwt-debugger')}
          title="Open JWK Generator in new tab"
        >
          JWK Generator ↗
        </button>
      </div>
      {!isInIframe && (
        <div className="authgear-logo-section">
          <span className="powered-by-text">Presented by</span>
          <img 
            src="./authgear-logo.svg" 
            alt="Authgear Logo" 
            className="authgear-logo"
          />
        </div>
      )}
    </div>
  );
};

export default TabNavigation; 