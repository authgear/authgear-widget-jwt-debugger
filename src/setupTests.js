import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'text-encoding';

// Mock TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Import crypto polyfill for tests
import './utils/cryptoPolyfill';

// Mock window.crypto for tests
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      generateKey: jest.fn(),
      exportKey: jest.fn(),
      importKey: jest.fn(),
      sign: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])), // Mock signature
      verify: jest.fn(),
    },
  },
  writable: true,
});

// Mock jose library
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock.jwt.token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({ payload: { sub: 'test-user' } }),
  importPKCS8: jest.fn().mockResolvedValue('mock-private-key'),
  importSPKI: jest.fn().mockResolvedValue('mock-public-key'),
  importJWK: jest.fn().mockResolvedValue('mock-jwk-key'),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
}); 