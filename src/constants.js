// JWT Claim descriptions for tooltips
export const CLAIM_DESCRIPTIONS = {
  alg: 'Signature or encryption algorithm',
  typ: 'Token type',
  cty: 'Content Type',
  sub: 'Subject: Identifies the user of this JWT',
  iss: 'Issuer: Identifies the issuer of the JWT',
  aud: 'Audience: Identifies the recipients that the JWT is intended for',
  exp: 'Expiration time: The expiration time on or after which the JWT MUST NOT be accepted for processing in NumericDate type, representing seconds',
  nbf: 'Not Before: The time before which the JWT MUST NOT be accepted for processing in NumericDate type, representing seconds',
  iat: 'Issued At: The time at which the JWT was issued in NumericDate type, representing seconds',
  jti: 'JWT ID: A unique identifier for the JWT'
};

// Supported algorithms
export const SUPPORTED_ALGORITHMS = [
  { value: 'HS256', label: 'HS256' },
  { value: 'HS384', label: 'HS384' },
  { value: 'HS512', label: 'HS512' },
  { value: 'RS256', label: 'RS256' },
  { value: 'RS384', label: 'RS384' },
  { value: 'RS512', label: 'RS512' }
];

// Timestamp claim keys
export const TIMESTAMP_CLAIMS = ['iat', 'exp', 'nbf']; 