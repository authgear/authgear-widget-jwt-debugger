import React from 'react';

interface BrowserCompatibilityProps {
  children: React.ReactNode;
}

const BrowserCompatibility: React.FC<BrowserCompatibilityProps> = ({ children }) => {
  const [isCompatible, setIsCompatible] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Check for Web Crypto API support
    const hasWebCrypto = typeof window !== 'undefined' && 
                        window.crypto && 
                        window.crypto.subtle &&
                        typeof window.crypto.subtle.generateKey === 'function' &&
                        typeof window.crypto.subtle.importKey === 'function' &&
                        typeof window.crypto.subtle.sign === 'function' &&
                        typeof window.crypto.subtle.verify === 'function';

    setIsCompatible(hasWebCrypto);
  }, []);

  if (isCompatible === null) {
    // Still checking compatibility
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking browser compatibility...</p>
        </div>
      </div>
    );
  }

  if (!isCompatible) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browser Not Supported
          </h2>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support the Web Crypto API, which is required for JWT operations. 
            This application uses modern cryptographic features for security.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Recommended Browsers:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Chrome 60+</li>
              <li>• Firefox 60+</li>
              <li>• Safari 12+</li>
              <li>• Edge 79+</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Security Note:</h3>
            <p className="text-sm text-yellow-800">
              This application performs cryptographic operations in your browser for security. 
              Please use an up-to-date browser to ensure your data remains secure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BrowserCompatibility; 