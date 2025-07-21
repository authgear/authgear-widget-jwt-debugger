import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { verifyJWTSignature } from '../services/jwtVerification';

export function useSignatureVerification(decodedJWT, jwtToken) {
  const [secret, setSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [jwkEndpoint, setJwkEndpoint] = useState('');
  const [secretEncoding, setSecretEncoding] = useState('utf8');
  const [keyType, setKeyType] = useState('pem');
  const [signatureResult, setSignatureResult] = useState(null);

  // Verify JWT signature
  const verifySignature = useCallback(async () => {
    return await verifyJWTSignature(decodedJWT, jwtToken, secret, publicKey, jwkEndpoint, secretEncoding, keyType);
  }, [decodedJWT, jwtToken, secret, publicKey, jwkEndpoint, secretEncoding, keyType]);

  // Verify signature when relevant data changes
  useEffect(() => {
    const verify = async () => {
      const result = await verifySignature();
      setSignatureResult(result);
    };
    verify();
  }, [verifySignature]);

  // Determine which algorithm to show
  const algorithm = useMemo(() => {
    if (decodedJWT && decodedJWT.header && decodedJWT.header.alg) {
      return decodedJWT.header.alg;
    }
    return 'HS256';
  }, [decodedJWT]);

  // Group related state setters
  const secretConfig = {
    value: secret,
    setValue: setSecret,
    encoding: secretEncoding,
    setEncoding: setSecretEncoding
  };

  const publicKeyConfig = {
    value: publicKey,
    setValue: setPublicKey,
    jwkValue: jwkEndpoint,
    setJwkValue: setJwkEndpoint,
    type: keyType,
    setType: setKeyType
  };

  return {
    algorithm,
    secretConfig,
    publicKeyConfig,
    signatureResult,
    verifySignature
  };
} 