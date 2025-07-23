import { verifyJWTSignature } from '../../services/jwtVerification';
import * as jose from 'jose';

// Mock jose library
jest.mock('jose');

describe('JWT Verification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyJWTSignature', () => {
    const mockDecodedJWT = {
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { sub: 'test-user', iat: 1640995200 },
      signature: 'mock-signature'
    };

    const mockJWTToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE2NDA5OTUyMDB9.mock-signature';

    describe('HS Algorithms', () => {
      test('should verify HS256 signature with UTF-8 secret', async () => {
        const secret = 'test-secret';
        const result = await verifyJWTSignature(
          mockDecodedJWT,
          mockJWTToken,
          secret,
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result).toEqual({
          valid: false,
          algorithm: 'HS256'
        });
      });

      test('should verify HS256 signature with base64url secret', async () => {
        const secret = 'dGVzdC1zZWNyZXQ='; // base64url encoded 'test-secret'
        const result = await verifyJWTSignature(
          mockDecodedJWT,
          mockJWTToken,
          secret,
          '',
          '',
          'base64url',
          'pem'
        );

        expect(result).toEqual({
          valid: false,
          algorithm: 'HS256'
        });
      });

      test('should verify HS384 signature', async () => {
        const decodedJWT = { ...mockDecodedJWT, header: { alg: 'HS384', typ: 'JWT' } };
        const secret = 'test-secret';
        
        const result = await verifyJWTSignature(
          decodedJWT,
          mockJWTToken,
          secret,
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result).toEqual({
          valid: false,
          algorithm: 'HS384'
        });
      });

      test('should verify HS512 signature', async () => {
        const decodedJWT = { ...mockDecodedJWT, header: { alg: 'HS512', typ: 'JWT' } };
        const secret = 'test-secret';
        
        const result = await verifyJWTSignature(
          decodedJWT,
          mockJWTToken,
          secret,
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result).toEqual({
          valid: false,
          algorithm: 'HS512'
        });
      });

      test('should return null when no secret provided', async () => {
        const result = await verifyJWTSignature(
          mockDecodedJWT,
          mockJWTToken,
          '',
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result).toBeNull();
      });

      test('should handle invalid signature', async () => {
        const secret = 'test-secret';
        const invalidDecodedJWT = {
          ...mockDecodedJWT,
          signature: 'invalid-signature'
        };
        
        const result = await verifyJWTSignature(
          invalidDecodedJWT,
          mockJWTToken,
          secret,
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result.valid).toBe(false);
        expect(result.algorithm).toBe('HS256');
      });
    });

    describe('RS Algorithms', () => {
      const rsDecodedJWT = {
        header: { alg: 'RS256', typ: 'JWT' },
        payload: { sub: 'test-user', iat: 1640995200 },
        signature: 'mock-signature'
      };

      test('should verify RS256 signature with PEM public key', async () => {
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          rsDecodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(jose.importSPKI).toHaveBeenCalledWith(publicKey, 'RS256');
        expect(jose.jwtVerify).toHaveBeenCalledWith(mockJWTToken, 'mock-public-key');
        expect(result).toEqual({
          valid: true,
          algorithm: 'RS256',
          payload: { sub: 'test-user', iat: 1640995200 }
        });
      });

      test('should verify RS384 signature with PEM public key', async () => {
        const decodedJWT = { ...rsDecodedJWT, header: { alg: 'RS384', typ: 'JWT' } };
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          decodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(jose.importSPKI).toHaveBeenCalledWith(publicKey, 'RS384');
        expect(result.valid).toBe(true);
        expect(result.algorithm).toBe('RS384');
      });

      test('should verify RS512 signature with PEM public key', async () => {
        const decodedJWT = { ...rsDecodedJWT, header: { alg: 'RS512', typ: 'JWT' } };
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          decodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(jose.importSPKI).toHaveBeenCalledWith(publicKey, 'RS512');
        expect(result.valid).toBe(true);
        expect(result.algorithm).toBe('RS512');
      });

      test('should verify RS256 signature with JWK', async () => {
        const jwkEndpoint = JSON.stringify({
          kty: 'RSA',
          n: 'mock-n',
          e: 'mock-e'
        });
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          rsDecodedJWT,
          mockJWTToken,
          '',
          '',
          jwkEndpoint,
          'utf8',
          'jwk'
        );

        expect(jose.importJWK).toHaveBeenCalledWith(JSON.parse(jwkEndpoint), 'RS256');
        expect(result.valid).toBe(true);
      });

      test('should return null when no public key provided for PEM', async () => {
        const result = await verifyJWTSignature(
          rsDecodedJWT,
          mockJWTToken,
          '',
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result).toBeNull();
      });

      test('should return null when no JWK provided for JWK', async () => {
        const result = await verifyJWTSignature(
          rsDecodedJWT,
          mockJWTToken,
          '',
          '',
          '',
          'utf8',
          'jwk'
        );

        expect(result).toBeNull();
      });

      test('should handle invalid JWK JSON', async () => {
        const invalidJwk = 'invalid-json';
        
        const result = await verifyJWTSignature(
          rsDecodedJWT,
          mockJWTToken,
          '',
          '',
          invalidJwk,
          'utf8',
          'jwk'
        );

        expect(result.type).toBe('SIGNATURE_VERIFICATION');
        expect(result.message).toContain('Invalid JWK JSON');
      });

      test('should handle verification errors', async () => {
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        const error = new Error('Verification failed');
        
        jose.jwtVerify.mockRejectedValue(error);

        const result = await verifyJWTSignature(
          rsDecodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(result.type).toBe('SIGNATURE_VERIFICATION');
        expect(result.message).toContain('Verification failed');
      });
    });

    describe('ES Algorithms', () => {
      const esDecodedJWT = {
        header: { alg: 'ES256', typ: 'JWT' },
        payload: { sub: 'test-user', iat: 1640995200 },
        signature: 'mock-signature'
      };

      test('should verify ES256 signature with PEM public key', async () => {
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          esDecodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(jose.importSPKI).toHaveBeenCalledWith(publicKey, 'ES256');
        expect(jose.jwtVerify).toHaveBeenCalledWith(mockJWTToken, 'mock-public-key');
        expect(result).toEqual({
          valid: true,
          algorithm: 'ES256',
          payload: { sub: 'test-user', iat: 1640995200 }
        });
      });

      test('should verify ES384 signature with PEM public key', async () => {
        const decodedJWT = { ...esDecodedJWT, header: { alg: 'ES384', typ: 'JWT' } };
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          decodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(jose.importSPKI).toHaveBeenCalledWith(publicKey, 'ES384');
        expect(result.valid).toBe(true);
        expect(result.algorithm).toBe('ES384');
      });

      test('should verify ES512 signature with PEM public key', async () => {
        const decodedJWT = { ...esDecodedJWT, header: { alg: 'ES512', typ: 'JWT' } };
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          decodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(jose.importSPKI).toHaveBeenCalledWith(publicKey, 'ES512');
        expect(result.valid).toBe(true);
        expect(result.algorithm).toBe('ES512');
      });

      test('should verify ES256 signature with JWK', async () => {
        const jwkEndpoint = JSON.stringify({
          kty: 'EC',
          crv: 'P-256',
          x: 'mock-x',
          y: 'mock-y'
        });
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200 }
        });

        const result = await verifyJWTSignature(
          esDecodedJWT,
          mockJWTToken,
          '',
          '',
          jwkEndpoint,
          'utf8',
          'jwk'
        );

        expect(jose.importJWK).toHaveBeenCalledWith(JSON.parse(jwkEndpoint), 'ES256');
        expect(result.valid).toBe(true);
      });

      test('should handle ES verification errors', async () => {
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----';
        const error = new Error('ES verification failed');
        
        jose.jwtVerify.mockRejectedValue(error);

        const result = await verifyJWTSignature(
          esDecodedJWT,
          mockJWTToken,
          '',
          publicKey,
          '',
          'utf8',
          'pem'
        );

        expect(result.type).toBe('SIGNATURE_VERIFICATION');
        expect(result.message).toContain('ES verification failed');
      });
    });

    describe('Error Handling', () => {
      test('should handle invalid decoded JWT', async () => {
        const result = await verifyJWTSignature(
          null,
          mockJWTToken,
          'secret',
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result).toBeNull();
      });

      test('should handle JWT with error', async () => {
        const errorJWT = { error: 'Invalid JWT' };
        const result = await verifyJWTSignature(
          errorJWT,
          mockJWTToken,
          'secret',
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result).toBeNull();
      });

      test('should handle unsupported algorithm', async () => {
        const unsupportedJWT = {
          header: { alg: 'UNSUPPORTED', typ: 'JWT' },
          payload: { sub: 'test-user' },
          signature: 'mock-signature'
        };

        const result = await verifyJWTSignature(
          unsupportedJWT,
          mockJWTToken,
          'secret',
          '',
          '',
          'utf8',
          'pem'
        );

        expect(result.type).toBe('SIGNATURE_VERIFICATION');
        expect(result.message).toContain('Unsupported algorithm');
      });
    });
  });
}); 