import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { decodeJWT, useClipboard } from './utils';
import { verifyJWTSignature } from './services/jwtVerification';
import { generateExampleJWT } from './services/exampleGenerator';
import { getDefaultJWTExampleData } from './services/exampleGenerator';
import { generateRSAKeyPair, arrayBufferToPem, exportKeyPairToPEM } from './services/keyUtils';
import { SUPPORTED_ALGORITHMS } from './constants';
import TabNavigation from './components/TabNavigation.jsx';
import JWTTokenInput from './components/JWTTokenInput.jsx';
import DecodedSections from './components/DecodedSections.jsx';
import SignatureVerification from './components/SignatureVerification.jsx';
import JWTEncoder from './components/JWTEncoder.jsx';
import JWEEncrypt from './components/JWEEncrypt.jsx';
import JWEDecrypt from './components/JWEDecrypt.jsx';
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

  // On mount, set default HS256 JWT for both decoder and encoder
  useEffect(() => {
    async function setDefaults() {
      // Set decoder default
      const { jwt, generatedSecret } = await generateExampleJWT('HS256');
      setJwtToken(jwt);
      // Set encoder default
      if (encoderRef.current) {
        const { header, payload, secret } = getDefaultJWTExampleData('HS256');
        encoderRef.current.setExampleData(
          JSON.stringify(header, null, 2),
          JSON.stringify(payload, null, 2),
          secret
        );
      }
    }
    setDefaults();
    // eslint-disable-next-line
  }, []);

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
          {/* JWT Example dropdown for Decoder at the top, styled small and left-aligned */}
          <div className="example-section-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: 0, marginBottom: 16, padding: 0 }}>
            <label style={{ fontSize: '12px', color: '#333', marginRight: 6 }}>JWT Example:</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <select
                className="form-select"
                value={selectedAlg}
                onChange={(e) => {
                  setSelectedAlg(e.target.value);
                }}
                style={{
                  fontSize: '12px',
                  padding: '2px 18px 2px 6px',
                  border: '1px solid #ced4da',
                  borderRight: 'none',
                  borderRadius: '4px 0 0 4px',
                  background: '#fff',
                  color: '#333',
                  minWidth: 0,
                  width: 'auto',
                  fontWeight: 400,
                  outline: 'none',
                  height: 24
                }}
              >
                {SUPPORTED_ALGORITHMS.map(alg => (
                  <option key={alg.value} value={alg.value}>
                    {alg.label}
                  </option>
                ))}
              </select>
              <div style={{ width: 1, height: 18, background: '#ced4da', margin: 0 }} />
              <button
                className="btn btn-secondary"
                style={{
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #ced4da',
                  borderRadius: '0 4px 4px 0',
                  borderLeft: 'none',
                  fontSize: '12px',
                  padding: '4px 14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  margin: 0,
                  height: 24
                }}
                onClick={() => {
                  generateExample();
                }}
              >
                Insert
              </button>
            </div>
          </div>
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
          {/* JWT Example dropdown for Encoder at the top, styled small and left-aligned */}
          <div className="example-section-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: 0, marginBottom: 16, padding: 0 }}>
            <label style={{ fontSize: '12px', color: '#333', marginRight: 6 }}>JWT Example:</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <select
                className="form-select"
                value={selectedAlg}
                onChange={(e) => {
                  setSelectedAlg(e.target.value);
                }}
                style={{
                  fontSize: '12px',
                  padding: '2px 18px 2px 6px',
                  border: '1px solid #ced4da',
                  borderRight: 'none',
                  borderRadius: '4px 0 0 4px',
                  background: '#fff',
                  color: '#333',
                  minWidth: 0,
                  width: 'auto',
                  fontWeight: 400,
                  outline: 'none',
                  height: 24
                }}
              >
                {SUPPORTED_ALGORITHMS.map(alg => (
                  <option key={alg.value} value={alg.value}>
                    {alg.label}
                  </option>
                ))}
              </select>
              <div style={{ width: 1, height: 18, background: '#ced4da', margin: 0 }} />
              <button
                className="btn btn-secondary"
                style={{
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #ced4da',
                  borderRadius: '0 4px 4px 0',
                  borderLeft: 'none',
                  fontSize: '12px',
                  padding: '4px 14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  margin: 0,
                  height: 24
                }}
                onClick={() => {
                  generateExample();
                }}
              >
                Insert
              </button>
            </div>
          </div>
          <JWTEncoder ref={encoderRef} onEncryptToken={switchToJweEncrypt} />
        </div>
        <div style={{ display: activeTab === 'jwe-encrypt' ? 'block' : 'none' }}>
          <JWEEncrypt initialJwt={jweEncryptJwt} />
        </div>
        <div style={{ display: activeTab === 'jwe-decrypt' ? 'block' : 'none' }}>
          <JWEDecrypt />
        </div>
      </div>
    </div>
  );
};

export default JWTDebugger; 