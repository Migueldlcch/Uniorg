# UniOrg — Arquitectura

Infraestructura de credenciales verificables sobre Arbitrum.
**En una línea:** la cadena guarda el sello, IPFS guarda el documento, y el frontend solo traduce la verdad.

## Diagrama de alto nivel

```
┌───────────────────────────┐
│  Frontend Next.js         │
│  (Vercel)                 │
│  React · wagmi · SE2      │
└──────────┬────────────────┘
           │ writes (tx): createOrganization · issueCredential · revokeCredential
           │ reads (gratis, SIN wallet): verifyCredential · getCredential · getOrganization
           ▼
┌───────────────────────────┐          ┌───────────────────────────┐
│  Contrato UniOrg.sol      │          │  IPFS · Pinning: Pinata   │
│  Arbitrum Sepolia         │          │  documentos y metadata    │
│  0xcd2b…d4ff              │◄─────────│  (direccionado por        │
│  orgs + credenciales      │ metadataURI = ipfs://CID             │  contenido: CID)          │
└──────────┬────────────────┘          └───────────────────────────┘
           │ eventos públicos: OrganizationCreated · CredentialIssued · CredentialRevoked
           ▼
┌───────────────────────────┐
│  Arbiscan (auditoría)     │
└───────────────────────────┘
```

## Componentes

### 1. Contrato inteligente `UniOrg.sol` (Solidity) — Arbitrum Sepolia
Dirección: `0xcd2b62013948f6ddd0f64aa19e1287164a06d4ff`

- **Estado**: `organizations` (id → Organization), `credentials` (id → Credential), índices por issuer y por recipient.
- **Writes (transacciones)**: `createOrganization`, `issueCredential`, `revokeCredential`.
- **Reads (gratis, sin wallet)**: `verifyCredential`, `getCredential`, `getOrganization`, `getIssuerOrgs`, `getRecipientCredentials`.
- **Reglas de negocio on-chain** (no en el frontend): modifiers `orgExists` y `onlyIssuer`.
- **Eventos** para auditoría pública y refresh reactivo del UI.

### 2. Frontend (Next.js + TypeScript) — Vercel
- `/` landing pública + panel del issuer al conectar wallet.
- `/issue` flujo de emisión (write).
- `/verify` verificación **sin wallet** (read) + traducción `ipfs://X` → `https://ipfs.io/ipfs/X`.
- Stack: Scaffold-ETH 2, wagmi/viem, RainbowKit, Tailwind + daisyUI.
- **Sin backend propio**: la wallet es la autenticación, el contrato es la base de datos de verdad, IPFS es el almacenamiento de documentos.

### 3. IPFS + Pinata
- Documentos dirigidos por contenido (CID): alterar 1 byte cambia el CID → falsificación detectada.
- Ejemplo real en producción: certificado con CID `bafybeib4rpfdp22c7hpfsryxymmm5rhkehn7zyang3d572kmbaoepfxste`.

### 4. Arbitrum
- L2 con costos de centavos (~0.000004 ETH por tx) y seguridad heredada de Ethereum L1.

## Flujos de datos

### Emisión
1. La institución conecta su wallet (su identidad on-chain).
2. `createOrganization(nombre)` → identidad verificable.
3. Sube el documento a IPFS → obtiene CID.
4. `issueCredential(orgId, recipient, ipfs://CID)` → registro firmado + evento público.

### Verificación (sin wallet, sin cuenta)
1. El empleador escribe el folio (id).
2. `verifyCredential(id)` → válida / revocada.
3. `getCredential` + `getOrganization` → issuer, fecha, metadata.
4. "Ver documento original" → gateway IPFS.
5. Auditoría opcional en Arbiscan.

### Revocación
`revokeCredential(id)` (solo el issuer) → `revoked = true`. No es borrado: es un **evento público** con historial intacto.

## Modelo de confianza
- Permissionless: cualquiera puede crear SU organización.
- `onlyIssuer`: nadie puede emitir o revocar en nombre de otra organización.
- El valor de una credencial = la reputación de su issuer. UniOrg no otorga legitimidad: **hace que la legitimidad real sea públicamente verificable**.
- Las llaves privadas nunca salen de MetaMask; solo viajan firmas.

## Roadmap (fase 2)
- Roles, proyectos y afiliados como credenciales (los módulos ya aparecen como beta en el UI).
- Metadata estándar tipo OpenBadges (JSON en IPFS).
- QR / links compartibles en CVs.
- Supabase para galería de fotos, logos, búsqueda off-chain y notificaciones por email.
- Portales white-label por universidad.

## Links
- App: https://uniorg-nextjs-n2iy.vercel.app
- Contrato: https://sepolia.arbiscan.io/address/0xcd2b62013948f6ddd0f64aa19e1287164a06d4ff
- Repo: https://github.com/Migueldlcch/Uniorg
- Documento en IPFS: https://ipfs.io/ipfs/bafybeib4rpfdp22c7hpfsryxymmm5rhkehn7zyang3d572kmbaoepfxste