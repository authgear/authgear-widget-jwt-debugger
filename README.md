# JWT Debugger Widget for Authgear

A comprehensive React-based JWT debugging tool designed to be embedded in authgear.com via iframe. This widget provides full JWT decoding, validation, signature verification, and JWE encryption/decryption capabilities.

> **Built using [Cursor AI](https://cursor.sh/)**

## Features

### JWT Decoding & Validation
- ✅ Decode JWT tokens and display header and payload in JSON format
- ✅ Validate JWT format and structure
- ✅ Real-time validation feedback with visual indicators
- ✅ Syntax highlighting for JSON output
- ✅ Copy decoded header and payload to clipboard

### JWT Encoding
- ✅ Create new JWT tokens with custom header and payload
- ✅ Support for all standard JWT algorithms (HS256, HS384, HS512, RS256, RS384, RS512)
- ✅ Real-time token generation with live preview
- ✅ Custom claims support

### JWE (JSON Web Encryption) Support
- ✅ **JWE Encryption**: Encrypt data using various algorithms
  - Content encryption: A128GCM, A192GCM, A256GCM, A128CBC-HS256, A192CBC-HS384, A256CBC-HS512
  - Key encryption: RSA-OAEP, RSA-OAEP-256, RSA1_5, A128KW, A192KW, A256KW, dir
- ✅ **JWE Decryption**: Decrypt JWE tokens
  - Support for all standard JWE algorithms
  - Automatic algorithm detection

### Signature Verification
- ✅ **Symmetric algorithms** (HS256, HS384, HS512)
  - Secret input with UTF-8 and base64url encoding support
- ✅ **Asymmetric algorithms** (RS256, RS384, RS512)
  - PEM public key support
  - JWK endpoint support

### Standard Claims Support
The widget displays descriptions for all standard JWT claims:

**Header Claims:**
- `alg`: Signature or encryption algorithm
- `typ`: Token type
- `cty`: Content Type

**Payload Claims:**
- `sub`: Subject - Identifies the user of this JWT
- `iss`: Issuer - Identifies the issuer of the JWT
- `aud`: Audience - Identifies the recipients that the JWT is intended for
- `exp`: Expiration time (with human-readable date formatting)
- `nbf`: Not Before (with human-readable date formatting)
- `iat`: Issued At (with human-readable date formatting)
- `jti`: JWT ID - A unique identifier for the JWT

### Additional Features
- ✅ Generate example JWTs with different algorithms
- ✅ Time conversion utilities for Unix timestamps
- ✅ Responsive design for mobile and desktop
- ✅ Modern, clean UI with intuitive tabs
- ✅ Human-readable timestamp formatting for date claims
- ✅ Error handling with user-friendly messages
- ✅ Custom React hooks for signature verification

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd authgear-widget-jwt-debugger
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The widget will be available at `http://localhost:3000`.

## Building for Production

To build the widget for production:

```bash
npm run build
```

This creates a `build` folder with optimized files ready for deployment.

## Embedding via iframe

To embed the JWT debugger widget in your website, use the following iframe code:

```html
<iframe 
    src="https://your-domain.com/jwt-debugger" 
    width="100%" 
    height="800px" 
    frameborder="0"
    style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
></iframe>
```

### Integration with Authgear.com

For authgear.com integration, the widget can be embedded directly in your documentation or developer tools section. The iframe is designed to be responsive and will adapt to the container width.

## Usage Examples

### Testing with Example JWT

Try this example JWT token:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1aWRfMTIzNDU2IiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjcyNTM3MzYzLCJleHAiOjE2NzI1NDA5NjN9.Vhz8E2qVdIEyxdHuYo7s9ZmLUJtlQ-lXvqEy7F9pL1o
```

Secret for verification: `your-256-bit-secret`

### Symmetric Signature Verification (HS256)

1. Paste a JWT token with HS256 algorithm
2. Enter the secret used to sign the token
3. Select UTF-8 or base64url encoding
4. The widget will automatically verify the signature

### Asymmetric Signature Verification (RS256)

1. Paste a JWT token with RS256 algorithm
2. Choose between PEM or JWK input methods
3. For PEM: paste the public key
4. For JWK: enter the JWK endpoint URL
5. The widget will verify the signature using the provided key

### JWE Encryption/Decryption

1. **Encryption**: Enter plaintext data, select encryption algorithms, and provide encryption key
2. **Decryption**: Paste a JWE token and provide the decryption key
3. The widget supports both symmetric and asymmetric key encryption

## Browser Support

The widget supports all modern browsers:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Security Considerations

- The widget runs entirely in the browser
- No JWT tokens or secrets are sent to any server
- All cryptographic operations are performed client-side
- Suitable for debugging and development purposes

## Dependencies

- **React 18.2.0** - UI framework
- **jose 5.1.3** - JWT/JWE library for signature verification and encryption
- **prismjs 1.30.0** - Syntax highlighting for JSON output
- **react-simple-code-editor 0.14.1** - Code editor component

## Project Structure

```
src/
├── index.js                    # React entry point
├── index.css                   # Global styles
├── JWTDebugger.js             # Main widget component
├── constants.js               # Application constants
├── utils.js                   # Utility functions
├── components/                # React components
│   ├── DecodedSections.js     # JWT header/payload display
│   ├── JWTEncoder.js          # JWT creation interface
│   ├── JWTTokenInput.js       # Token input component
│   ├── SignatureVerification.js # Signature verification UI
│   ├── JWEEncrypt.js          # JWE encryption interface
│   ├── JWEDecrypt.js          # JWE decryption interface
│   ├── JSONRenderer.js        # JSON syntax highlighting
│   ├── TabNavigation.js       # Tab navigation component
│   └── TimeConversionModal.js # Timestamp conversion utility
├── services/                  # Business logic services
│   ├── exampleGenerator.js    # Example JWT generation
│   ├── jwtVerification.js     # JWT verification logic
│   └── keyUtils.js           # Key handling utilities
├── hooks/                     # Custom React hooks
│   └── useSignatureVerification.js
└── utils/                     # Utility modules
    └── errorHandling.js       # Error handling utilities

public/
└── index.html                # HTML template

iframe-example.html           # Example iframe integration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on the GitHub repository or contact the Authgear team. 