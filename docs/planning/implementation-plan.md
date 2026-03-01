# assembly-kit — Implementation Plan

**Version:** 1.1
**Status:** Draft
**Date:** 2026-02-28
**Updated:** 2026-02-28 — Token internals verified; crypto reimplemented locally; `isMarketplaceApp` flag added; auth header corrected to `X-API-Key`.

This is a feature-by-feature implementation plan. Each feature is a self-contained unit that can be worked on, reviewed, and tested independently before moving to the next. Features are ordered by dependency: later features build on earlier ones.

---

## Phase 0: Project Scaffold

> Everything downstream depends on this. Complete before any feature work.

### 0.1 Repo & Tooling Bootstrap

**Goal:** A running repo with working build, lint, format, and test commands.

**Steps:**

1. Create `package.json` with:
   - `"name": "assembly-kit"`
   - `"type": "module"`
   - `"version": "0.0.1"`
   - Scripts: `build`, `test`, `test:node` (runs under Node for compat check), `lint`, `format`, `typecheck`
   - Runtime deps: `ky`, `p-throttle`, `zod`
   - Dev deps: `typescript`, `@types/node`, `bun-types`, `ultracite`, `oxlint`
   - `"engines": { "node": ">=18.0.0", "bun": ">=1.0.0" }`
2. Create `tsconfig.json`:
   - `"strict": true`
   - `"moduleResolution": "bundler"`
   - `"module": "ESNext"`
   - `"target": "ES2022"`
   - `"outDir": "dist"`
   - `"rootDir": "src"`
3. Create `bunfig.toml` with test configuration.
4. Create `oxlint.json` config with recommended rules.
5. Create `.ultracite.json` or equivalent formatter config.
6. Create top-level `src/`, `tests/`, and `tests/fixtures/` directories.

> **Runtime compatibility rule (applies to all features):** Always import crypto as `node:crypto` (explicit protocol prefix). Bun and Node.js 18/24 both honour the `node:` prefix. Never use bare `'crypto'`. Do not use any Node.js APIs that Bun does not implement — this SDK only needs `node:crypto` (AES-128-CBC + HMAC-SHA256), which Bun supports natively. 7. Create `src/index.ts`, `src/schemas/index.ts`, `src/app-bridge/index.ts`, `src/bridge-ui/index.ts` as empty stubs. 8. Generate token test fixtures: using the `@assembly-js/node-sdk` crypto functions, generate 3-4 encrypted token strings (client user, internal user, with tokenId, with baseUrl) for a fixed test apiKey. Save to `tests/fixtures/tokens.ts` as constants. These are used by all token-related tests without mocking crypto. 8. Verify: `bun build src/index.ts --outdir dist` succeeds. 9. Verify: `bun test` runs (zero tests, zero failures).

**Definition of Done:**

- `bun build` produces `dist/` output.
- `bun test` exits 0.
- `bun run typecheck` exits 0.
- `bun run lint` exits 0.

---

## Feature 1: Error Model

> Dependency: Phase 0
> All other features depend on this — define errors first.

### What we're building

A typed, hierarchical error system that every other layer of the SDK throws. No external dependencies needed — pure TypeScript.

### Files to create

- `src/errors/base.ts`
- `src/errors/index.ts`

### Implementation Steps

**1.1 — Base error class and factory**

In `src/errors/base.ts`:

```ts
export class AssemblyError extends Error {
  readonly name: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "AssemblyError";
    this.statusCode = statusCode;
    this.details = details;
    // Maintains proper prototype chain in environments transpiling to ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function createAssemblyError(
  name: string,
  defaultMessage: string,
  statusCode: number
) {
  return class extends AssemblyError {
    constructor(messageOverride?: string, details?: unknown) {
      super(messageOverride ?? defaultMessage, statusCode, details);
      this.name = name;
    }
  };
}
```

**1.2 — All error subclasses**

In `src/errors/index.ts`, use the factory to produce:

- `AssemblyMissingApiKeyError` (statusCode: 400)
- `AssemblyNoTokenError` (statusCode: 400)
- `AssemblyInvalidTokenError` (statusCode: 401)
- `AssemblyUnauthorizedError` (statusCode: 401)
- `AssemblyForbiddenError` (statusCode: 403)
- `AssemblyNotFoundError` (statusCode: 404)
- `AssemblyValidationError` (statusCode: 422)
- `AssemblyRateLimitError` (statusCode: 429) — extends base manually to add `retryAfter?: number`
- `AssemblyServerError` (statusCode: 500)
- `AssemblyConnectionError` (statusCode: 503)
- `AssemblyResponseParseError` — extends base manually to add `zodError: ZodError`

**1.3 — Re-export from main entry**

`src/index.ts` exports all error classes.

### Tests

`tests/errors.test.ts`:

- Each subclass has correct `.name`, `.statusCode`, `.message`.
- `instanceof AssemblyError` is true for all subclasses.
- `AssemblyRateLimitError` has `.retryAfter` field.
- `AssemblyResponseParseError` has `.zodError` field.
- Custom message override works.

---

## Feature 2: Zod Schemas & Types

> Dependency: Feature 1 (AssemblyResponseParseError is thrown on schema mismatch)

### What we're building

The canonical data shape layer. All API response/request types live here. Available as `assembly-kit/schemas` for apps that only need types without the client.

### Files to create

```
src/schemas/
├── index.ts
├── base/
│   ├── company.ts
│   ├── client.ts
│   ├── internal-user.ts
│   ├── workspace.ts
│   ├── custom-field.ts
│   └── token.ts
├── responses/
│   ├── company.ts
│   ├── client.ts
│   ├── internal-user.ts
│   ├── workspace.ts
│   ├── notification.ts
│   ├── custom-field.ts
│   └── task.ts
└── requests/
    ├── client.ts
    ├── company.ts
    └── notification.ts
```

### Implementation Steps

**2.1 — Shared primitives**

In each `base/` file, define the minimal shape of each entity:

- `CompanySchema`: `id`, `name`, `iconImageUrl`, `fallbackColor`, `isPlaceholder`, `customFields`, `createdAt`
- `ClientSchema`: `id`, `givenName`, `familyName`, `email`, `companyIds`, `avatarImageUrl`, `fallbackColor`, `customFields`, `createdAt`
- `InternalUserSchema`: `id`, `givenName`, `familyName`, `email`, `avatarImageUrl`, `isClientAccessLimited`, `companyAccessList`, `fallbackColor`, `createdAt`
- `WorkspaceSchema`: `id`, `portalUrl`, `font`, `brandName`, `labels`
- `CustomFieldSchema`: `id`, `key`, `name`, `type`, `order`, `object`, `entityType`
- `TokenPayloadSchema`: `workspaceId`, `clientId?`, `companyId?`, `internalUserId?` with refinement (either internalUserId OR clientId+companyId)
- `HexColorSchema`: regex refinement

**2.2 — Enum schemas**

Define using `z.enum()`:

- `CustomFieldTypeSchema`
- `CustomFieldEntityTypeSchema`
- `TaskStatusSchema`

Export corresponding TypeScript enums or string literal union types.

**2.3 — Response schemas**

Each `responses/` file imports from `base/` and wraps in the list shape `{ data: z.array(BaseSchema) }` where applicable.

**2.4 — Request schemas**

Strict schemas for outgoing payloads. These are not enforced by the transport but are exported for app-side form/action validation.

**2.5 — Barrel export**

`src/schemas/index.ts` re-exports everything. This file is the `assembly-kit/schemas` entry point.

### Tests

`tests/schemas.test.ts`:

- Valid shape passes each schema.
- Missing required field throws `ZodError`.
- `TokenPayloadSchema` refinement: rejects payload with neither `internalUserId` nor `clientId+companyId`.
- `HexColorSchema` rejects invalid and accepts valid hex.
- All TypeScript types infer correctly (compile-time test via `satisfies`).

---

## Feature 3: Token Utilities

> Dependency: Feature 1 (errors), Feature 2 (schemas)

### What we're building

The token crypto layer and guard functions. Token decryption is **entirely synchronous and local** — no network call, no dependency on `@assembly-js/node-sdk`. We reimplement the two-step crypto directly using Node.js `crypto`. See `docs/planning/node-sdk-internals.md` §2 for the full algorithm walkthrough.

### Files to create

- `src/token/crypto.ts` — key derivation + AES decryption
- `src/token/parse.ts` — `parseToken()` public API
- `src/token/guards.ts` — `ensureIsClient()`, `ensureIsInternalUser()`, type predicates
- `src/token/index.ts` — barrel export

### Implementation Steps

**3.1 — Crypto primitives**

`src/token/crypto.ts` — internal, not exported from public API:

```ts
import * as nodeCrypto from "node:crypto"; // node: prefix required for Bun + Node 18/24 compat

// Derives a 128-bit hex key from the API key using HMAC-SHA256
// Mirrors: generate128BitKey() in @assembly-js/node-sdk
export function deriveDecryptionKey(apiKey: string): string {
  return nodeCrypto.createHmac("sha256", apiKey).digest("hex").slice(0, 32);
}

// Decrypts an AES-128-CBC token. First 16 bytes of the hex blob are the IV.
//
// IMPORTANT — Node 24 compatibility:
// The existing @assembly-js/node-sdk uses decipher.final() with autoPadding=true
// (OpenSSL default). This fails on Node 24 (OpenSSL 3.4/3.5) because OpenSSL's
// ossl_cipher_unpadblock became stricter about PKCS7 padding validation between
// OpenSSL 3.0.x (Node 18) and 3.4/3.5 (Node 24). The fix is to disable OpenSSL's
// auto-padding and strip PKCS7 manually — identical behavior, version-independent.
export function decryptTokenString(
  apiKey: string,
  encryptedToken: string
): string {
  const key = Buffer.from(deriveDecryptionKey(apiKey), "hex");
  const blob = Buffer.from(encryptedToken, "hex");
  const iv = blob.subarray(0, 16);
  const cipher = blob.subarray(16);
  const decipher = nodeCrypto.createDecipheriv("aes-128-cbc", key, iv);

  decipher.setAutoPadding(false); // disable OpenSSL PKCS7 — we strip manually below

  const raw = Buffer.concat([decipher.update(cipher), decipher.final()]);

  // Manual PKCS7 strip: last byte = number of padding bytes (1–16 for 128-bit block)
  const padLen = raw[raw.length - 1];
  if (padLen < 1 || padLen > 16) {
    throw new Error(`Invalid PKCS7 padding byte: ${padLen}`);
  }
  return raw.subarray(0, raw.length - padLen).toString("utf-8");
}
```

**3.2 — `parseToken()`**

`src/token/parse.ts`:

```ts
export function parseToken(token: unknown, apiKey: string): TokenPayload;
```

Step-by-step:

1. If `token` is `null`, `undefined`, or empty string → throw `AssemblyNoTokenError`.
2. `z.string().min(1).safeParse(token)` — if fails → throw `AssemblyInvalidTokenError`.
3. `decryptTokenString(apiKey, token)` wrapped in try/catch — any decryption error → throw `AssemblyInvalidTokenError` with original error as `details`.
4. `TokenPayloadSchema.safeParse(JSON.parse(decrypted))` — if fails → throw `AssemblyInvalidTokenError` with `zodError` as `details`.
5. Return the validated `TokenPayload`.

`TokenPayloadSchema` uses `.strip()` (default Zod behavior) — unknown fields from future Assembly SDK versions are silently dropped.

**3.3 — `buildCompoundKey()` (internal helper)**

`src/token/parse.ts` also exports this internally (not in public API):

```ts
// Used by createClient() to build the X-API-Key header value
export function buildCompoundKey(
  apiKey: string,
  payload: TokenPayload
): string {
  return payload.tokenId
    ? `${payload.workspaceId}/${apiKey}/${payload.tokenId}`
    : `${payload.workspaceId}/${apiKey}`;
}
```

**3.4 — Guard functions**

`src/token/guards.ts`:

```ts
export function ensureIsClient(payload: TokenPayload): ClientTokenPayload;
export function ensureIsInternalUser(
  payload: TokenPayload
): InternalUserTokenPayload;
export function isClientToken(
  payload: TokenPayload
): payload is ClientTokenPayload;
export function isInternalUserToken(
  payload: TokenPayload
): payload is InternalUserTokenPayload;
```

- `ensureIsClient`: if `payload.clientId` or `payload.companyId` absent → throw `AssemblyUnauthorizedError('Token does not belong to a client user')`.
- `ensureIsInternalUser`: if `payload.internalUserId` absent → throw `AssemblyUnauthorizedError('Token does not belong to an internal user')`.
- `isClientToken` / `isInternalUserToken`: pure boolean checks, no throw.

**3.5 — Barrel export**

`src/token/index.ts` re-exports all public symbols. `src/index.ts` re-exports from here.

### Tests

`tests/token.test.ts` — use a known apiKey + pre-generated encrypted token fixture to test the full decrypt path without mocking crypto:

- `parseToken(undefined, apiKey)` → `AssemblyNoTokenError`.
- `parseToken('', apiKey)` → `AssemblyNoTokenError`.
- `parseToken(123, apiKey)` → `AssemblyInvalidTokenError`.
- `parseToken('not-valid-hex', apiKey)` → `AssemblyInvalidTokenError`.
- `parseToken(validClientToken, apiKey)` → correct `TokenPayload` with `clientId` + `companyId`.
- `parseToken(validInternalUserToken, apiKey)` → correct `TokenPayload` with `internalUserId`.
- `parseToken(tokenWithTokenId, apiKey)` → payload includes `tokenId`.
- `parseToken(tokenWithBaseUrl, apiKey)` → payload includes `baseUrl`.
- `buildCompoundKey(apiKey, payloadWithoutTokenId)` → `'workspaceId/apiKey'`.
- `buildCompoundKey(apiKey, payloadWithTokenId)` → `'workspaceId/apiKey/tokenId'`.
- `ensureIsClient(clientPayload)` → narrowed type returned.
- `ensureIsClient(internalUserPayload)` → `AssemblyUnauthorizedError`.
- `ensureIsInternalUser(internalUserPayload)` → narrowed type.
- `ensureIsInternalUser(clientPayload)` → `AssemblyUnauthorizedError`.
- `isClientToken` / `isInternalUserToken` type predicates: correct boolean results, no throw.

**Test fixtures note:** Generate a matching `apiKey` + encrypted `token` pair from the existing `@assembly-js/node-sdk` crypto utilities (run once, save output as constants in `tests/fixtures/tokens.ts`). This makes the tests independent of any external service.

- Specifically generate fixtures where the plaintext JSON length is **exactly a multiple of 16 bytes** (block-aligned) to reproduce the Node 24 PKCS7 padding edge case. This is the class of tokens that fail on OpenSSL 3.4/3.5 with `autoPadding=true` but must succeed with our manual strip approach.

---

## Feature 4: HTTP Transport Layer

> Dependency: Feature 1 (errors)

### What we're building

The internal engine for all HTTP calls. Handles rate limiting, retry, auth headers, and error mapping. Consumers never call this directly — the resource classes do.

### Files to create

- `src/transport/rate-limiter.ts`
- `src/transport/error-mapper.ts`
- `src/transport/http.ts`

### Implementation Steps

**4.1 — Rate limiter**

`src/transport/rate-limiter.ts`:

- Wraps `p-throttle` to produce a per-instance throttled caller.
- Factory: `createRateLimiter(requestsPerSecond: number): RateLimiter`
- `RateLimiter` is a function that takes an async operation and returns a throttled promise.
- Default: 20 req/s. This is a rolling window (p-throttle uses sliding window by default).
- No `minTime` penalty when request rate is below the limit.

**4.2 — Error mapper**

`src/transport/error-mapper.ts`:

- `mapHttpError(response: Response): AssemblyError`
- Maps HTTP status to the correct `AssemblyError` subclass.
- For 429: extracts `Retry-After` header (seconds or HTTP date) and sets `retryAfter`.
- For 4xx/5xx: attempts to parse response body as JSON for `details`.

**4.3 — HTTP transport**

`src/transport/http.ts`:

- `createTransport(options: TransportOptions): Transport`
- `TransportOptions`:
  - `compoundKey: string` — the pre-built `X-API-Key` value (not the raw apiKey)
  - `baseUrl: string`
  - `retryCount: number`
  - `retryMinTimeout: number`
  - `retryMaxTimeout: number`
  - `sdkVersion: string` — injected for the `X-Assembly-SDK-Version` header
  - `fetch?: typeof fetch` — injectable for testing (default: global `fetch`)
- Returns a `Transport` object with:
  - `get<T>(path: string, opts?: RequestOpts): Promise<T>`
  - `post<T>(path: string, body?: unknown, opts?: RequestOpts): Promise<T>`
  - `patch<T>(path: string, body?: unknown, opts?: RequestOpts): Promise<T>`
  - `delete<T>(path: string, opts?: RequestOpts): Promise<T>`
- Uses `ky` internally:
  - `prefixUrl` set to `baseUrl`
  - `headers`:
    - `X-API-Key: <compoundKey>` — **not** `Authorization: Bearer`
    - `X-Assembly-SDK-Version: <sdkVersion>`
    - `Content-Type: application/json` on mutation methods
  - `retry`: configured with `retryCount`, exponential backoff, retry only on 429/5xx
  - `hooks.beforeRetry`: check for `Retry-After` header on 429, wait that duration
  - `hooks.beforeRequest`: pass request through rate limiter (await throttle)
  - `hooks.beforeError`: map `HTTPError` to `AssemblyError` subclass using error-mapper
- Network failure (fetch throws): catch and rethrow as `AssemblyConnectionError`.

**Design note on `ky` + rate limiting:**
`ky`'s `beforeRequest` hook is the right place to integrate the throttler: await the throttle promise before the request fires. This ensures rate limiting happens before the network call, not after.

### Tests

`tests/transport.test.ts`:

- Inject mock `fetch` returning 200 → resolves with parsed JSON.
- Inject mock `fetch` returning 404 → throws `AssemblyNotFoundError`.
- Inject mock `fetch` returning 429 with `Retry-After: 1` → throws `AssemblyRateLimitError` with `retryAfter: 1` (after exhausting retries).
- Inject mock `fetch` returning 429 once then 200 → resolves (successful retry).
- Inject mock `fetch` returning 503 → retries and eventually throws `AssemblyServerError`.
- 21 concurrent calls → rate limiter delays the 21st.
- Verify `X-API-Key` header is set correctly on requests (not `Authorization`).
- Verify `X-Assembly-SDK-Version` header present on every request.

---

## Feature 5: Pagination Helper

> Dependency: Feature 4 (transport)

### What we're building

An `AsyncIterable` generator that abstracts cursor-based pagination. Exported as a standalone utility.

### Files to create

- `src/pagination/paginate.ts`

### Implementation Steps

**5.1 — `paginate()` generator**

```ts
export async function* paginate<T>(
  fn: (args: ListArgs) => Promise<PaginatedResponse<T>>,
  initialArgs: ListArgs = {},
): AsyncIterable<T>
```

- Calls `fn` with `initialArgs`.
- Yields each item from `response.data`.
- If `response.nextToken` exists, calls `fn` again with `{ ...initialArgs, nextToken }`.
- Stops when `nextToken` is absent or `data` is empty.
- Handles `null` data gracefully (some Assembly endpoints return `{ data: null }`).

**5.2 — Export**

Re-exported from `src/index.ts`.

### Tests

`tests/pagination.test.ts`:

- Single page (no `nextToken`) → yields all items, stops.
- Multi-page → yields all items across pages in order.
- Empty first page → yields nothing.
- `data: null` → yields nothing without throwing.

---

## Feature 6: Client Factory & Resource Classes

> Dependency: Feature 1, 2, 3, 4, 5

### What we're building

The `createClient()` factory and all resource namespace classes. This is the primary public API.

### Files to create

```
src/client/
├── options.ts
├── create-client.ts
├── assembly-client.ts
src/resources/
├── workspace.ts
├── clients.ts
├── companies.ts
├── internal-users.ts
├── notifications.ts
├── custom-fields.ts
├── tasks.ts
└── token.ts
```

### Implementation Steps

**6.1 — `ClientOptions` type**

`src/client/options.ts` — the public options type (see PRD §4.1). Key fields:

```ts
export type ClientOptions = {
  apiKey: string;
  token?: string;
  isMarketplaceApp?: boolean; // default false
  retryCount?: number; // default 2
  retryMinTimeout?: number; // default 1000
  retryMaxTimeout?: number; // default 5000
  rateLimitPerSecond?: number; // default 20
  validateResponses?: boolean; // default true
  baseUrl?: string; // default https://api.assembly.com
};
```

**6.2 — Resource classes**

Each resource class:

- Receives the `Transport` instance and `validateResponses` flag in its constructor.
- Methods that require a token receive the `token?: string` at construction time.
- Methods that require a token: check presence, throw `AssemblyNoTokenError` if missing.
- Calls transport methods, then optionally Zod-parses the response.
- Returns typed data.

Pattern for each resource method:

```ts
async get(id: string): Promise<ClientResponse> {
  const raw = await this.transport.get(`/clients/${id}`)
  return this.options.validateResponses
    ? parseOrThrow(ClientResponseSchema, raw)
    : raw as ClientResponse
}
```

Where `parseOrThrow(schema, data)` runs `schema.safeParse(data)` and throws `AssemblyResponseParseError` on failure.

**6.3 — `AssemblyClient` class**

`src/client/assembly-client.ts`:

```ts
class AssemblyClient {
  readonly workspace: WorkspaceResource;
  readonly clients: ClientsResource;
  readonly companies: CompaniesResource;
  readonly internalUsers: InternalUsersResource;
  readonly notifications: NotificationsResource;
  readonly customFields: CustomFieldsResource;
  readonly tasks: TasksResource;
  readonly token: TokenResource;
}
```

Constructed internally by `createClient()`. Not exported directly (export `createClient` only).

**6.4 — `createClient()` factory**

`src/client/create-client.ts`:

```ts
export function createClient(options: ClientOptions): AssemblyClient;
```

Validation & construction sequence (all synchronous — no network call at construction):

1. **Validate `apiKey`**: if empty/missing → throw `AssemblyMissingApiKeyError`.
2. **Marketplace token guard**: if `isMarketplaceApp === true` and `token` is absent/empty → throw `AssemblyNoTokenError('Marketplace apps require a token')`.
3. **Token decryption** (if `token` provided):
   - Call `parseToken(token, apiKey)` → `TokenPayload`.
   - On failure → throw `AssemblyInvalidTokenError` (already thrown by `parseToken`).
   - Build `compoundKey = buildCompoundKey(apiKey, payload)`.
   - If `payload.baseUrl` is set, use it as `effectiveBaseUrl`; otherwise use `options.baseUrl ?? 'https://api.assembly.com'`.
   - Store the parsed `TokenPayload` on the client instance.
4. **No token**: `compoundKey = apiKey` (for custom apps in environments that support raw-key auth).
5. Create rate limiter (new `p-throttle` instance).
6. Create transport (new `ky` instance with `compoundKey`, `effectiveBaseUrl`, throttle).
7. Construct `AssemblyClient` with token payload + transport + options.
8. Return client.

**6.5 — Export from main entry**

`src/index.ts`: `export { createClient }`.

### Tests

`tests/client.test.ts`:

- `createClient({ apiKey: '' })` → `AssemblyMissingApiKeyError`.
- `createClient({ apiKey: 'key', isMarketplaceApp: true })` (no token) → `AssemblyNoTokenError`.
- `createClient({ apiKey: 'key', isMarketplaceApp: true, token: validToken })` → constructs successfully.
- `createClient({ apiKey: 'key' })` (no token, no isMarketplaceApp) → constructs successfully.
- `createClient({ apiKey: 'key', token: 'bad-token' })` → `AssemblyInvalidTokenError`.
- `createClient({ apiKey: 'key', token: validToken })` → parsed token payload accessible.
- Token with `baseUrl` → transport uses token's `baseUrl`, not default.
- Token with `tokenId` → `X-API-Key` includes `tokenId` in compound key.
- Two calls to `createClient()` produce independent instances (separate transport, separate rate limiters).
- `client.clients.list()` → transport called with correct path and `X-API-Key` header.
- `client.clients.get(id)` → transport called with `/clients/{id}`.
- Resource method requiring token when client was constructed without token → `AssemblyNoTokenError`.
- `validateResponses: false` → raw data returned, no Zod parsing.
- `validateResponses: true` → bad response shape throws `AssemblyResponseParseError`.

---

## Feature 7: App Bridge (Framework-Agnostic)

> Dependency: Phase 0 only (no SDK internals needed)

### What we're building

The framework-agnostic postMessage system for communicating with the Assembly dashboard.

### Files to create

```
src/app-bridge/
├── index.ts
├── constants.ts
├── send.ts
└── types.ts
```

### Implementation Steps

**7.1 — Constants**

`src/app-bridge/constants.ts`:

```ts
export const DASHBOARD_DOMAINS = [
  "https://dashboard.assembly.com",
  "https://dashboard.assembly-staging.com",
] as const;
```

**7.2 — Types**

`src/app-bridge/types.ts`:

- `Icons` enum (Archive, Plus, Templates, Trash, Download, Disconnect).
- `PrimaryCtaPayload`, `SecondaryCtaPayload`, `ActionsMenuPayload` (discriminated union on `type`).
- `AppBridgePayload` = union of all three.
- `CtaConfig`, `ActionItem`, `BridgeOpts`.

**7.3 — `sendToParent()`**

`src/app-bridge/send.ts`:

```ts
export function sendToParent(
  payload: AppBridgePayload,
  portalUrl?: string
): void;
```

- Guard: if `typeof window === 'undefined'`, return immediately (SSR safe).
- If `portalUrl` provided: `window.parent.postMessage(payload, ensureHttps(portalUrl))`.
- Otherwise: iterate `DASHBOARD_DOMAINS`, post to each.
- `ensureHttps(url: string)`: strips `http://` and prepends `https://` if not already HTTPS.

**7.4 — Barrel export**

`src/app-bridge/index.ts` exports everything. This is the `assembly-kit/app-bridge` entry point.

### Tests

`tests/app-bridge.test.ts`:

- Mock `window.parent.postMessage`, verify called with correct payload and origin.
- With `portalUrl`: called once with that exact origin.
- Without `portalUrl`: called once per `DASHBOARD_DOMAINS` entry.
- SSR: `window === undefined` → no throw, no calls.
- `ensureHttps` converts `http://` URLs correctly.

---

## Feature 8: React App Bridge Hooks

> Dependency: Feature 7, peer dep `react >= 18`

### What we're building

React hooks wrapping the app-bridge core. Shipped as a separate entry point so React is not pulled in for pure server-side consumers.

### Files to create

```
src/bridge-ui/
├── index.ts
├── use-primary-cta.ts
├── use-secondary-cta.ts
└── use-actions-menu.ts
```

### Implementation Steps

**8.1 — `usePrimaryCta`**

`src/bridge-ui/use-primary-cta.ts`:

- Accept `(cta: CtaConfig, opts?: BridgeOpts)`.
- `useEffect` (deps: `cta`, `opts.portalUrl`, `opts.show`):
  - Compute `show = opts?.show ?? true`.
  - Build `PrimaryCtaPayload`.
  - Call `sendToParent(payload, opts?.portalUrl)`.
  - Register `message` event listener; on `type === 'header.primaryCta.onClick'` call `cta.onClick?.()`.
  - Cleanup: remove event listener.
- Second `useEffect` (deps: `opts.portalUrl`):
  - On `beforeunload`, send cleared `{ type: 'header.primaryCta' }`.
  - Cleanup: remove `beforeunload` listener.

**8.2 — `useSecondaryCta`**

Same pattern as `usePrimaryCta` but for `header.secondaryCta`.

**8.3 — `useActionsMenu`**

Similar: sends `header.actionsMenu` with items array. No click listener needed (click targets are per-item strings handled by the parent).

**8.4 — Barrel export**

`src/bridge-ui/index.ts` exports all hooks.

### Tests

- Deferred if `@testing-library/react` is not added in v1.
- Minimum: TypeScript compile-time check that hooks accept correct types.

---

## Feature 9: Build Configuration & Export Map

> Dependency: All features complete

### What we're building

Final build config, export map, and type declarations.

### Steps

**9.1 — `package.json` export map**

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./schemas": {
      "import": "./dist/schemas/index.js",
      "types": "./dist/schemas/index.d.ts"
    },
    "./app-bridge": {
      "import": "./dist/app-bridge/index.js",
      "types": "./dist/app-bridge/index.d.ts"
    },
    "./bridge-ui": {
      "import": "./dist/bridge-ui/index.js",
      "types": "./dist/bridge-ui/index.d.ts"
    }
  },
  "sideEffects": false
}
```

**9.2 — Build script**

`bun build` invocations in `package.json` scripts (or a `build.ts` script):

- Build each entry point to `dist/`.
- Generate `.d.ts` files via `tsc --emitDeclarationOnly`.

**9.3 — Verify**

- `bun run build` produces all `dist/` files.
- `bun run typecheck` passes on `dist/` declarations.
- Import each entry point in a scratch file and verify types resolve.

---

## Feature 10: Documentation & JSDoc

> Dependency: All features complete

### What we're building

JSDoc on all public APIs so consuming apps get hover documentation in their IDE.

### Scope

- `createClient()` + all options.
- All error classes: what triggers them, what fields they carry.
- `parseToken()`, `ensureIsClient()`, `ensureIsInternalUser()`.
- `paginate()`.
- `sendToParent()`.
- All React hooks.
- All Zod schemas (brief description of what entity they represent).

### Style

- Use `@param`, `@returns`, `@throws`, `@example` tags.
- Keep examples short and realistic.
- No separate markdown files needed for internal API docs — JSDoc is the source of truth.

---

## Implementation Order & Dependencies

```
Phase 0: Scaffold
    ↓
Feature 1: Error Model
    ↓
Feature 2: Schemas           Feature 7: App Bridge
    ↓                              ↓
Feature 3: Token Utils       Feature 8: React Hooks
    ↓
Feature 4: Transport
    ↓
Feature 5: Pagination
    ↓
Feature 6: Client Factory
    ↓
Feature 9: Build Config
    ↓
Feature 10: JSDoc
```

Features 7 and 8 (App Bridge) can be developed in parallel with Features 3–6 since they have no shared dependencies.

---

## Checklist: Definition of Done per Feature

Each feature is complete when:

- [ ] All files listed under "Files to create" exist.
- [ ] `bun run typecheck` passes with no errors.
- [ ] All tests listed under "Tests" pass with `bun test`.
- [ ] `bun run lint` passes.
- [ ] Public APIs have JSDoc comments (can be done in Feature 10 batch, or inline).

The overall project is ready for `1.0.0` publish when:

- [ ] All feature checklists are complete.
- [ ] `bun run build` produces clean `dist/` output.
- [ ] Export map is verified against actual `dist/` structure.
- [ ] `README.md` documents install, quick start, and each entry point.
- [ ] `CHANGELOG.md` has a `1.0.0` entry.
- [ ] Open Questions (from PRD §10) are resolved or explicitly deferred to v2.
- [ ] Package is published to npm with `bun publish` (or `npm publish`).

---

## Risk Register

| Risk                                                                                | Mitigation                                                                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `@assembly-js/node-sdk` token decode is async / hits Assembly API                   | Feature 3 must verify this. If it requires a network call, `parseToken()` becomes async and all callers update. |
| `@assembly-js/node-sdk` not suitable as a dependency (license / size)               | Reimplement token decode using Assembly's documented JWT format.                                                |
| `p-throttle` sliding window behavior differs from Assembly's exact rate limit model | Run load tests against staging; fall back to `bottleneck` with a larger `minTime` only if needed.               |
| React hooks export causes issues with RSC (React Server Components)                 | Add `"use client"` directive at the top of `src/bridge-ui/index.ts`.                                            |
| Zod version conflicts in consuming apps                                             | Pin `zod` as a peer dependency; document compatibility.                                                         |
| Assembly API response shapes change without notice                                  | `validateResponses` flag gives teams an escape hatch; `AssemblyResponseParseError` is easy to catch.            |
