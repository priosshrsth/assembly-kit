# assembly-kit — Product Requirements Document

**Version:** 1.1
**Status:** Draft
**Author:** Anit Shrestha
**Date:** 2026-02-28
**Updated:** 2026-02-28 — Token internals verified; `isMarketplaceApp` flag added; auth header corrected; token payload expanded.

---

## 1. Overview

### 1.1 Problem Statement

Every app built on the Assembly platform currently duplicates the same SDK integration work: token parsing, API access, rate-limit handling, retries, type definitions, and app-bridge postMessage wiring. This copy-paste engineering creates maintenance drift, inconsistent error handling, unsafe request sharing in serverless environments, and no shared type safety across the codebase.

### 1.2 Solution

`assembly-kit` is a production-grade, TypeScript-first SDK designed to be a single, well-maintained package that all Assembly apps can depend on. It abstracts the full lifecycle of interacting with the Assembly platform — from parsing iframe tokens and enforcing user identity, to making rate-limited, retry-safe API calls with full Zod-validated response types, to wiring app-bridge postMessage interactions with the Assembly dashboard.

### 1.3 Goals

- **Replace** repeated boilerplate across `client-home`, `xero-integration`, and all future apps.
- **Enforce correctness** at the type level and at runtime via Zod schemas.
- **Be safe** in serverless/edge environments: each `createClient()` call produces a fully isolated instance.
- **Be ergonomic**: APIs should feel natural and be well-documented with JSDoc.
- **Be production-ready**: retry logic, rate limiting, structured errors, and testability without hitting real APIs.

### 1.4 Non-Goals (v1.0)

- Browser / client-side HTTP requests (the HTTP transport targets Node.js server environments).
- Full OpenAPI codegen from Assembly's spec.
- GraphQL support.
- Assembly webhook signature verification (v2 candidate).
- Multi-workspace fan-out helpers (v2 candidate).

---

## 2. Audience & Use Cases

| Persona                                                      | Use Case                                                                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Developer building a **custom app** (single workspace)       | Single API key, single workspace. Needs `createClient()` scoped to that workspace, token parsing, and API access.       |
| Developer building a **marketplace app** (multi-workspace)   | Single API key installed across many workspaces. Must create a fresh client per request — no shared state.              |
| Developer building a **React app embedded in the dashboard** | Needs the app-bridge hooks (`usePrimaryCta`, `useSecondaryCta`, `useActionsMenu`) to control Assembly dashboard chrome. |
| Developer writing a **server action / API route** in Next.js | Needs `parseToken()`, `ensureIsClient()`, `ensureIsInternalUser()` guards, plus typed API responses.                    |

---

## 3. Scope

### 3.1 Package Name

```
assembly-kit
```

### 3.2 Entry Points (Export Map)

| Export path               | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `assembly-kit`            | Core client, token utilities, error classes   |
| `assembly-kit/schemas`    | All Zod schemas and inferred TypeScript types |
| `assembly-kit/app-bridge` | Framework-agnostic postMessage utilities      |
| `assembly-kit/bridge-ui`  | React app-bridge hooks (peer dep: `react`)    |

---

## 4. Feature Requirements

### 4.1 Feature: Client Factory (`createClient`)

**Description**
The primary entry point. Returns a fully isolated client instance. Never shares state between calls — safe for Vercel, Cloudflare Workers, and any compute platform.

**Background: how the existing SDK works (and why it's unsafe)**
`@assembly-js/node-sdk` stores auth headers on a module-level `OpenAPI` singleton. In a serverless environment (Vercel, Cloudflare Workers), concurrent requests within the same runtime instance share that singleton — meaning tenant A's request can end up using tenant B's credentials. `assembly-kit` solves this by keeping _all state inside each `createClient()` instance_: HTTP transport, rate limiter, parsed token, and compound auth key.

**Requirements**

- `createClient(options: ClientOptions): AssemblyClient`
- `ClientOptions`:
  - `apiKey: string` — required. Assembly API key for the workspace or marketplace app.
  - `token?: string` — conditionally required (see `isMarketplaceApp` below). The AES-128-CBC encrypted iframe token from the `?token=` query parameter.
  - `isMarketplaceApp?: boolean` — default `false`.
    - When `true`: `token` is **required**. Throw `AssemblyNoTokenError` at construction time if `token` is absent or empty. Marketplace apps are installed across many workspaces and must always operate in the context of a specific workspace identified by the token.
    - When `false`: `token` is optional. The client can still be used for endpoints that don't require workspace-user context (e.g. workspace-level admin operations in a custom app with a dedicated API key).
  - `retryCount?: number` — default `2`. Max retry attempts for 429 / 5xx responses.
  - `retryMinTimeout?: number` — default `1000`. Min delay in ms between retries.
  - `retryMaxTimeout?: number` — default `5000`. Max delay between retries (exponential backoff).
  - `rateLimitPerSecond?: number` — default `20`. Maximum requests per second to stay within Assembly's limit.
  - `validateResponses?: boolean` — default `true`. When `true`, all responses are parsed through Zod schemas. When `false`, raw typed responses are returned (for performance or when types are trusted).
  - `baseUrl?: string` — default `https://api.assembly.com`. Overridden at construction if the decrypted token contains a `baseUrl` field (token-level `baseUrl` takes precedence over this option).
- Each `createClient()` call MUST create a new instance of the HTTP transport, rate limiter, and retry handler. No module-level singletons — all state is instance-scoped.
- At construction time, if `token` is provided:
  1. Decrypt and parse the token locally (see §4.2 / node-sdk-internals.md). No network call.
  2. Construct the compound API key: `${workspaceId}/${apiKey}` (or `${workspaceId}/${apiKey}/${tokenId}` if `tokenId` is present in payload).
  3. If `tokenPayload.baseUrl` exists, use it as the transport base URL.
- If `token` is NOT provided (and `isMarketplaceApp` is `false`), the raw `apiKey` alone cannot form a valid compound key for production. The client is still constructed, but only endpoints that can authenticate with the raw key will work. Endpoints requiring token context will throw `AssemblyNoTokenError` at call time.
- The client exposes resource namespaces: `client.workspace`, `client.clients`, `client.companies`, `client.internalUsers`, `client.notifications`, `client.customFields`, `client.tasks`, `client.token`.

**App type mental model**

| App type                           | `isMarketplaceApp` | `token`  | Behaviour                                                                             |
| ---------------------------------- | ------------------ | -------- | ------------------------------------------------------------------------------------- |
| Marketplace app                    | `true`             | Required | Token required at construction. Compound key used for all requests.                   |
| Custom app (with user context)     | `false`            | Provided | Token parsed at construction. Compound key used.                                      |
| Custom app (admin/no-user context) | `false`            | Omitted  | Raw apiKey used. Token-requiring endpoints throw `AssemblyNoTokenError` at call time. |

**Error behaviour**

- `apiKey` empty or missing → throw `AssemblyMissingApiKeyError` immediately on construction.
- `isMarketplaceApp: true` + no `token` → throw `AssemblyNoTokenError` immediately on construction.
- `token` provided but fails decryption or payload validation → throw `AssemblyInvalidTokenError` on construction.

---

### 4.2 Feature: HTTP Transport Layer

**Description**
The internal request engine powering all API calls. Uses `ky` for HTTP with built-in retry semantics.

**Requirements**

- Built on [`ky`](https://www.npmjs.com/package/ky) (well-maintained, fetch-based, native ESM).
- Retry strategy:
  - Retries only on `429 Too Many Requests` and `5xx` server errors.
  - Uses exponential backoff: `retryMinTimeout * (2 ^ attempt)`, capped at `retryMaxTimeout`.
  - Respects `Retry-After` headers from Assembly API when present on `429` responses.
  - Max retry count controlled by `ClientOptions.retryCount` (default `2`).
- Rate limiting:
  - Implements a **sliding window** approach (rolling window, not a fixed 1-second slot).
  - Default: max `20` requests per second, matching Assembly's documented limit.
  - Does NOT use `bottleneck` with a fixed `minTime` (avoids unnecessary throttling when request rate is low).
  - Uses a lightweight in-memory implementation: [`p-throttle`](https://www.npmjs.com/package/p-throttle) (well-maintained, tiny, zero-dep, ESM).
  - `p-throttle` is configured per-client-instance — each `createClient()` has its own throttle.
- **Auth header:** `X-API-Key: <compoundKey>` — **not** `Authorization: Bearer`. The compound key is built from the parsed token (see §4.1). This matches Assembly's actual API authentication scheme.
- **SDK version header:** `X-Assembly-SDK-Version: <assemblyKitVersion>` on every request.
- All requests include `Content-Type: application/json` on mutation methods.
- Responses are parsed through Zod schemas when `validateResponses: true`.
- Structured error mapping: HTTP error responses are translated to typed `AssemblyError` subclasses before surfacing to callers.
- `baseUrl` is configurable per client instance; overridden by token-level `baseUrl` if present.

**HTTP error mapping**

| HTTP Status             | Thrown Error                |
| ----------------------- | --------------------------- |
| 400                     | `AssemblyValidationError`   |
| 401                     | `AssemblyUnauthorizedError` |
| 403                     | `AssemblyForbiddenError`    |
| 404                     | `AssemblyNotFoundError`     |
| 429                     | `AssemblyRateLimitError`    |
| 5xx                     | `AssemblyServerError`       |
| Network / fetch failure | `AssemblyConnectionError`   |

---

### 4.3 Feature: Error Model

**Description**
A structured, typed hierarchy of errors making error handling predictable and exhaustive.

**Requirements**

- `AssemblyError` — base class. Extends `Error`. Has:
  - `name: string` — set to the subclass name.
  - `message: string`
  - `statusCode: number` — HTTP status code.
  - `details?: unknown` — raw response body or additional debug info.
- Subclasses (all extend `AssemblyError`):
  - `AssemblyMissingApiKeyError` — 400 / construction-time.
  - `AssemblyNoTokenError` — 400. Token is required for this operation but was not provided.
  - `AssemblyInvalidTokenError` — 401. Token string provided but could not be decrypted / has invalid payload.
  - `AssemblyUnauthorizedError` — 401. API key rejected by Assembly.
  - `AssemblyForbiddenError` — 403. API key valid but lacks permission.
  - `AssemblyNotFoundError` — 404.
  - `AssemblyValidationError` — 422. Request payload rejected by Assembly API.
  - `AssemblyRateLimitError` — 429. Includes `retryAfter?: number` field.
  - `AssemblyServerError` — 500–599. Transient API error.
  - `AssemblyConnectionError` — Network-level failure.
  - `AssemblyResponseParseError` — Zod schema mismatch on response. Includes `zodError: ZodError`.
- All error classes are exported from the main `assembly-kit` entry point.
- A factory function `createAssemblyError(name, defaultMessage, statusCode)` is used internally to produce typed subclasses without boilerplate (mirrors the `baseServerErrorFactory` pattern from existing code).

---

### 4.4 Feature: Token Utilities

**Description**
Standalone functions for decrypting, parsing, validating, and guarding Assembly iframe tokens. Token decryption is **fully local** (no network call) — see `docs/planning/node-sdk-internals.md` §2 for the full algorithm.

**Token decryption algorithm (reimplemented from `@assembly-js/node-sdk`, no dep needed)**

1. `generate128BitKey(apiKey: string): string` — HMAC-SHA256 of the API key, take first 32 hex chars.
2. `decryptToken(apiKey: string, encryptedToken: string): string` — AES-128-CBC decrypt. The hex-encoded token's first 16 bytes are the IV; the rest is ciphertext. Returns UTF-8 JSON string.
3. `parseTokenPayload(json: string): TokenPayload` — JSON.parse + Zod schema validation.

**Requirements**

- `parseToken(token: unknown, apiKey: string): TokenPayload`
  - Accepts the raw `?token=` query parameter value and the workspace API key.
  - All decryption is synchronous — no `await` needed.
  - Throws `AssemblyNoTokenError` if `token` is nullish or empty.
  - Throws `AssemblyInvalidTokenError` if the string cannot be decrypted or the payload fails the schema (includes the underlying error as `details`).
  - Unknown fields in the token JSON are **silently stripped** (forward-compatible — Assembly may add fields in future versions).
  - Returns typed `TokenPayload`:
    ```ts
    type TokenPayload = {
      workspaceId: string; // always present
      clientId?: string; // present for client (portal) users
      companyId?: string; // present for client users
      internalUserId?: string; // present for internal (team member) users
      notificationId?: string; // present when token is notification-scoped
      tokenId?: string; // present in some marketplace tokens; used in compound key
      baseUrl?: string; // if present, overrides the API base URL for this session
    };
    ```

- `ensureIsClient(payload: TokenPayload): ClientTokenPayload`
  - Narrows payload to `{ workspaceId, clientId, companyId, ...rest }`.
  - Throws `AssemblyUnauthorizedError('Token does not belong to a client user')` if `clientId` or `companyId` is absent.

- `ensureIsInternalUser(payload: TokenPayload): InternalUserTokenPayload`
  - Narrows payload to `{ workspaceId, internalUserId, ...rest }`.
  - Throws `AssemblyUnauthorizedError('Token does not belong to an internal user')` if `internalUserId` is absent.

- `isClientToken(payload: TokenPayload): payload is ClientTokenPayload` — type predicate, no throw.
- `isInternalUserToken(payload: TokenPayload): payload is InternalUserTokenPayload` — type predicate, no throw.

**Internal compound key construction (used by the transport layer, not public API)**

```
tokenId present: `${workspaceId}/${apiKey}/${tokenId}`
tokenId absent:  `${workspaceId}/${apiKey}`
```

This string is the value of the `X-API-Key` header on all requests.

---

### 4.5 Feature: Assembly API Resources

**Description**
Typed, schema-validated methods for every Assembly API endpoint, organized into resource namespaces on the client.

**Requirements**

All resource methods:

- Accept typed request parameters validated at compile time.
- Return Zod-validated response types when `validateResponses: true`.
- Use the shared transport (rate limiting + retry).
- Methods on resource objects that require a token MUST check `this.token` and throw `AssemblyNoTokenError` if absent, before making any HTTP call.

**Resource: `client.workspace`**

- `getWorkspace(): Promise<WorkspaceResponse>`

**Resource: `client.clients`**

- `list(args?: ListArgs & { companyId?: string }): Promise<ClientsResponse>`
- `get(id: string): Promise<ClientResponse>`
- `create(body: ClientCreateRequest, sendInvite?: boolean): Promise<ClientResponse>`
- `update(id: string, body: Partial<ClientCreateRequest>): Promise<ClientResponse>`
- `delete(id: string): Promise<void>`

**Resource: `client.companies`**

- `list(args?: ListArgs & { isPlaceholder?: boolean }): Promise<CompaniesResponse>`
- `get(id: string): Promise<CompanyResponse>`
- `create(body: CompanyCreateRequest): Promise<CompanyResponse>`
- `update(id: string, body: Partial<CompanyCreateRequest>): Promise<CompanyResponse>`
- `delete(id: string): Promise<void>`
- `getClients(companyId: string): Promise<ClientResponse[]>` — convenience method, paginates fully.

**Resource: `client.internalUsers`**

- `list(args?: ListArgs): Promise<InternalUsersResponse>`
- `get(id: string): Promise<InternalUser>`

**Resource: `client.notifications`**

- `list(opts?: { includeRead?: boolean; recipientClientId?: string }): Promise<NotificationsResponse>`
- `create(body: NotificationRequestBody): Promise<NotificationCreatedResponse>`

**Resource: `client.customFields`**

- `list(entityType: 'client' | 'company'): Promise<ListCustomFieldResponse>`

**Resource: `client.token`**

- `getPayload(): Promise<TokenPayload>` — requires `token` to have been passed to `createClient()`.

**Pagination:**

- `ListArgs` shape: `{ limit?: number; nextToken?: string }`.
- All list responses include `{ data: T[]; nextToken?: string }`.
- A `paginate<T>(fn: (args: ListArgs) => Promise<PaginatedResponse<T>>, args?: ListArgs): AsyncIterable<T>` helper is exported from the main entry point. It fully abstracts cursor-based pagination.

---

### 4.6 Feature: Zod Schemas & Types

**Description**
A canonical, single source of truth for all Assembly data shapes, available as a separate export for use in consuming apps without importing the full client.

**Requirements**

- All schemas live in `assembly-kit/schemas`.
- **Base schemas** (primitive entity shapes):
  - `CompanySchema`
  - `ClientSchema`
  - `InternalUserSchema`
  - `WorkspaceSchema`
  - `CustomFieldSchema`
  - `TokenPayloadSchema`
  - `HexColorSchema`
- **Response schemas** (composed from base schemas):
  - `CompanyResponseSchema`, `CompaniesResponseSchema`
  - `ClientResponseSchema`, `ClientsResponseSchema`
  - `InternalUserResponseSchema`, `InternalUsersResponseSchema`
  - `WorkspaceResponseSchema`
  - `NotificationsResponseSchema`
  - `ListCustomFieldResponseSchema`
  - `TasksResponseSchema`
- **Request schemas** (used for validating outgoing payloads, not enforced in transport but exported for app-side validation):
  - `ClientCreateRequestSchema`
  - `CompanyCreateRequestSchema`
  - `NotificationRequestBodySchema`
- **Enum schemas:**
  - `CustomFieldTypeSchema` (`address | email | phoneNumber | text | number | url | multiSelect`)
  - `CustomFieldEntityTypeSchema` (`client | company`)
  - `TaskStatusSchema` (`todo | inProgress | completed`)
- All schemas export their inferred TypeScript type: `export type Company = z.infer<typeof CompanySchema>`.
- Uses `zod` v3 (widely supported) — pin to a specific minor version.

---

### 4.7 Feature: App Bridge (Framework-Agnostic)

**Description**
A framework-agnostic utility layer for communicating with the Assembly dashboard iframe host via `window.parent.postMessage`. This replaces the scattered implementations across client-home.

**Requirements**

Entry point: `assembly-kit/app-bridge`

- `DASHBOARD_DOMAINS: string[]` — list of valid Assembly dashboard origin URLs.
  ```ts
  const DASHBOARD_DOMAINS = [
    "https://dashboard.assembly.com",
    "https://dashboard.assembly-staging.com",
  ];
  ```
- `sendToParent(payload: AppBridgePayload, portalUrl?: string): void`
  - If `portalUrl` is provided, posts only to that exact origin.
  - Otherwise, fans out to all `DASHBOARD_DOMAINS`.
  - Safe to call server-side (no-op if `window` is undefined) — does not throw in SSR.
- `AppBridgePayload` — discriminated union of all supported message types:
  - `PrimaryCtaPayload` (`type: 'header.primaryCta'`)
  - `SecondaryCtaPayload` (`type: 'header.secondaryCta'`)
  - `ActionsMenuPayload` (`type: 'header.actionsMenu'`)
- `Icons` enum: `Archive | Plus | Templates | Trash | Download | Disconnect`.

---

### 4.8 Feature: React App Bridge Hooks

**Description**
React-specific wrappers over the app-bridge core, replacing the scattered `usePrimaryCta`/`useSecondaryCta` hooks in client-home.

**Requirements**

Entry point: `assembly-kit/bridge-ui`
Peer dependency: `react >= 18`

- `usePrimaryCta(cta: CtaConfig, opts?: BridgeOpts): void`
  - On mount: sends `header.primaryCta` payload to parent.
  - On `beforeunload`: sends a cleared `header.primaryCta` payload.
  - Listens for `header.primaryCta.onClick` messages and calls `cta.onClick?.()`.
  - Cleans up listeners on unmount.
- `useSecondaryCta(cta: CtaConfig, opts?: BridgeOpts): void` — same pattern for secondary CTA.
- `useActionsMenu(items: ActionItem[], opts?: BridgeOpts): void` — drives the `header.actionsMenu` message type.
- `CtaConfig`:
  ```ts
  type CtaConfig = {
    label?: string;
    icon?: Icons;
    onClick?: () => void;
    color?: string;
  };
  ```
- `BridgeOpts`:
  ```ts
  type BridgeOpts = {
    portalUrl?: string;
    show?: boolean; // default true; when false, clears the CTA slot
  };
  ```

---

### 4.9 Feature: Tooling & Build

**Requirements**

- **Package manager:** Bun.
- **Runtime target:** Node.js 18+, Node.js 24+, and Bun (see note below).
- **Module format:** ESM-only (`"type": "module"` in package.json).
- **TypeScript:** strict mode, `moduleResolution: bundler`, `target: ES2022`.
- **Bundler:** `bun build` for all entry points. Output in `dist/`.
- **Formatter:** Ultracite.
- **Linter:** Oxlint.
- **Test runner:** `bun test`. Zero real HTTP calls in tests — all Assembly API calls are mocked at the `ky` level using `ky`'s `hooks` or by dependency-injecting a custom `fetch`.
- **Export map** in `package.json`:
  ```json
  {
    "exports": {
      ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
      "./schemas": {
        "import": "./dist/schemas.js",
        "types": "./dist/schemas.d.ts"
      },
      "./app-bridge": {
        "import": "./dist/app-bridge.js",
        "types": "./dist/app-bridge.d.ts"
      },
      "./bridge-ui": {
        "import": "./dist/bridge-ui.js",
        "types": "./dist/bridge-ui.d.ts"
      }
    }
  }
  ```
- **Dependencies (runtime):**
  - `ky` — HTTP client.
  - `p-throttle` — rate limiting.
  - `zod` — schema validation.
- **Dependencies (dev):**
  - `typescript`
  - `@types/node`
  - `ultracite`
  - `oxlint`
  - `bun-types`

> **Runtime Support Note**
>
> `assembly-kit` targets three runtimes:
>
> | Runtime | Version       | Status                                                                                                                                                   |
> | ------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Node.js | 18.x (LTS)    | Primary target — widest adoption in production Next.js apps                                                                                              |
> | Node.js | 24.x          | Supported — test suite must pass; verify `node:crypto` AES-128-CBC API compatibility                                                                     |
> | Bun     | Latest stable | Supported — Bun implements Node.js `node:crypto` APIs; token decryption, `ky` (fetch-based), and `p-throttle` all work natively in Bun without any shims |
>
> **Key considerations for multi-runtime support:**
>
> - Use `node:crypto` (explicit Node protocol prefix) rather than bare `crypto` imports — Bun recognises the `node:` prefix.
> - Avoid any Node.js APIs that Bun does not support (e.g. `node:vm`, `node:worker_threads` internals) — none are needed by this SDK.
> - `ky` is fetch-based and works in any runtime with a global `fetch` (Node 18+ and Bun both qualify).
> - `bun test` is the primary test runner; CI should run the same test suite under `node --experimental-vm-modules` (for Node 18/24) to confirm compatibility.
> - The `engines` field in `package.json` should reflect all supported runtimes:
>   ```json
>   "engines": {
>     "node": ">=18.0.0",
>     "bun": ">=1.0.0"
>   }
>   ```

---

## 5. Architecture

```
assembly-kit/
├── src/
│   ├── index.ts                  # Main export: createClient, errors, token utils, paginate
│   ├── client/
│   │   ├── create-client.ts      # createClient() factory
│   │   ├── assembly-client.ts    # AssemblyClient class
│   │   └── options.ts            # ClientOptions type
│   ├── transport/
│   │   ├── http.ts               # ky-based HTTP transport with retry/rate-limit
│   │   ├── rate-limiter.ts       # p-throttle wrapper
│   │   └── error-mapper.ts       # HTTP status -> AssemblyError subclass mapping
│   ├── resources/
│   │   ├── workspace.ts
│   │   ├── clients.ts
│   │   ├── companies.ts
│   │   ├── internal-users.ts
│   │   ├── notifications.ts
│   │   ├── custom-fields.ts
│   │   ├── tasks.ts
│   │   └── token.ts
│   ├── token/
│   │   ├── parse.ts              # parseToken()
│   │   └── guards.ts             # ensureIsClient(), ensureIsInternalUser(), predicates
│   ├── errors/
│   │   ├── base.ts               # AssemblyError, createAssemblyError factory
│   │   └── index.ts              # All error subclasses
│   ├── pagination/
│   │   └── paginate.ts           # paginate() AsyncIterable helper
│   ├── schemas/
│   │   ├── index.ts              # Re-exports all schemas (schemas entry point)
│   │   ├── base/
│   │   │   ├── company.ts
│   │   │   ├── client.ts
│   │   │   ├── internal-user.ts
│   │   │   ├── workspace.ts
│   │   │   ├── custom-field.ts
│   │   │   └── token.ts
│   │   ├── responses/
│   │   │   ├── company.ts
│   │   │   ├── client.ts
│   │   │   ├── internal-user.ts
│   │   │   ├── workspace.ts
│   │   │   ├── notification.ts
│   │   │   ├── custom-field.ts
│   │   │   └── task.ts
│   │   └── requests/
│   │       ├── client.ts
│   │       ├── company.ts
│   │       └── notification.ts
│   ├── app-bridge/
│   │   ├── index.ts              # app-bridge entry point
│   │   ├── constants.ts          # DASHBOARD_DOMAINS
│   │   ├── send.ts               # sendToParent()
│   │   └── types.ts              # AppBridgePayload, Icons, CtaConfig, etc.
│   └── react/
│       ├── index.ts              # react entry point
│       ├── use-primary-cta.ts
│       ├── use-secondary-cta.ts
│       └── use-actions-menu.ts
├── tests/
│   ├── client.test.ts
│   ├── transport.test.ts
│   ├── token.test.ts
│   ├── errors.test.ts
│   ├── pagination.test.ts
│   ├── schemas.test.ts
│   └── app-bridge.test.ts
├── docs/
│   └── planning/
│       ├── prd.md
│       └── implementation-plan.md
├── package.json
├── tsconfig.json
└── bunfig.toml
```

---

## 6. Data Flow

### 6.1 Authenticated Server Request (typical usage)

```
Request arrives at Next.js route/action
  → Extract token from searchParams/headers
  → parseToken(token)              → TokenPayload | throws AssemblyNoTokenError/AssemblyInvalidTokenError
  → ensureIsClient(payload)        → ClientTokenPayload | throws AssemblyUnauthorizedError
  → createClient({ apiKey, token })
  → client.clients.list()
      → rate limiter (p-throttle)
      → ky.get('/clients')
      → on 429: wait retryAfter, retry (max 2x)
      → on 5xx: exponential backoff, retry (max 2x)
      → response → Zod parse → ClientsResponse
      → return typed data to route handler
```

### 6.2 App Bridge (in-iframe React app)

```
React component mounts
  → usePrimaryCta({ label: 'Save', onClick: handleSave })
      → sendToParent({ type: 'header.primaryCta', label: 'Save', onClick: 'header.primaryCta.onClick' })
          → window.parent.postMessage(payload, 'https://dashboard.assembly.com')
  → addEventListener('message', handler)
      → on message.type === 'header.primaryCta.onClick': call handleSave()
  → component unmounts → removeEventListener
  → beforeunload → sendToParent({ type: 'header.primaryCta' }) [clears CTA]
```

---

## 7. Security Considerations

- **No module-level singleton client**: Prevents token/apiKey leakage between concurrent serverless requests.
- **App-bridge origin validation**: `sendToParent` only posts to known Assembly dashboard origins; no wildcard `*` target.
- **API keys never logged**: Transport layer MUST NOT log the `Authorization` header or `apiKey` value.
- **Token never stored**: Token string is only decoded into payload; raw token is not persisted anywhere by the SDK.
- **Zod schema validation**: Response validation catches unexpected shape changes from Assembly API before they cause downstream data corruption.

---

## 8. Testing Strategy

- All tests use `bun test`.
- No real HTTP calls: the HTTP transport accepts an injectable `fetch` function; tests pass a mock `fetch` that returns preset responses.
- Coverage targets:
  - Error mapping: every status code → correct `AssemblyError` subclass.
  - Token utilities: valid token, missing token, invalid payload (each guard + predicate).
  - Retry logic: 429 with `Retry-After`, 503, success after retry, max retries exceeded.
  - Rate limiting: 21 requests in 1 second → 21st is delayed, not dropped.
  - Pagination: multi-page iteration, single page, empty response.
  - Zod schemas: valid payload passes, invalid payload throws `AssemblyResponseParseError`.
  - App-bridge: `sendToParent` posts to all domains when no `portalUrl`; posts to single origin when provided.
  - React hooks: tested with `@testing-library/react` if added; otherwise deferred.

---

## 9. Versioning & Publishing

- Semantic versioning: `1.0.0` for initial stable release.
- Published to npm as `assembly-kit`.
- `package.json` `"sideEffects": false` for tree-shaking.
- Changelog maintained in `CHANGELOG.md`.

---

## 10. Open Questions

| #   | Question                                                                                                                                                                               | Status                                                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Does `@assembly-js/node-sdk` expose token decoding without making a network call?                                                                                                      | **Resolved** — fully local, synchronous AES-128-CBC + HMAC-SHA256 using Node.js `crypto`. No network call. See `node-sdk-internals.md`.                                                                                       |
| 2   | Should token decoding be reimplemented or delegated to `@assembly-js/node-sdk`?                                                                                                        | **Resolved** — reimplement. The algorithm is simple (4 lines of Node.js `crypto`), the package uses yarn/CJS internals, and we should avoid the singleton `OpenAPI` object entirely. Full details in `node-sdk-internals.md`. |
| 3   | What is the exact format of the `Retry-After` header from Assembly's 429 responses?                                                                                                    | Needs verification against API docs                                                                                                                                                                                           |
| 4   | Should `assembly-kit/bridge-ui` be a separate npm package to avoid shipping React as a dep for pure server users?                                                                      | Decision needed                                                                                                                                                                                                               |
| 5   | Tasks endpoint (`/tasks/public`) uses a custom token encoding — should `encodePayload` from crypto utils be part of assembly-kit or remain app-specific?                               | Decision needed                                                                                                                                                                                                               |
| 6   | For custom apps with no token provided, only local/staging envs are supported by the existing SDK. Does Assembly's production API accept a raw `apiKey` without a compound key at all? | Needs verification                                                                                                                                                                                                            |
