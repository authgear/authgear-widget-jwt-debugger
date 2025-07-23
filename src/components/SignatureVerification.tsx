import React from 'react';

interface SecretConfig {
  value: string;
  setValue: (value: string) => void;
  encoding: string;
  setEncoding: (value: string) => void;
}

interface PublicKeyConfig {
  value: string;
  setValue: (value: string) => void;
  jwkValue: string;
  setJwkValue: (value: string) => void;
  type: string;
  setType: (value: string) => void;
}

interface SignatureVerificationProps {
  algorithm: string;
  secretConfig: SecretConfig;
  publicKeyConfig: PublicKeyConfig;
}

const SignatureVerification: React.FC<SignatureVerificationProps> = ({ 
  algorithm,
  secretConfig,
  publicKeyConfig
}) => {
  const { value: secret, setValue: setSecret, encoding: secretEncoding, setEncoding: setSecretEncoding } = secretConfig;
  const { value: publicKey, setValue: setPublicKey, jwkValue: jwkEndpoint, setJwkValue: setJwkEndpoint, type: keyType, setType: setKeyType } = publicKeyConfig;

  return (
    <div className="content-panel" style={{ marginTop: '24px' }}>
      <div className="input-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="form-label">
          JWT Signature Verification: {algorithm.startsWith('HS') ? 'Secret' : 'Public Key'}
        </label>
        {secret && (
          <span className="status-indicator status-valid">
            ✓ Valid secret
          </span>
        )}
      </div>
      <div className="panel-content">
        <>
          {algorithm.startsWith('HS') && (
            <>
              <div className="form-group">
                <div className="input-container">
                  <textarea
                    className="form-input"
                    placeholder="Enter a secret to verify the JWT signature"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    rows={4}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label className="form-label" style={{ marginRight: 8, marginBottom: 0 }}>Algorithm:</label>
                    <span style={{ fontWeight: 'bold', marginRight: 16 }}>{algorithm}</span>
                  </div>
                  <div className="form-group-inline" style={{ display: 'flex', alignItems: 'flex-end', marginTop: 0 }}>
                    <label className="form-label" style={{ marginRight: 8, marginBottom: 0 }}>Encoding Format</label>
                    <div className="radio-group" style={{ marginBottom: 0 }}>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="utf8"
                          name="encoding"
                          value="utf8"
                          checked={secretEncoding === 'utf8'}
                          onChange={(e) => setSecretEncoding(e.target.value)}
                        />
                        <label htmlFor="utf8">UTF-8</label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="base64url"
                          name="encoding"
                          value="base64url"
                          checked={secretEncoding === 'base64url'}
                          onChange={(e) => setSecretEncoding(e.target.value)}
                        />
                        <label htmlFor="base64url">base64url</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {(algorithm.startsWith('RS') || algorithm.startsWith('ES')) && (
            <>
              {keyType === 'pem' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <textarea
                    className="form-input"
                    placeholder="Enter PEM public key"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {keyType === 'jwk' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <textarea
                    className="form-input"
                    placeholder="Paste JWK JSON here"
                    value={jwkEndpoint}
                    onChange={(e) => setJwkEndpoint(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label className="form-label" style={{ marginRight: 8, marginBottom: 0 }}>Algorithm:</label>
                  <span style={{ fontWeight: 'bold', marginRight: 16 }}>{algorithm}</span>
                </div>
                <div className="form-group-inline" style={{ display: 'flex', alignItems: 'flex-end', marginTop: 0 }}>
                  <label className="form-label" style={{ marginRight: 8, marginBottom: 0 }}>Key Type</label>
                  <div className="radio-group" style={{ marginBottom: 0 }}>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="pem"
                        name="keyType"
                        value="pem"
                        checked={keyType === 'pem'}
                        onChange={(e) => setKeyType(e.target.value)}
                      />
                      <label htmlFor="pem">PEM</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="jwk"
                        name="keyType"
                        value="jwk"
                        checked={keyType === 'jwk'}
                        onChange={(e) => setKeyType(e.target.value)}
                      />
                      <label htmlFor="jwk">JWK</label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default SignatureVerification; 