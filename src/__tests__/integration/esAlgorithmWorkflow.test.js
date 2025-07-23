import { generateExampleJWT } from '../../services/exampleGenerator';
import { verifyJWTSignature } from '../../services/jwtVerification';
import * as jose from 'jose';
import * as keyUtils from '../../services/keyUtils';

// Mock jose for integration test
jest.mock('jose');
jest.mock('../../services/keyUtils');

describe('ES Algorithm Integration Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock keyUtils functions
    const mockKeyPair = {
      privateKey: 'mock-private-key',
      publicKey: 'mock-public-key',
    };
    
    const mockPemKeys = {
      privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
      publicKey: '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----',
    };
    
    keyUtils.generateECKeyPair.mockResolvedValue(mockKeyPair);
    keyUtils.exportKeyPairToPEM.mockResolvedValue(mockPemKeys);
  });

  describe('Complete ES256 Workflow', () => {
    test('should generate and verify ES256 JWT end-to-end', async () => {
      // Mock the jose library for this integration test
      const mockPrivateKey = 'mock-private-key';
      const mockPublicKey = 'mock-public-key';
      const mockJWT = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE2NDA5OTUyMCwiZXhwIjoxNjQwOTk4ODAwfQ.mock-signature';
      
      jose.SignJWT.mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockJWT),
      }));
      
      jose.jwtVerify.mockResolvedValue({
        payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 }
      });
      
      jose.importPKCS8.mockResolvedValue(mockPrivateKey);
      jose.importSPKI.mockResolvedValue(mockPublicKey);

      // Step 1: Generate ES256 JWT with key pair
      const { jwt, generatedPublicKey, generatedPrivateKey } = await generateExampleJWT('ES256');
      
      expect(jwt).toBe(mockJWT);
      expect(generatedPublicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(generatedPrivateKey).toContain('-----BEGIN PRIVATE KEY-----');

      // Step 2: Verify the generated JWT
      const decodedJWT = {
        header: { alg: 'ES256', typ: 'JWT' },
        payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 },
        signature: 'mock-signature'
      };

      const verificationResult = await verifyJWTSignature(
        decodedJWT,
        jwt,
        '',
        generatedPublicKey,
        '',
        'utf8',
        'pem'
      );

      expect(verificationResult.valid).toBe(true);
      expect(verificationResult.algorithm).toBe('ES256');
      expect(verificationResult.payload).toEqual({
        sub: 'test-user',
        iat: 1640995200,
        exp: 1640998800
      });
    });
  });

  describe('Complete ES384 Workflow', () => {
    test('should generate and verify ES384 JWT end-to-end', async () => {
      const mockJWT = 'eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE2NDA5OTUyMCwiZXhwIjoxNjQwOTk4ODAwfQ.mock-signature';
      
      jose.SignJWT.mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockJWT),
      }));
      
      jose.jwtVerify.mockResolvedValue({
        payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 }
      });
      
      jose.importPKCS8.mockResolvedValue('mock-private-key');
      jose.importSPKI.mockResolvedValue('mock-public-key');

      // Generate ES384 JWT
      const { jwt, generatedPublicKey } = await generateExampleJWT('ES384');
      
      expect(jwt).toBe(mockJWT);
      expect(generatedPublicKey).toContain('-----BEGIN PUBLIC KEY-----');

      // Verify the JWT
      const decodedJWT = {
        header: { alg: 'ES384', typ: 'JWT' },
        payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 },
        signature: 'mock-signature'
      };

      const verificationResult = await verifyJWTSignature(
        decodedJWT,
        jwt,
        '',
        generatedPublicKey,
        '',
        'utf8',
        'pem'
      );

      expect(verificationResult.valid).toBe(true);
      expect(verificationResult.algorithm).toBe('ES384');
    });
  });

  describe('Complete ES512 Workflow', () => {
    test('should generate and verify ES512 JWT end-to-end', async () => {
      const mockJWT = 'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE2NDA5OTUyMCwiZXhwIjoxNjQwOTk4ODAwfQ.mock-signature';
      
      jose.SignJWT.mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockJWT),
      }));
      
      jose.jwtVerify.mockResolvedValue({
        payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 }
      });
      
      jose.importPKCS8.mockResolvedValue('mock-private-key');
      jose.importSPKI.mockResolvedValue('mock-public-key');

      // Generate ES512 JWT
      const { jwt, generatedPublicKey } = await generateExampleJWT('ES512');
      
      expect(jwt).toBe(mockJWT);
      expect(generatedPublicKey).toContain('-----BEGIN PUBLIC KEY-----');

      // Verify the JWT
      const decodedJWT = {
        header: { alg: 'ES512', typ: 'JWT' },
        payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 },
        signature: 'mock-signature'
      };

      const verificationResult = await verifyJWTSignature(
        decodedJWT,
        jwt,
        '',
        generatedPublicKey,
        '',
        'utf8',
        'pem'
      );

      expect(verificationResult.valid).toBe(true);
      expect(verificationResult.algorithm).toBe('ES512');
    });
  });

  describe('Cross-Algorithm Compatibility', () => {
    test('should handle switching between different ES algorithms', async () => {
      const algorithms = ['ES256', 'ES384', 'ES512'];
      
      for (const algorithm of algorithms) {
        const mockJWT = `eyJhbGciOiJF${algorithm.slice(2)}IsInR5cCI6IkpXVCJ9.mock-signature`;
        
        jose.SignJWT.mockImplementation(() => ({
          setProtectedHeader: jest.fn().mockReturnThis(),
          setIssuedAt: jest.fn().mockReturnThis(),
          setExpirationTime: jest.fn().mockReturnThis(),
          sign: jest.fn().mockResolvedValue(mockJWT),
        }));
        
        jose.jwtVerify.mockResolvedValue({
          payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 }
        });
        
        jose.importPKCS8.mockResolvedValue('mock-private-key');
        jose.importSPKI.mockResolvedValue('mock-public-key');

        // Generate JWT for current algorithm
        const { jwt, generatedPublicKey } = await generateExampleJWT(algorithm);
        
        expect(jwt).toBe(mockJWT);
        expect(generatedPublicKey).toContain('-----BEGIN PUBLIC KEY-----');

        // Verify the JWT
        const decodedJWT = {
          header: { alg: algorithm, typ: 'JWT' },
          payload: { sub: 'test-user', iat: 1640995200, exp: 1640998800 },
          signature: 'mock-signature'
        };

        const verificationResult = await verifyJWTSignature(
          decodedJWT,
          jwt,
          '',
          generatedPublicKey,
          '',
          'utf8',
          'pem'
        );

        expect(verificationResult.valid).toBe(true);
        expect(verificationResult.algorithm).toBe(algorithm);
      }
    });
  });

  describe('Error Handling in Integration', () => {
    test('should handle invalid public key in verification', async () => {
      const mockJWT = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.mock-signature';
      
      jose.SignJWT.mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockJWT),
      }));
      
      jose.importPKCS8.mockResolvedValue('mock-private-key');
      jose.importSPKI.mockResolvedValue('mock-public-key');
      jose.jwtVerify.mockRejectedValue(new Error('Invalid signature'));

      // Generate ES256 JWT
      const { jwt, generatedPublicKey } = await generateExampleJWT('ES256');
      
      expect(jwt).toBe(mockJWT);
      expect(generatedPublicKey).toContain('-----BEGIN PUBLIC KEY-----');

      // Try to verify with invalid key
      const decodedJWT = {
        header: { alg: 'ES256', typ: 'JWT' },
        payload: { sub: 'test-user' },
        signature: 'mock-signature'
      };

      const verificationResult = await verifyJWTSignature(
        decodedJWT,
        jwt,
        '',
        'invalid-public-key',
        '',
        'utf8',
        'pem'
      );

      expect(verificationResult.type).toBe('SIGNATURE_VERIFICATION');
      expect(verificationResult.message).toContain('Invalid signature');
    });
  });
}); 