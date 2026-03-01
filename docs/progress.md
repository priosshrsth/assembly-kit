# assembly-kit — Implementation Progress

Tracks implementation status against the plan in `docs/planning/implementation-plan.md`.

Legend: ✅ done · 🚧 in progress · ⬜ not started

---

## Phase 0: Scaffold

- ✅ Repo & tooling bootstrap (bunup, tsconfig, lefthook, oxlint, ultracite)
- ✅ `src/index.ts` — exports all error classes
- ✅ `src` path alias (`@/*`) configured in tsconfig.json
- ✅ `bunup.config.ts` — 4 entry points (index, schemas, app-bridge, react)
- ✅ Runtime deps: `zod` installed
- ⬜ Runtime deps: `ky`, `p-throttle` (needed for Feature 4)
- ✅ Entry point stubs: `src/schemas/index.ts`, `src/app-bridge/index.ts`, `src/react/index.ts`
- ⬜ Test fixtures: `test/fixtures/tokens.ts` (encrypted token constants for token tests)

---

## Feature 1: Error Model ✅

> No external runtime deps required (zod needed for `ZodError` type only).

- ✅ `src/errors/base.ts`
  - ✅ `AssemblyError` base class (`name`, `statusCode`, `details?`)
- ✅ `src/errors/index.ts` — all subclasses as named classes
  - ✅ `AssemblyMissingApiKeyError` (400)
  - ✅ `AssemblyNoTokenError` (400)
  - ✅ `AssemblyInvalidTokenError` (401)
  - ✅ `AssemblyUnauthorizedError` (401)
  - ✅ `AssemblyForbiddenError` (403)
  - ✅ `AssemblyNotFoundError` (404)
  - ✅ `AssemblyValidationError` (422)
  - ✅ `AssemblyRateLimitError` (429) — adds `retryAfter?: number`
  - ✅ `AssemblyServerError` (500)
  - ✅ `AssemblyConnectionError` (503)
  - ✅ `AssemblyResponseParseError` — adds `zodError: ZodError`
- ✅ `src/index.ts` re-exports all error classes
- ✅ `test/errors.test.ts` (56 tests passing)
  - ✅ Each subclass has correct `.name`, `.statusCode`, `.message`
  - ✅ `instanceof AssemblyError` true for all subclasses
  - ✅ `AssemblyRateLimitError` has `.retryAfter` field
  - ✅ `AssemblyResponseParseError` has `.zodError` field
  - ✅ Custom message override works
- ✅ `bun run type-check` passes
- ✅ `bun test` passes

> **Note:** `createAssemblyError` factory pattern was dropped — `isolatedDeclarations: true` forbids exporting anonymous class expressions. Each error is a named class declaration.

---

## Feature 2: Zod Schemas & Types ✅

> Dependency: Feature 1

- ✅ `src/schemas/base/company.ts`
- ✅ `src/schemas/base/client.ts`
- ✅ `src/schemas/base/internal-user.ts`
- ✅ `src/schemas/base/workspace.ts`
- ✅ `src/schemas/base/custom-field.ts`
- ✅ `src/schemas/base/token.ts` — `TokenPayloadSchema` (strips unknown fields by default in Zod 4)
- ✅ `src/schemas/base/hex-color.ts` — `HexColorSchema`
- ✅ Enum schemas: `CustomFieldTypeSchema`, `CustomFieldEntityTypeSchema`, `TaskStatusSchema`
- ✅ `src/schemas/responses/` — 7 response schemas (wrapping base schemas)
- ✅ `src/schemas/requests/` — 3 request schemas
- ✅ `src/schemas/index.ts` — barrel export (schemas entry point)
- ✅ `test/schemas.test.ts` (48 tests passing)
  - ✅ Valid shapes pass each schema
  - ✅ Missing required fields fail validation
  - ✅ `TokenPayloadSchema` strips unknown fields
  - ✅ `HexColorSchema` rejects invalid and accepts valid hex
- ✅ `bun run type-check` passes
- ✅ `bun test` passes

> **Note:** All exported schema `const`s are annotated with `z.ZodType<T>` using manually-defined interface types to satisfy `isolatedDeclarations: true`. Zod 4's `z.uuid()` enforces strict UUID format — test fixtures must use valid UUIDs.

---

## Feature 3: Token Utilities

> Dependencies: Feature 1, Feature 2

- ⬜ `src/token/crypto.ts`
  - ⬜ `deriveDecryptionKey(apiKey)` — HMAC-SHA256 → hex → slice(0,32)
  - ⬜ `decryptTokenString(apiKey, encryptedToken)` — AES-128-CBC, `setAutoPadding(false)`, manual PKCS7 strip
- ⬜ `src/token/parse.ts`
  - ⬜ `parseToken(token, apiKey): TokenPayload`
  - ⬜ `buildCompoundKey(apiKey, payload)` — internal helper
- ⬜ `src/token/guards.ts`
  - ⬜ `ensureIsClient(payload)`
  - ⬜ `ensureIsInternalUser(payload)`
  - ⬜ `isClientToken(payload)` — type predicate
  - ⬜ `isInternalUserToken(payload)` — type predicate
- ⬜ `src/token/index.ts` — barrel export
- ⬜ `test/fixtures/tokens.ts` — pre-generated encrypted token constants
- ⬜ `test/token.test.ts`
  - ⬜ Null/empty/non-string token → `AssemblyNoTokenError`
  - ⬜ Invalid hex → `AssemblyInvalidTokenError`
  - ⬜ Valid client token → `TokenPayload` with `clientId` + `companyId`
  - ⬜ Valid internal user token → `TokenPayload` with `internalUserId`
  - ⬜ Token with `tokenId` → payload includes `tokenId`
  - ⬜ Token with `baseUrl` → payload includes `baseUrl`
  - ⬜ Block-aligned plaintext (Node 24 PKCS7 edge case) decrypts correctly
  - ⬜ `buildCompoundKey` with/without `tokenId`
  - ⬜ Guard and predicate functions
- ⬜ `bun run type-check` passes
- ⬜ `bun test` passes

---

## Feature 4: HTTP Transport Layer

> Dependencies: Feature 1 · Install: `ky`, `p-throttle`

- ⬜ `bun add ky p-throttle`
- ⬜ `src/transport/rate-limiter.ts` — `createRateLimiter(requestsPerSecond)`
- ⬜ `src/transport/error-mapper.ts` — `mapHttpError(response)` → typed `AssemblyError`
- ⬜ `src/transport/http.ts` — `createTransport(options)` with injectable `fetch`
  - ⬜ `X-API-Key` header (not `Authorization: Bearer`)
  - ⬜ `X-Assembly-SDK-Version` header
  - ⬜ Retry on 429 / 5xx only, exponential backoff, respects `Retry-After`
  - ⬜ Rate limiting via `p-throttle` in `beforeRequest` hook
- ⬜ `test/transport.test.ts` (all via mock `fetch` — no real HTTP calls)
  - ⬜ 200 → resolves with parsed JSON
  - ⬜ 404 → `AssemblyNotFoundError`
  - ⬜ 429 + `Retry-After` → `AssemblyRateLimitError` with `retryAfter`
  - ⬜ 429 once then 200 → successful retry
  - ⬜ 503 → retries then `AssemblyServerError`
  - ⬜ 21 concurrent calls → 21st is delayed by rate limiter
  - ⬜ `X-API-Key` header verified
  - ⬜ `X-Assembly-SDK-Version` header verified
- ⬜ `bun run type-check` passes
- ⬜ `bun test` passes

---

## Feature 5: Pagination Helper

> Dependency: Feature 4

- ⬜ `src/pagination/paginate.ts` — `paginate<T>(fn, initialArgs?)` AsyncIterable generator
- ⬜ `src/index.ts` re-exports `paginate`
- ⬜ `test/pagination.test.ts`
  - ⬜ Single page (no `nextToken`) → all items, stops
  - ⬜ Multi-page → all items in order
  - ⬜ Empty first page → yields nothing
  - ⬜ `data: null` → yields nothing, no throw
- ⬜ `bun run type-check` passes
- ⬜ `bun test` passes

---

## Feature 6: Client Factory & Resource Classes

> Dependencies: Features 1–5

- ⬜ `src/client/options.ts` — `ClientOptions` type
- ⬜ `src/client/assembly-client.ts` — `AssemblyClient` class
- ⬜ `src/client/create-client.ts` — `createClient()` factory
- ⬜ `src/resources/workspace.ts`
- ⬜ `src/resources/clients.ts`
- ⬜ `src/resources/companies.ts`
- ⬜ `src/resources/internal-users.ts`
- ⬜ `src/resources/notifications.ts`
- ⬜ `src/resources/custom-fields.ts`
- ⬜ `src/resources/tasks.ts`
- ⬜ `src/resources/token.ts`
- ⬜ `test/client.test.ts` (all transport calls mocked)
  - ⬜ Empty `apiKey` → `AssemblyMissingApiKeyError`
  - ⬜ `isMarketplaceApp: true` without token → `AssemblyNoTokenError`
  - ⬜ Bad token → `AssemblyInvalidTokenError`
  - ⬜ Two `createClient()` calls produce independent instances
  - ⬜ Token `baseUrl` overrides default base URL
  - ⬜ Token `tokenId` included in compound key
  - ⬜ Resource method without token → `AssemblyNoTokenError`
  - ⬜ `validateResponses: false` → raw data returned
  - ⬜ `validateResponses: true` + bad shape → `AssemblyResponseParseError`
- ⬜ `bun run type-check` passes
- ⬜ `bun test` passes

---

## Feature 7: App Bridge (Framework-Agnostic) ✅

> No dependency on core SDK layers (parallel track)

- ✅ `src/app-bridge/constants.ts` — `DASHBOARD_DOMAINS`
- ✅ `src/app-bridge/types.ts` — `Icons`, `AppBridgePayload` (discriminated union), `CtaConfig`, `ActionItem`, `BridgeOpts`
- ✅ `src/app-bridge/send.ts` — `sendToParent(payload, portalUrl?)` — SSR-safe, `ensureHttps` internal helper
- ✅ `src/app-bridge/index.ts` — barrel export
- ✅ `test/app-bridge.test.ts` (10 tests passing)
  - ✅ With `portalUrl` → `postMessage` called once with that origin
  - ✅ Without `portalUrl` → called once per `DASHBOARD_DOMAINS` entry
  - ✅ SSR (`window === undefined`) → no throw, no calls
  - ✅ `ensureHttps` converts `http://` to `https://`
  - ✅ `DASHBOARD_DOMAINS` all use `https://`
  - ✅ `Icons` enum values correct
- ✅ `bun run type-check` passes
- ✅ `bun test` passes

---

## Feature 8: React App Bridge Hooks

> Dependency: Feature 7 · Peer dep: `react >= 18`

- ⬜ `src/react/use-primary-cta.ts`
- ⬜ `src/react/use-secondary-cta.ts`
- ⬜ `src/react/use-actions-menu.ts`
- ⬜ `src/react/index.ts` — barrel export with `"use client"` directive
- ⬜ TypeScript compile-time check that hooks accept correct types
- ⬜ `bun run type-check` passes

---

## Feature 9: Build Configuration & Export Map

> Dependency: All features complete

- ⬜ `package.json` export map with all 4 entry points
- ⬜ `"sideEffects": false` in `package.json`
- ⬜ `bun run build` produces clean `dist/` output
- ⬜ All 4 entry point imports resolve correctly

---

## Feature 10: JSDoc

> Dependency: All features complete

- ⬜ `createClient()` + all `ClientOptions` fields
- ⬜ All error classes
- ⬜ `parseToken()`, `ensureIsClient()`, `ensureIsInternalUser()`
- ⬜ `paginate()`
- ⬜ `sendToParent()` + all React hooks
- ⬜ All Zod schemas
