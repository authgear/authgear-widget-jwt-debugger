import * as jose from 'jose';

// Generate example JWT
export const generateExampleJWT = async (selectedAlg) => {
  try {
    const header = {
      alg: selectedAlg,
      typ: 'JWT'
    };

    const payload = {
      sub: 'uid_12345',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
    };

    let jwt;
    let generatedSecret = '';
    
    if (selectedAlg.startsWith('HS')) {
      generatedSecret = 'your-256-bit-secret';
      const secret = new TextEncoder().encode(generatedSecret);
      jwt = await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
    } else if (selectedAlg.startsWith('RS')) {
      // For demo purposes, we'll create a simple example for each RS* alg
      let algExample = '';
      switch (selectedAlg) {
        case 'RS256':
          algExample = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWRfMTIzNDUiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE3MzU2MTM0M30.example-signature-would-be-here';
          break;
        case 'RS384':
          algExample = 'eyJhbGciOiJSUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWRfMTIzNDUiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE3MzU2MTM0M30.example-signature-would-be-here';
          break;
        case 'RS512':
          algExample = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWRfMTIzNDUiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE3MzU2MTM0M30.example-signature-would-be-here';
          break;
        default:
          algExample = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWRfMTIzNDUiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE3MzU2MTM0M30.example-signature-would-be-here';
      }
      jwt = algExample;
      generatedSecret = `${selectedAlg} example - requires actual private key for verification`;
    }

    return { jwt, generatedSecret };
  } catch (error) {
    console.error('Error generating example:', error);
    return { jwt: '', generatedSecret: '' };
  }
}; 