import React, { useState, useCallback, useMemo } from 'react';
import { decodeJWT } from './utils';
import { verifyJWTSignature } from './services/jwtVerification';
import { generateExampleJWT } from './services/exampleGenerator';
import TabNavigation from './components/TabNavigation';
import JWTTokenInput from './components/JWTTokenInput';
import DecodedSections from './components/DecodedSections';
import SignatureVerification from './components/SignatureVerification';

const JWTDebugger = () => {
  const [activeTab, setActiveTab] = useState('decoder');
  const [jwtToken, setJwtToken] = useState('');
  const [secret, setSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [jwkEndpoint, setJwkEndpoint] = useState('');
  const [secretEncoding, setSecretEncoding] = useState('utf8');
  const [keyType, setKeyType] = useState('pem');
  const [selectedAlg, setSelectedAlg] = useState('HS256');
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showExampleDropdown, setShowExampleDropdown] = useState(false);

  // Decode JWT token
  const decodedJWT = useMemo(() => {
    return decodeJWT(jwtToken);
  }, [jwtToken]);

  // Verify JWT signature
  const verifySignature = useCallback(async () => {
    return await verifyJWTSignature(decodedJWT, jwtToken, secret, publicKey, jwkEndpoint, secretEncoding, keyType);
  }, [decodedJWT, jwtToken, secret, publicKey, jwkEndpoint, secretEncoding, keyType]);

  // Generate example JWT
  const generateExample = useCallback(async () => {
    const { jwt, generatedSecret } = await generateExampleJWT(selectedAlg);
    setJwtToken(jwt);
    if (selectedAlg.startsWith('HS')) {
      setSecret(generatedSecret);
    } else {
      setSecret('');
    }
  }, [selectedAlg]);

  // Copy to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'header') {
        setCopiedHeader(true);
        setTimeout(() => setCopiedHeader(false), 2000);
      } else if (type === 'payload') {
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const [signatureResult, setSignatureResult] = useState(null);

  // Verify signature when relevant data changes
  React.useEffect(() => {
    const verify = async () => {
      const result = await verifySignature();
      setSignatureResult(result);
    };
    verify();
  }, [verifySignature]);

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
        {activeTab === 'decoder' && (
          <>
            <div className="main-layout">
              <div className="left-column">
                <JWTTokenInput
                  jwtToken={jwtToken}
                  setJwtToken={setJwtToken}
                  decodedJWT={decodedJWT}
                  signatureResult={signatureResult}
                  copyToClipboard={copyToClipboard}
                />
              </div>

              <div className="right-column">
                <DecodedSections
                  decodedJWT={decodedJWT}
                  copiedHeader={copiedHeader}
                  copiedPayload={copiedPayload}
                  copyToClipboard={copyToClipboard}
                />
              </div>
            </div>

            <SignatureVerification
              decodedJWT={decodedJWT}
              secret={secret}
              setSecret={setSecret}
              publicKey={publicKey}
              setPublicKey={setPublicKey}
              jwkEndpoint={jwkEndpoint}
              setJwkEndpoint={setJwkEndpoint}
              secretEncoding={secretEncoding}
              setSecretEncoding={setSecretEncoding}
              keyType={keyType}
              setKeyType={setKeyType}
              copyToClipboard={copyToClipboard}
              selectedAlg={selectedAlg}
            />
          </>
        )}

        {activeTab === 'encoder' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <h3>JWT Encoder</h3>
            <p>JWT encoding functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JWTDebugger; 