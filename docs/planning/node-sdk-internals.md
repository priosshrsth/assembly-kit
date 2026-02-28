# @assembly-js/node-sdk — Internals Reference

**Version analyzed:** 3.19.1
**Source location:** `node_modules/@assembly-js/node-sdk`
**Purpose:** Understanding what the existing SDK does so `assembly-kit` can replicate (and improve upon) the essential parts independently, without depending on the SDK as a runtime dependency.

---

## 1. Package Structure

```
dist/
├── api/
│   ├── init.js          # Entry point: assemblyApi(), processToken()
│   └── init.d.ts        # Public type declarations
├── codegen/api/
│   ├── core/
│   │   ├── ApiError.js       # HTTP error class
│   │   ├── OpenAPI.js        # Global singleton config object
│   │   ├── request.js        # fetch-based HTTP transport
│   │   └── CancelablePromise.js
│   ├── services/
│   │   └── DefaultService.js # All API methods (static class)
│   └── index.js
└── utils/
    └── crypto.js        # Token decryption utilities
```

---

## 2. Token Decryption — Fully Local, No Network Call

This is the most important finding. **Token parsing never makes a network call.** It is entirely synchronous, local crypto using Node.js's built-in `crypto` module.

### 2.1 Step-by-step: how a token is decoded

Given `apiKey` (the workspace/app API key) and `token` (the hex-encoded encrypted string from the iframe URL query parameter `?token=`):

**Step 1 — Derive decryption key from API key**

```js
// utils/crypto.js: generate128BitKey(apiKey)
const mac = crypto.createHmac("sha256", apiKey).digest("hex");
const key = mac.slice(0, 32); // Take first 32 hex chars = 128-bit key
```

The API key itself is used as the HMAC-SHA256 secret. The result is a 128-bit (16-byte) hex key. This means the token is encrypted with a key _derived from_ the API key — only someone who knows the API key can decrypt it.

**Step 2 — AES-128-CBC decryption**

```js
// utils/crypto.js: decryptAES128BitToken(key, encryptedMessage)
const keyBuffer = Buffer.from(key, "hex"); // 16 bytes
const encryptedBuffer = Buffer.from(encryptedMessage, "hex");
const iv = encryptedBuffer.subarray(0, 16); // First 16 bytes = IV
const ciphertext = encryptedBuffer.subarray(16); // Rest = ciphertext
const decipher = crypto.createDecipheriv("aes-128-cbc", keyBuffer, iv);
let decrypted = decipher.update(ciphertext);
decrypted = Buffer.concat([decrypted, decipher.final()]);
return decrypted.toString("utf-8"); // JSON string
```

The token is a hex-encoded binary blob. The first 16 bytes are the AES IV (prepended by the Assembly backend when encrypting). The rest is the ciphertext. After decryption, the result is a plain JSON string.

**Step 3 — Parse the JSON payload**

```js
// api/init.js: processToken(decryptedString)
const json = JSON.parse(decryptedPayload);
// Validates: workspaceId must be present, all values must be strings
```

The decrypted JSON is validated — `workspaceId` is required; all field values must be strings. Unknown fields are allowed (for forward compatibility).

### 2.2 Token payload fields

```ts
interface TokenPayload {
  workspaceId: string; // Always present — identifies the workspace
  clientId?: string; // Present for client (portal) users
  companyId?: string; // Present for client users (their company)
  internalUserId?: string; // Present for internal (team member) users
  notificationId?: string; // Present when token is notification-scoped
  baseUrl?: string; // Overrides the API base URL if set
  tokenId?: string; // Used in marketplace key construction
}
```

**Note on `baseUrl`:** If the token contains a `baseUrl`, the SDK overrides the API base URL for that session. `assembly-kit` must respect this — when `baseUrl` is present in the payload, the transport's `prefixUrl` must be updated to use it.

**Note on `tokenId`:** Only present in certain marketplace tokens. It's included in the compound API key header (see §3).

---

## 3. API Key / Authentication Header

The SDK does **not** use `Authorization: Bearer`. It uses a custom `X-API-Key` header with a **compound key value** constructed as:

| Scenario                                          | Header value                       |
| ------------------------------------------------- | ---------------------------------- |
| Custom app, no token (local/staging env only)     | `<apiKey>`                         |
| Marketplace / custom app with token, no `tokenId` | `<workspaceId>/<apiKey>`           |
| Marketplace app with token + `tokenId` present    | `<workspaceId>/<apiKey>/<tokenId>` |

**Critical implication for `assembly-kit`:** The HTTP transport must construct this compound key at client creation time (after token is parsed), not just pass through the raw API key. The transport auth header is `X-API-Key: ${compoundKey}`.

Additional headers sent by the SDK:

- `X-Assembly-SDK-Version: 3.19.1` — our kit should send its own version here.

---

## 4. Global Singleton Problem (Why assembly-kit Exists)

The existing SDK uses a module-level singleton `OpenAPI` object:

```js
// codegen/api/core/OpenAPI.js
export const OpenAPI = {
  BASE: "https://api.assembly.com",
  HEADERS: undefined, // ← Set on every assemblyApi() call
  // ...
};
```

Every call to `assemblyApi()` mutates `OpenAPI.HEADERS`. In a serverless environment (Vercel, Cloudflare Workers), module-level state is shared between concurrent requests within the same runtime instance. This means:

- Request A arrives: `OpenAPI.HEADERS = { 'X-API-Key': 'workspaceA/apiKey' }`
- Request B arrives (same instance, different tenant): `OpenAPI.HEADERS = { 'X-API-Key': 'workspaceB/apiKey' }`
- Request A continues its async work: **now makes API calls as workspace B**

This is a data leak / tenant isolation bug. `assembly-kit` solves this by keeping all state (headers, base URL, throttle) **inside each `createClient()` instance**.

---

## 5. Full API Surface (DefaultService Methods)

The generated `DefaultService` exposes every Assembly API endpoint as a static method. Below is the complete list, which defines the scope of what `assembly-kit` can eventually support in its resource namespaces.

### App Installs & Connections

- `listAppInstalls()`
- `retrieveAppInstall({ installId })`
- `listAppConnections({ installId, clientId?, companyId? })`
- `createAppConnection({ installId, requestBody })`

### Clients

- `listClients({ limit?, nextToken?, companyId? })`
- `retrieveClient({ id })`
- `createClient({ requestBody, sendInvite? })`
- `updateClient({ id, requestBody })`
- `updateAClientDestructive({ id, requestBody })`
- `deleteClient({ id })`

### Companies

- `listCompanies({ limit?, nextToken?, isPlaceholder? })`
- `retrieveCompany({ id })`
- `createCompany({ requestBody })`
- `updateCompany({ id, requestBody })`
- `deleteCompany({ id })`

### Internal Users

- `listInternalUsers({ limit?, nextToken? })`
- `retrieveInternalUser({ id })`

### Notifications

- `listNotifications({ includeRead?, recipientClientId? })`
- `createNotification({ requestBody })`
- `markNotificationRead({ id })`
- `markNotificationUnread({ id })`
- `deleteNotification({ id })`

### Custom Fields

- `listCustomFields({ entityType })`
- `listCustomFieldOptions({ id })`

### Tasks & Task Templates

- `retrieveTasks({ clientId, companyId?, status?, limit? })`
- `retrieveTask({ id })`
- `createTask({ requestBody })`
- `updateTask({ id, requestBody })`
- `deleteTask({ id })`
- `listTaskTemplates()`
- `retrieveTaskTemplate({ id })`

### Files & File Channels

- `listFiles({ channelId? })`
- `retrieveFile({ id })`
- `createFile({ requestBody })` ← newer version
- `createAFileDeprecated({ requestBody })` ← deprecated
- `deleteFile({ id })`
- `downloadAFile({ id })`
- `retrieveDownloadUrlOfAFile({ id })`
- `putV1FilesIdPermissions({ id, requestBody })`
- `listFileChannels()`
- `retrieveFileChannel({ id })`
- `createFileChannel({ requestBody })`

### Messages & Message Channels

- `listMessages({ channelId, limit?, nextToken? })`
- `sendMessage({ channelId, requestBody })`
- `listMessageChannels({ clientId?, companyId? })`
- `retrieveMessageChannel({ id })`
- `createMessageChannel({ requestBody })`

### Notes

- `listNotes({ clientId?, companyId? })`
- `createNote({ requestBody })`
- `updateNote({ id, requestBody })`
- `deleteNote({ id })`

### Forms & Form Responses

- `listForms()`
- `retrieveForm({ id })`
- `listFormResponses({ formId, clientId?, companyId? })`
- `requestFormResponse({ id, requestBody })`

### Invoices & Invoice Templates

- `listInvoices({ clientId?, companyId? })`
- `createInvoice({ requestBody })`
- `retrieveInvoice({ id })`
- `listInvoiceTemplates()`

### Contracts & Contract Templates

- `listContracts({ clientId?, companyId? })`
- `retrieveContract({ id })`
- `sendContract({ id, requestBody })`
- `listContractTemplates()`
- `retrieveContractTemplate({ id })`

### Products, Prices & Subscriptions

- `listProducts({ limit? })`
- `retrieveProduct({ id })`
- `listPrices({ limit? })`
- `retrievePrice({ id })`
- `listSubscriptions({ clientId?, companyId? })`
- `createSubscription({ requestBody })`
- `retrieveSubscription({ id })`
- `cancelSubscription({ id })`
- `listSubscriptionTemplates()`

### Payments

- `listPayments({ clientId?, companyId? })`

### Workspace

- `retrieveWorkspace()`

### Webhooks

- `sendWebhook(event, payload)` — added manually in `init.js`, not from codegen

---

## 6. What assembly-kit Reimplements vs. Delegates

| Concern               | @assembly-js/node-sdk approach                    | assembly-kit approach                                                           |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Token decryption      | `generate128BitKey` + `decryptAES128BitToken`     | **Reimplement** using Node.js `crypto` — identical algorithm, no SDK dep needed |
| Token payload parsing | `processToken()`                                  | **Reimplement** with Zod schema + typed errors                                  |
| HTTP transport        | Custom codegen `request.js` + `CancelablePromise` | **Replace** with `ky`                                                           |
| Auth header           | `X-API-Key: ${compoundKey}` (global singleton)    | **Per-instance** `X-API-Key` header built at client construction                |
| Rate limiting         | None                                              | **Add** via `p-throttle`                                                        |
| Retry                 | None                                              | **Add** via `ky` retry config                                                   |
| Response validation   | None (raw types)                                  | **Add** Zod schema validation (toggleable)                                      |
| Pagination            | Manual `nextToken` threading                      | **Add** `paginate()` AsyncIterable helper                                       |
| Singleton state       | Module-level `OpenAPI` object                     | **Eliminated** — all state is instance-scoped                                   |
| Error types           | `ApiError` from codegen (no hierarchy)            | **Replace** with typed `AssemblyError` hierarchy                                |

---

## 7. Node 24 Compatibility — Known Failure & Fix

### Why token parsing fails on Node 24

The existing SDK's `decryptAES128BitToken` breaks on Node 24 for two compounding reasons:

**Root Cause 1 — PKCS7 padding validation (primary)**

Node 18 uses OpenSSL 3.0.x. Node 24 uses OpenSSL 3.4/3.5. Between those versions, the internal `ossl_cipher_unpadblock` function (called by `decipher.final()` when `autoPadding=true`) became stricter about validating PKCS7 padding bytes. If the Assembly Go backend ever produces a ciphertext whose final block's PKCS7 padding is non-standard (e.g. zero-padded, or no extra block appended when plaintext is exactly block-aligned), OpenSSL 3.0.x silently tolerated it while OpenSSL 3.4/3.5 throws `bad decrypt` / `wrong final block length`.

The SDK makes this invisible: the `try/catch` in `assemblyApi()` swallows the real error, logs to console, and re-throws as `"Unable to authorize Assembly SDK"` — so the root cause is never surfaced to the caller.

**Root Cause 2 — Bare `'crypto'` import (secondary)**

```js
import * as crypto from "crypto"; // ← SDK's current code
```

This bare specifier still resolves in Node 24, but it is not stable across all ESM configurations and Bun prefers (and in some configurations requires) the `node:` prefix.

### The fix in assembly-kit

1. **Use `node:crypto`** — explicit protocol prefix, works on Node 18, 22, 24, and Bun.
2. **Disable OpenSSL auto-padding and strip PKCS7 manually** — removes the dependency on OpenSSL version-specific padding behavior entirely.

```ts
import * as nodeCrypto from "node:crypto";

function decryptTokenString(apiKey: string, encryptedToken: string): string {
  const key = Buffer.from(deriveDecryptionKey(apiKey), "hex");
  const blob = Buffer.from(encryptedToken, "hex");
  const iv = blob.subarray(0, 16);
  const cipher = blob.subarray(16);
  const decipher = nodeCrypto.createDecipheriv("aes-128-cbc", key, iv);

  // Disable OpenSSL's own PKCS7 unpadding — its strictness changed between
  // OpenSSL 3.0.x (Node 18) and OpenSSL 3.4/3.5 (Node 24).
  decipher.setAutoPadding(false);

  const raw = Buffer.concat([decipher.update(cipher), decipher.final()]);

  // Manual PKCS7 strip — deterministic, version-independent
  const padLen = raw[raw.length - 1];
  if (padLen < 1 || padLen > 16) {
    throw new Error(`Invalid PKCS7 padding byte: ${padLen}`);
  }
  return raw.subarray(0, raw.length - padLen).toString("utf-8");
}
```

This is functionally identical to what OpenSSL does internally, but done in our code, so it works the same on every runtime and OpenSSL version.

---

## 8. Key Implementation Notes for assembly-kit

1. **Reimplement crypto locally.** The algorithm is simple and stable: HMAC-SHA256 key derivation + AES-128-CBC decryption with prepended IV. Using Node.js `crypto` directly means no dependency on `@assembly-js/node-sdk` at all.

2. **`parseToken()` is synchronous.** Decryption and JSON parsing are both synchronous. No `await` needed. The function signature should be `parseToken(token: unknown, apiKey: string): TokenPayload`.

3. **The API key is required for token decryption.** You cannot parse a token without the API key — the key is the HMAC secret. This means `parseToken` needs both the token string and the apiKey. In `assembly-kit`, this is naturally handled because `createClient({ apiKey, token })` decrypts the token at construction time.

4. **Respect `baseUrl` from token.** If the decrypted payload contains `baseUrl`, the transport must use that URL as the base instead of the default `https://api.assembly.com`. This supports staging/custom environments.

5. **Compound key construction order:**
   - With token, no `tokenId`: `${workspaceId}/${apiKey}`
   - With token + `tokenId`: `${workspaceId}/${apiKey}/${tokenId}`
   - Without token (custom app, no-token endpoints): cannot construct compound key → must use a different auth strategy (this is an open question for v1)

6. **`notificationId` in token.** Some tokens are scoped to a notification (e.g., when a client clicks a notification link). The token carries the `notificationId`. assembly-kit's `TokenPayload` type must include this field.

7. **Forward-compatible token parsing.** Unknown fields in the decrypted JSON must be silently ignored. Do not use `z.strict()` on `TokenPayloadSchema` — use the default (passthrough behavior or explicit `.strip()`).
