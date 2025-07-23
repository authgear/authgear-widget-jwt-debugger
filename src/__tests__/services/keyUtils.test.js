import {
  generateRSAKeyPair,
  generateECKeyPair,
  exportKeyPairToPEM,
  generateAndExportRSAKeyPair,
  generateAndExportECKeyPair,
  arrayBufferToPem
} from '../../services/keyUtils';

// Mock crypto.subtle
const mockCryptoSubtle = {
  generateKey: jest.fn(),
  exportKey: jest.fn(),
};

Object.defineProperty(window, 'crypto', {
  value: {
    subtle: mockCryptoSubtle,
  },
  writable: true,
});

describe('Key Generation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('arrayBufferToPem', () => {
    test('should convert ArrayBuffer to PEM format', () => {
      const mockBuffer = new ArrayBuffer(8);
      const mockUint8Array = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]); // "ABCDEFGH"
      
      // Mock btoa to return a predictable result
      const originalBtoa = window.btoa;
      window.btoa = jest.fn().mockReturnValue('QUJDREVGR0g=');
      
      const result = arrayBufferToPem(mockBuffer, 'TEST');
      
      expect(result).toContain('-----BEGIN TEST KEY-----');
      expect(result).toContain('QUJDREVGR0g=');
      expect(result).toContain('-----END TEST KEY-----');
      
      // Restore original btoa
      window.btoa = originalBtoa;
    });
  });

  describe('generateRSAKeyPair', () => {
    test('should generate RSA key pair with correct parameters', async () => {
      const mockKeyPair = {
        privateKey: 'mock-private-key',
        publicKey: 'mock-public-key',
      };
      
      mockCryptoSubtle.generateKey.mockResolvedValue(mockKeyPair);
      
      const result = await generateRSAKeyPair();
      
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: 'SHA-256' },
        },
        true,
        ['sign', 'verify']
      );
      expect(result).toEqual(mockKeyPair);
    });

    test('should handle generation errors', async () => {
      const error = new Error('Key generation failed');
      mockCryptoSubtle.generateKey.mockRejectedValue(error);
      
      await expect(generateRSAKeyPair()).rejects.toThrow('Key generation failed');
    });
  });

  describe('generateECKeyPair', () => {
    test('should generate ES256 key pair with P-256 curve', async () => {
      const mockKeyPair = {
        privateKey: 'mock-ec-private-key',
        publicKey: 'mock-ec-public-key',
      };
      
      mockCryptoSubtle.generateKey.mockResolvedValue(mockKeyPair);
      
      const result = await generateECKeyPair('ES256');
      
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify']
      );
      expect(result).toEqual(mockKeyPair);
    });

    test('should generate ES384 key pair with P-384 curve', async () => {
      const mockKeyPair = {
        privateKey: 'mock-ec-private-key',
        publicKey: 'mock-ec-public-key',
      };
      
      mockCryptoSubtle.generateKey.mockResolvedValue(mockKeyPair);
      
      const result = await generateECKeyPair('ES384');
      
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'ECDSA',
          namedCurve: 'P-384',
        },
        true,
        ['sign', 'verify']
      );
      expect(result).toEqual(mockKeyPair);
    });

    test('should generate ES512 key pair with P-521 curve', async () => {
      const mockKeyPair = {
        privateKey: 'mock-ec-private-key',
        publicKey: 'mock-ec-public-key',
      };
      
      mockCryptoSubtle.generateKey.mockResolvedValue(mockKeyPair);
      
      const result = await generateECKeyPair('ES512');
      
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'ECDSA',
          namedCurve: 'P-521',
        },
        true,
        ['sign', 'verify']
      );
      expect(result).toEqual(mockKeyPair);
    });

    test('should default to P-256 for unknown algorithms', async () => {
      const mockKeyPair = {
        privateKey: 'mock-ec-private-key',
        publicKey: 'mock-ec-public-key',
      };
      
      mockCryptoSubtle.generateKey.mockResolvedValue(mockKeyPair);
      
      const result = await generateECKeyPair('UNKNOWN');
      
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify']
      );
      expect(result).toEqual(mockKeyPair);
    });

    test('should handle generation errors', async () => {
      const error = new Error('EC key generation failed');
      mockCryptoSubtle.generateKey.mockRejectedValue(error);
      
      await expect(generateECKeyPair('ES256')).rejects.toThrow('EC key generation failed');
    });
  });

  describe('exportKeyPairToPEM', () => {
    test('should export key pair to PEM format', async () => {
      const mockKeyPair = {
        privateKey: 'mock-private-key',
        publicKey: 'mock-public-key',
      };
      
      const mockPrivateKeyBuffer = new ArrayBuffer(8);
      const mockPublicKeyBuffer = new ArrayBuffer(8);
      
      mockCryptoSubtle.exportKey
        .mockResolvedValueOnce(mockPrivateKeyBuffer)
        .mockResolvedValueOnce(mockPublicKeyBuffer);
      
      // Mock btoa
      const originalBtoa = window.btoa;
      window.btoa = jest.fn().mockReturnValue('MOCKBASE64');
      
      const result = await exportKeyPairToPEM(mockKeyPair);
      
      expect(mockCryptoSubtle.exportKey).toHaveBeenCalledWith('pkcs8', mockKeyPair.privateKey);
      expect(mockCryptoSubtle.exportKey).toHaveBeenCalledWith('spki', mockKeyPair.publicKey);
      expect(result).toEqual({
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCKBASE64\n-----END PRIVATE KEY-----',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMOCKBASE64\n-----END PUBLIC KEY-----',
      });
      
      // Restore original btoa
      window.btoa = originalBtoa;
    });

    test('should handle export errors', async () => {
      const mockKeyPair = {
        privateKey: 'mock-private-key',
        publicKey: 'mock-public-key',
      };
      
      const error = new Error('Export failed');
      mockCryptoSubtle.exportKey.mockRejectedValue(error);
      
      await expect(exportKeyPairToPEM(mockKeyPair)).rejects.toThrow('Export failed');
    });
  });

  describe('generateAndExportRSAKeyPair', () => {
    test('should generate and export RSA key pair', async () => {
      const mockKeyPair = {
        privateKey: 'mock-private-key',
        publicKey: 'mock-public-key',
      };
      
      const mockPrivateKeyBuffer = new ArrayBuffer(8);
      const mockPublicKeyBuffer = new ArrayBuffer(8);
      
      mockCryptoSubtle.generateKey.mockResolvedValue(mockKeyPair);
      mockCryptoSubtle.exportKey
        .mockResolvedValueOnce(mockPrivateKeyBuffer)
        .mockResolvedValueOnce(mockPublicKeyBuffer);
      
      // Mock btoa
      const originalBtoa = window.btoa;
      window.btoa = jest.fn().mockReturnValue('MOCKBASE64');
      
      const result = await generateAndExportRSAKeyPair();
      
      expect(result).toEqual({
        keyPair: mockKeyPair,
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCKBASE64\n-----END PRIVATE KEY-----',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMOCKBASE64\n-----END PUBLIC KEY-----',
      });
      
      // Restore original btoa
      window.btoa = originalBtoa;
    });
  });

  describe('generateAndExportECKeyPair', () => {
    test('should generate and export EC key pair for ES256', async () => {
      const mockKeyPair = {
        privateKey: 'mock-ec-private-key',
        publicKey: 'mock-ec-public-key',
      };
      
      const mockPrivateKeyBuffer = new ArrayBuffer(8);
      const mockPublicKeyBuffer = new ArrayBuffer(8);
      
      mockCryptoSubtle.generateKey.mockResolvedValue(mockKeyPair);
      mockCryptoSubtle.exportKey
        .mockResolvedValueOnce(mockPrivateKeyBuffer)
        .mockResolvedValueOnce(mockPublicKeyBuffer);
      
      // Mock btoa
      const originalBtoa = window.btoa;
      window.btoa = jest.fn().mockReturnValue('MOCKBASE64');
      
      const result = await generateAndExportECKeyPair('ES256');
      
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify']
      );
      expect(result).toEqual({
        keyPair: mockKeyPair,
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCKBASE64\n-----END PRIVATE KEY-----',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMOCKBASE64\n-----END PUBLIC KEY-----',
      });
      
      // Restore original btoa
      window.btoa = originalBtoa;
    });

    test('should handle errors in generation and export', async () => {
      const error = new Error('EC key generation failed');
      mockCryptoSubtle.generateKey.mockRejectedValue(error);
      
      await expect(generateAndExportECKeyPair('ES256')).rejects.toThrow('EC key generation failed');
    });
  });
}); 