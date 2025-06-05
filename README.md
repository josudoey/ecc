# ECC (Elliptic Curve Cryptography)

A JavaScript implementation of secp256k1 elliptic curve cryptography, providing functionality for Bitcoin and Ethereum cryptographic operations.

## Overview

This library implements the secp256k1 elliptic curve, which is used in Bitcoin, Ethereum, and many other cryptocurrencies. It provides functionality for:

- Private and public key generation and management
- Signing and verification of messages
- Key recovery from signatures
- Bitcoin address generation
- Ethereum address generation
- ECDH (Elliptic Curve Diffie-Hellman) key exchange
- DER encoding/decoding of signatures

## Installation

```bash
npm install
# or
pnpm install
```

## Usage

### Private Keys

```javascript
const PrivateKey = require('./secp256k1/private-key');

// Create a new private key
const privateKeyHex = 'f000000000000000000000000000000000000000000000000000000000000000';
const privateKey = new PrivateKey(privateKeyHex);

// Get the corresponding public key
const publicKey = privateKey.getPublic();

// Export to PEM format
const pem = privateKey.toPEM();

// Import from PEM format
const importedKey = PrivateKey.fromPEM(pem);

// Sign a message
const msgHash = crypto.createHash('sha256').update('message').digest().toString('hex');
const signature = privateKey.sign(msgHash);
// signature contains r, s, and recoveryParam

// ECDH key exchange
const otherPublicKey = someOtherPublicKey;
const sharedSecret = privateKey.ecdhSecret(otherPublicKey);
```

### Public Keys

```javascript
const PublicKey = require('./secp256k1/public-key');

// Create from raw data
const publicKey = PublicKey.from(publicKeyBuffer);

// Create from generator point
const generatorPoint = PublicKey.G(1); // 1 * G

// Verify a signature
const isValid = publicKey.verify(msgHash, signature.r, signature.s);

// Recover public key from signature
const recoveredKey = PublicKey.recover(msgHash, signature.r, signature.s, signature.recoveryParam);

// Export to SEC format (compressed or uncompressed)
const secCompressed = publicKey.toSec(true);
const secUncompressed = publicKey.toSec(false);

// Convert to buffer
const buffer = publicKey.toBuffer();
```

### Bitcoin Addresses

```javascript
const BitcoinPublicKey = require('./secp256k1/bitcoin/public-key');

// Create a Bitcoin public key
const bitcoinKey = BitcoinPublicKey.from(publicKeyBuffer);

// Generate a mainnet address
const mainnetAddress = bitcoinKey.toAddress(false);

// Generate a testnet address
const testnetAddress = bitcoinKey.toAddress(true);
```

### Ethereum Addresses

```javascript
const EthereumPublicKey = require('./secp256k1/ethereum/public-key');

// Create an Ethereum public key
const ethereumKey = EthereumPublicKey.from(publicKeyBuffer);

// Generate an Ethereum address
const address = ethereumKey.toAddress();

// Generate a checksum address
const checksumAddress = ethereumKey.toChecksumAddress();
```

### Signatures

```javascript
const Signature = require('./secp256k1/signature');

// Convert signature to DER format
const derSignature = Signature.toDER(signature);

// Parse DER signature
const parsedSignature = Signature.fromDER(derBuffer);
```

## Testing

Run the tests with:

```bash
npm test
```

For development with automatic test reloading:

```bash
npm run dev:test
```

## Implementation Details

This library implements the secp256k1 elliptic curve from scratch, including:

- Point addition and doubling on the curve
- Scalar multiplication using the double-and-add algorithm
- Private key generation and management
- Public key derivation and verification
- Signature creation and verification
- Key recovery from signatures
- Bitcoin and Ethereum address generation

The implementation follows the standards and specifications for secp256k1, Bitcoin, and Ethereum.

## Dependencies

- **asn1**: For ASN.1 encoding/decoding (used in PEM format)
- **bn.js**: For big number arithmetic
- **bs58**: For Base58 encoding/decoding (used in Bitcoin addresses)
- **js-sha3**: For Keccak-256 hashing (used in Ethereum addresses)

## License

ISC
