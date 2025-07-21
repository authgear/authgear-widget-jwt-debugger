import React, { useState, useCallback, useMemo, useRef } from 'react';
import { decodeJWT, useClipboard } from './utils';
import { verifyJWTSignature } from './services/jwtVerification';
import { generateExampleJWT } from './services/exampleGenerator';
import { getDefaultJWTExampleData } from './services/exampleGenerator';
import { generateRSAKeyPair, arrayBufferToPem, exportKeyPairToPEM } from './services/keyUtils';
import TabNavigation from './components/TabNavigation';
import JWTTokenInput from './components/JWTTokenInput';
import DecodedSections from './components/DecodedSections';
import SignatureVerification from './components/SignatureVerification';
import JWTEncoder from './components/JWTEncoder';
import JWEEncrypt from './components/JWEEncrypt';
import { useSignatureVerification } from './hooks/useSignatureVerification';

// Custom hook for example generation
function useExampleGenerator(selectedAlg, activeTab, encoderRef, setJwtToken, setSecret, setPublicKey) {
  return React.useCallback(async () => {
    if (activeTab === 'decoder') {
      if (selectedAlg.startsWith('RS')) {
        // Generate key pair, then pass to generateExampleJWT so JWT and public key match
        const keyPair = await generateRSAKeyPair();
        const { jwt: realJwt, generatedPublicKey } = await generateExampleJWT(selectedAlg, keyPair);
        setJwtToken(realJwt);
        setSecret('');
        setPublicKey(generatedPublicKey);
      } else {
        const { jwt, generatedSecret } = await generateExampleJWT(selectedAlg);
        setJwtToken(jwt);
        if (selectedAlg.startsWith('HS')) {
          setSecret(generatedSecret);
        } else {
          setSecret('');
          setPublicKey('');
        }
      }
    } else if (activeTab === 'encoder' && encoderRef.current) {
      const { header, payload, secret } = getDefaultJWTExampleData(selectedAlg);
      let realSecret = secret;
      if (selectedAlg.startsWith('RS')) {
        // Generate a real RSA private key as PEM
        const keyPair = await generateRSAKeyPair();
        const pemKeys = await exportKeyPairToPEM(keyPair);
        realSecret = pemKeys.privateKey;
      }
      encoderRef.current.setExampleData(
        JSON.stringify(header, null, 2),
        JSON.stringify(payload, null, 2),
        realSecret
      );
    }
  }, [selectedAlg, activeTab, encoderRef, setJwtToken, setSecret, setPublicKey]);
}

const JWTDebugger = () => {
  const [activeTab, setActiveTab] = useState('decoder');
  const [jwtToken, setJwtToken] = useState('');
  const [selectedAlg, setSelectedAlg] = useState('HS256');
  const [showExampleDropdown, setShowExampleDropdown] = useState(false);
  const encoderRef = useRef();
  const [jweEncryptJwt, setJweEncryptJwt] = useState('');

  const [copiedHeader, copyHeader] = useClipboard();
  const [copiedPayload, copyPayload] = useClipboard();

  // Decode JWT token
  const decodedJWT = useMemo(() => {
    return decodeJWT(jwtToken);
  }, [jwtToken]);

  // Use signature verification hook
  const { algorithm, secretConfig, publicKeyConfig, signatureResult } = useSignatureVerification(decodedJWT, jwtToken);

  // Generate example JWT
  const generateExample = useExampleGenerator(selectedAlg, activeTab, encoderRef, setJwtToken, secretConfig.setValue, publicKeyConfig.setValue);

  // Function to handle switching to JWE Encrypt tab with JWT
  const switchToJweEncrypt = (jwt) => {
    setJweEncryptJwt(jwt);
    setActiveTab('jwe-encrypt');
  };

  return (
    <div className="jwt-debugger">
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showExampleDropdown={showExampleDropdown}
        setShowExampleDropdown={setShowExampleDropdown}
        selectedAlg={selectedAlg}
        setSelectedAlg={setSelectedAlg}
        generateExample={generateExample}
      />

      <div className="tab-content">
        <div style={{ display: activeTab === 'decoder' ? 'block' : 'none' }}>
          <>
            <div className="main-layout">
              <div className="left-column">
                <JWTTokenInput
                  jwtToken={jwtToken}
                  setJwtToken={setJwtToken}
                  decodedJWT={decodedJWT}
                  signatureResult={signatureResult}
                  copyToClipboard={copyHeader} // For token, you may want a separate useClipboard if needed
                />
              </div>

              <div className="right-column">
                <DecodedSections
                  decodedJWT={decodedJWT}
                  copiedHeader={copiedHeader}
                  copiedPayload={copiedPayload}
                  copyHeader={copyHeader}
                  copyPayload={copyPayload}
                />
              </div>
            </div>

            <SignatureVerification
              algorithm={algorithm}
              secretConfig={secretConfig}
              publicKeyConfig={publicKeyConfig}
            />
          </>
        </div>
        <div style={{ display: activeTab === 'encoder' ? 'block' : 'none' }}>
          <JWTEncoder ref={encoderRef} onEncryptToken={switchToJweEncrypt} />
        </div>
        <div style={{ display: activeTab === 'jwe-encrypt' ? 'block' : 'none' }}>
          <JWEEncrypt initialJwt={jweEncryptJwt} />
        </div>
      </div>
    </div>
  );
};

export default JWTDebugger; 