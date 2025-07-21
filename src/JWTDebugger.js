import React, { useState, useCallback, useMemo, useRef } from 'react';
import { decodeJWT } from './utils';
import { verifyJWTSignature } from './services/jwtVerification';
import { generateExampleJWT } from './services/exampleGenerator';
import TabNavigation from './components/TabNavigation';
import JWTTokenInput from './components/JWTTokenInput';
import DecodedSections from './components/DecodedSections';
import SignatureVerification from './components/SignatureVerification';
import JWTEncoder from './components/JWTEncoder';

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
  const encoderRef = useRef();

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
    if (activeTab === 'decoder') {
      if (selectedAlg.startsWith('RS')) {
        // Generate key pair, then pass to generateExampleJWT so JWT and public key match
        const keyPair = await window.crypto.subtle.generateKey(
          { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: { name: 'SHA-256' } },
          true,
          ['sign', 'verify']
        );
        const { jwt: realJwt, generatedPublicKey } = await generateExampleJWT(selectedAlg, keyPair);
        setJwtToken(realJwt);
        setSecret('');
        setPublicKey(generatedPublicKey);
      } else {
        setJwtToken(jwt);
        if (selectedAlg.startsWith('HS')) {
          setSecret(generatedSecret);
        } else {
          setSecret('');
          setPublicKey('');
        }
      }
    } else if (activeTab === 'encoder' && encoderRef.current) {
      let header = JSON.stringify({ alg: selectedAlg, typ: 'JWT' }, null, 2);
      let payload = JSON.stringify({ sub: 'uid_12345', name: 'John Doe', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (60 * 60) }, null, 2);
      let secret = '';
      if (selectedAlg.startsWith('HS')) {
        switch (selectedAlg) {
          case 'HS256': secret = 'your-256-bit-secret'; break;
          case 'HS384': secret = 'your-384-bit-secret'; break;
          case 'HS512': secret = 'your-512-bit-secret'; break;
          default: secret = 'your-secret';
        }
      } else if (selectedAlg.startsWith('RS')) {
        // Generate a real RSA private key as PEM
        const keyPair = await window.crypto.subtle.generateKey(
          { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: { name: 'SHA-256' } },
          true,
          ['sign', 'verify']
        );
        const exported = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        // Convert ArrayBuffer to PEM
        const b64 = window.btoa(String.fromCharCode(...new Uint8Array(exported)));
        const pem = '-----BEGIN PRIVATE KEY-----\n' + b64.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----';
        secret = pem;
      } else {
        secret = '';
      }
      encoderRef.current.setExampleData(header, payload, secret);
    }
  }, [selectedAlg, activeTab]);

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
        <div style={{ display: activeTab === 'decoder' ? 'block' : 'none' }}>
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
        </div>
        <div style={{ display: activeTab === 'encoder' ? 'block' : 'none' }}>
          <JWTEncoder ref={encoderRef} />
        </div>
      </div>
    </div>
  );
};

export default JWTDebugger; 