# assembly-kit — Implementation Plan

**Version:** 1.2
**Status:** Draft
**Date:** 2026-02-28
**Updated:** 2026-03-01 — SDK no longer parses tokens internally; `workspaceId` is a required constructor parameter; Feature 3 reframed as optional standalone utilities; Feature 6 simplified.

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

## Feature 3: Token Utilities (Optional Standalone Exports)

> Dependency: Feature 1 (errors), Feature 2 (schemas)
> **Note:** This feature is **not a dependency** for Feature 6 (Client Factory). The SDK treats tokens as opaque strings. These utilities are optional exports for apps that need to inspect or create token contents.

### What we're building

Optional standalone functions for decrypting, parsing, creating, and guarding Assembly iframe tokens. These are exported from the main `assembly-kit` entry point for apps that need to inspect token contents (e.g. to determine user type, extract workspaceId, or extract tokenId before constructing a client). The client factory does **not** use these internally.

Token decryption is entirely synchronous and local — no network call, no dependency on `@assembly-js/node-sdk`. See `docs/planning/node-sdk-internals.md` §2 for the algorithm walkthrough.

### Files (already created — Feature 3 is complete)

- `src/token/crypto.ts` — `deriveKey()`, `decryptTokenString()`, `encryptTokenString()` (internal)
- `src/token/parse.ts` — `parseToken()`, `createToken()`, `buildCompoundKey()` (public)
- `src/token/guards.ts` — `ensureIsClient()`, `ensureIsInternalUser()`, type predicates (public)
- `src/token/index.ts` — barrel export

### Public API

- **`parseToken({ token, apiKey }): TokenPayload`** — decrypt and validate an encrypted token string. Throws `AssemblyNoTokenError` / `AssemblyInvalidTokenError`.
- **`createToken({ payload, apiKey }): string`** — encrypt a `TokenPayload` into a hex-encoded token string (inverse of `parseToken`). Validates payload first.
- **`buildCompoundKey({ apiKey, payload }): string`** — build compound API key from a token payload. With tokenId: `${workspaceId}/${apiKey}/${tokenId}`. Without: `${workspaceId}/${apiKey}`.
- **`ensureIsClient(payload): ClientTokenPayload`** — narrows payload or throws `AssemblyUnauthorizedError`.
- **`ensureIsInternalUser(payload): InternalUserTokenPayload`** — narrows payload or throws `AssemblyUnauthorizedError`.
- **`isClientToken(payload): payload is ClientTokenPayload`** — type predicate, no throw.
- **`isInternalUserToken(payload): payload is InternalUserTokenPayload`** — type predicate, no throw.

### Typical usage pattern (optional)

Apps that need to inspect the token before constructing the client can use these utilities:

```ts
import { parseToken, ensureIsClient, createClient } from "assembly-kit";

const payload = parseToken({ token: rawToken, apiKey });
const client = ensureIsClient(payload);

const assemblyClient = createClient({
  workspaceId: payload.workspaceId,
  apiKey,
  token: rawToken,
  tokenId: payload.tokenId,
});
```

### Tests (complete — 27 tests passing)

- `parseToken` — null/empty/non-string/invalid/valid tokens
- `createToken` — round-trip, random IV, invalid payload
- `buildCompoundKey` — with/without tokenId
- `ensureIsClient` / `ensureIsInternalUser` — correct narrowing + error throwing
- `isClientToken` / `isInternalUserToken` — boolean predicates
- Block-aligned token — Node 24 PKCS7 edge case

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
  - `compoundKey: string` — the pre-built `X-API-Key` value (`workspaceId/apiKey` or `workspaceId/apiKey/tokenId`)
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

> Dependency: Feature 1, 2, 4, 5
> **Note:** Feature 3 (Token Utilities) is **not** a dependency. The client factory does not parse tokens — it receives `workspaceId` explicitly and treats `token` as an opaque string.

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
└── tasks.ts
```

### Implementation Steps

**6.1 — `ClientOptions` type**

`src/client/options.ts` — the public options type (see PRD §4.1). Key fields:

```ts
export type ClientOptions = {
  workspaceId: string; // required — always needed for compound key
  apiKey: string; // required
  token?: string; // raw encrypted token string — NOT parsed or decrypted
  isMarketplaceApp?: boolean; // default false
  tokenId?: string; // optional — appended to compound key if provided
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
}
```

Constructed internally by `createClient()`. Not exported directly (export `createClient` only).

**6.4 — `createClient()` factory**

`src/client/create-client.ts`:

```ts
export function createClient(options: ClientOptions): AssemblyClient;
```

Validation & construction sequence (all synchronous — no network call at construction):

1. **Validate `workspaceId`**: if empty/missing → throw `AssemblyMissingApiKeyError`.
2. **Validate `apiKey`**: if empty/missing → throw `AssemblyMissingApiKeyError`.
3. **Marketplace token guard**: if `isMarketplaceApp === true` and `token` is absent/empty → throw `AssemblyNoTokenError('Marketplace apps require a token')`.
4. **Build compound key**: `${workspaceId}/${apiKey}` (or `${workspaceId}/${apiKey}/${tokenId}` if `tokenId` is provided).
5. Create rate limiter (new `p-throttle` instance).
6. Create transport (new `ky` instance with `compoundKey`, `baseUrl`, throttle).
7. Construct `AssemblyClient` with transport + options. The `token` string is stored for resource methods that may need to forward it.
8. Return client.

No token parsing or decryption happens. The token is an opaque string.

**6.5 — Export from main entry**

`src/index.ts`: `export { createClient }`.

### Tests

`tests/client.test.ts`:

- `createClient({ workspaceId: '', apiKey: 'key' })` → `AssemblyMissingApiKeyError`.
- `createClient({ workspaceId: 'ws', apiKey: '' })` → `AssemblyMissingApiKeyError`.
- `createClient({ workspaceId: 'ws', apiKey: 'key', isMarketplaceApp: true })` (no token) → `AssemblyNoTokenError`.
- `createClient({ workspaceId: 'ws', apiKey: 'key', isMarketplaceApp: true, token: 'tok' })` → constructs successfully.
- `createClient({ workspaceId: 'ws', apiKey: 'key' })` (no token, no isMarketplaceApp) → constructs successfully.
- `tokenId` provided → `X-API-Key` includes `tokenId` in compound key: `ws/key/tokenId`.
- No `tokenId` → `X-API-Key` is `ws/key`.
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
Feature 2: Schemas           Feature 3: Token Utils (optional)     Feature 7: App Bridge
    ↓                              (standalone, no deps on 4-6)          ↓
Feature 4: Transport                                              Feature 8: React Hooks
    ↓
Feature 5: Pagination
    ↓
Feature 6: Client Factory (does NOT depend on Feature 3)
    ↓
Feature 9: Build Config
    ↓
Feature 10: JSDoc
```

Features 3, 7, and 8 can be developed in parallel with Features 4–6 since they have no shared dependencies. Feature 3 (Token Utilities) is standalone — it does not block or depend on the client factory. Feature 6 (Client Factory) receives `workspaceId` explicitly and does not parse tokens.

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
