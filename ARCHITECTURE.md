# UniOrg Architecture

## General Architecture

```mermaid
flowchart TD

A[Organizer]
B[Frontend - Scaffold ETH]
C[MetaMask]
D[Arbitrum Sepolia]
E[UniOrg Smart Contract]
F[Certificate Stored On-chain]
G[Verifier]

A --> B
B --> C
C --> D
D --> E
E --> F
G --> B
B --> E
```

---

## Components

### Frontend
- Scaffold-ETH
- Next.js
- React

### Wallet
- MetaMask

### Smart Contract
- Solidity

### Blockchain
- Arbitrum Sepolia

### Main Functions

- Issue certificate
- Verify certificate
- Read certificate