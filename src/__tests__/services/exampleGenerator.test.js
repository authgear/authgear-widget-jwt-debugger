import {
  generateExampleJWT,
  getDefaultJWTExampleData
} from '../../services/exampleGenerator';
import * as keyUtils from '../../services/keyUtils';

// Mock the keyUtils module
jest.mock('../../services/keyUtils');
jest.mock('jose');

describe('Example Generator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateExampleJWT', () => {
    describe('HS Algorithms', () => {
      test('should generate HS256 JWT with correct secret', async () => {
        const result = await generateExampleJWT('HS256');
        
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedSecret).toBe('your-256-bit-secret');
        expect(result.generatedPrivateKey).toBe('');
        expect(result.generatedPublicKey).toBe('');
        expect(result.keyPair).toBeUndefined();
      });

      test('should generate HS384 JWT with correct secret', async () => {
        const result = await generateExampleJWT('HS384');
        
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedSecret).toBe('your-384-bit-secret');
        expect(result.generatedPrivateKey).toBe('');
        expect(result.generatedPublicKey).toBe('');
      });

      test('should generate HS512 JWT with correct secret', async () => {
        const result = await generateExampleJWT('HS512');
        
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedSecret).toBe('your-512-bit-secret');
        expect(result.generatedPrivateKey).toBe('');
        expect(result.generatedPublicKey).toBe('');
      });

      test('should handle unknown HS algorithm with default secret', async () => {
        const result = await generateExampleJWT('HS128');
        
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedSecret).toBe('your-secret');
        expect(result.generatedPrivateKey).toBe('');
        expect(result.generatedPublicKey).toBe('');
      });
    });

    describe('RS Algorithms', () => {
      const mockKeyPair = {
        privateKey: 'mock-private-key',
        publicKey: 'mock-public-key',
      };
      
      const mockPemKeys = {
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----',
      };

      beforeEach(() => {
        keyUtils.generateRSAKeyPair.mockResolvedValue(mockKeyPair);
        keyUtils.exportKeyPairToPEM.mockResolvedValue(mockPemKeys);
      });

      test('should generate RS256 JWT with generated key pair', async () => {
        const result = await generateExampleJWT('RS256');
        
        expect(keyUtils.generateRSAKeyPair).toHaveBeenCalled();
        expect(keyUtils.exportKeyPairToPEM).toHaveBeenCalledWith(mockKeyPair);
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedSecret).toBe('');
        expect(result.generatedPrivateKey).toBe(mockPemKeys.privateKey);
        expect(result.generatedPublicKey).toBe(mockPemKeys.publicKey);
        expect(result.keyPair).toEqual(mockKeyPair);
      });

      test('should generate RS384 JWT with generated key pair', async () => {
        const result = await generateExampleJWT('RS384');
        
        expect(keyUtils.generateRSAKeyPair).toHaveBeenCalled();
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedPrivateKey).toBe(mockPemKeys.privateKey);
        expect(result.generatedPublicKey).toBe(mockPemKeys.publicKey);
      });

      test('should generate RS512 JWT with generated key pair', async () => {
        const result = await generateExampleJWT('RS512');
        
        expect(keyUtils.generateRSAKeyPair).toHaveBeenCalled();
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedPrivateKey).toBe(mockPemKeys.privateKey);
        expect(result.generatedPublicKey).toBe(mockPemKeys.publicKey);
      });

      test('should use provided key pair when available', async () => {
        const providedKeyPair = {
          privateKey: 'provided-private-key',
          publicKey: 'provided-public-key',
        };
        
        const result = await generateExampleJWT('RS256', providedKeyPair);
        
        expect(keyUtils.generateRSAKeyPair).not.toHaveBeenCalled();
        expect(keyUtils.exportKeyPairToPEM).toHaveBeenCalledWith(providedKeyPair);
        expect(result.keyPair).toEqual(providedKeyPair);
      });
    });

    describe('ES Algorithms', () => {
      const mockKeyPair = {
        privateKey: 'mock-ec-private-key',
        publicKey: 'mock-ec-public-key',
      };
      
      const mockPemKeys = {
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMOCK\n-----END PUBLIC KEY-----',
      };

      beforeEach(() => {
        keyUtils.generateECKeyPair.mockResolvedValue(mockKeyPair);
        keyUtils.exportKeyPairToPEM.mockResolvedValue(mockPemKeys);
      });

      test('should generate ES256 JWT with generated key pair', async () => {
        const result = await generateExampleJWT('ES256');
        
        expect(keyUtils.generateECKeyPair).toHaveBeenCalledWith('ES256');
        expect(keyUtils.exportKeyPairToPEM).toHaveBeenCalledWith(mockKeyPair);
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedSecret).toBe('');
        expect(result.generatedPrivateKey).toBe(mockPemKeys.privateKey);
        expect(result.generatedPublicKey).toBe(mockPemKeys.publicKey);
        expect(result.keyPair).toEqual(mockKeyPair);
      });

      test('should generate ES384 JWT with generated key pair', async () => {
        const result = await generateExampleJWT('ES384');
        
        expect(keyUtils.generateECKeyPair).toHaveBeenCalledWith('ES384');
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedPrivateKey).toBe(mockPemKeys.privateKey);
        expect(result.generatedPublicKey).toBe(mockPemKeys.publicKey);
      });

      test('should generate ES512 JWT with generated key pair', async () => {
        const result = await generateExampleJWT('ES512');
        
        expect(keyUtils.generateECKeyPair).toHaveBeenCalledWith('ES512');
        expect(result.jwt).toBe('mock.jwt.token');
        expect(result.generatedPrivateKey).toBe(mockPemKeys.privateKey);
        expect(result.generatedPublicKey).toBe(mockPemKeys.publicKey);
      });

      test('should use provided key pair when available for ES algorithms', async () => {
        const providedKeyPair = {
          privateKey: 'provided-ec-private-key',
          publicKey: 'provided-ec-public-key',
        };
        
        const result = await generateExampleJWT('ES256', providedKeyPair);
        
        expect(keyUtils.generateECKeyPair).not.toHaveBeenCalled();
        expect(keyUtils.exportKeyPairToPEM).toHaveBeenCalledWith(providedKeyPair);
        expect(result.keyPair).toEqual(providedKeyPair);
      });
    });

    describe('Error Handling', () => {
      test('should handle key generation errors', async () => {
        const error = new Error('Key generation failed');
        keyUtils.generateRSAKeyPair.mockRejectedValue(error);
        
        const result = await generateExampleJWT('RS256');
        expect(result.type).toBe('KEY_GENERATION');
        expect(result.message).toBe('Key generation failed');
      });

      test('should handle key export errors', async () => {
        const mockKeyPair = { privateKey: 'mock', publicKey: 'mock' };
        const error = new Error('Export failed');
        
        keyUtils.generateRSAKeyPair.mockResolvedValue(mockKeyPair);
        keyUtils.exportKeyPairToPEM.mockRejectedValue(error);
        
        const result = await generateExampleJWT('RS256');
        expect(result.type).toBe('KEY_GENERATION');
        expect(result.message).toBe('Export failed');
      });
    });
  });

  describe('getDefaultJWTExampleData', () => {
    beforeEach(() => {
      // Mock Date.now to return a predictable timestamp
      jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00 UTC
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should return correct data for HS256', () => {
      const result = getDefaultJWTExampleData('HS256');
      
      expect(result.header).toEqual({
        alg: 'HS256',
        typ: 'JWT'
      });
      expect(result.payload).toEqual({
        sub: 'uid_12345',
        name: 'John Doe',
        iat: 1640995200,
        exp: 1640998800 // iat + 3600
      });
      expect(result.secret).toBe('your-256-bit-secret');
    });

    test('should return correct data for HS384', () => {
      const result = getDefaultJWTExampleData('HS384');
      
      expect(result.header.alg).toBe('HS384');
      expect(result.secret).toBe('your-384-bit-secret');
    });

    test('should return correct data for HS512', () => {
      const result = getDefaultJWTExampleData('HS512');
      
      expect(result.header.alg).toBe('HS512');
      expect(result.secret).toBe('your-512-bit-secret');
    });

    test('should return correct data for RS256', () => {
      const result = getDefaultJWTExampleData('RS256');
      
      expect(result.header.alg).toBe('RS256');
      expect(result.secret).toBe('...'); // Placeholder for RSA
    });

    test('should return correct data for ES256', () => {
      const result = getDefaultJWTExampleData('ES256');
      
      expect(result.header.alg).toBe('ES256');
      expect(result.secret).toBe('...'); // Placeholder for EC
    });

    test('should return correct data for ES384', () => {
      const result = getDefaultJWTExampleData('ES384');
      
      expect(result.header.alg).toBe('ES384');
      expect(result.secret).toBe('...'); // Placeholder for EC
    });

    test('should return correct data for ES512', () => {
      const result = getDefaultJWTExampleData('ES512');
      
      expect(result.header.alg).toBe('ES512');
      expect(result.secret).toBe('...'); // Placeholder for EC
    });

    test('should handle unknown HS algorithm with default secret', () => {
      const result = getDefaultJWTExampleData('HS128');
      
      expect(result.header.alg).toBe('HS128');
      expect(result.secret).toBe('your-secret');
    });

    test('should handle unknown RS algorithm with placeholder secret', () => {
      const result = getDefaultJWTExampleData('RS128');
      
      expect(result.header.alg).toBe('RS128');
      expect(result.secret).toBe('...');
    });

    test('should handle unknown ES algorithm with placeholder secret', () => {
      const result = getDefaultJWTExampleData('ES128');
      
      expect(result.header.alg).toBe('ES128');
      expect(result.secret).toBe('...');
    });
  });
}); 