# assembly-kit — Implementation Progress

Tracks implementation status against the plan in `docs/planning/implementation-plan.md`.

Legend: ✅ done · 🚧 in progress · ⬜ not started

---

## Phase 0: Scaffold

- ✅ Repo & tooling bootstrap (bunup, tsconfig, lefthook, oxlint, ultracite)
- ✅ `src/index.ts` — exports all error classes
- ✅ `src` path alias (`@/*`) configured in tsconfig.json
- ✅ `bunup.config.ts` — 4 entry points (index, schemas, app-bridge, bridge-ui)
- ✅ Runtime deps: `zod` installed
- ✅ Runtime deps: `ky`, `p-throttle` (needed for Feature 4)
- ✅ Entry point stubs: `src/schemas/index.ts`, `src/app-bridge/index.ts`, `src/bridge-ui/index.ts`
- ✅ Test fixtures: `test/fixtures/tokens.ts` (encrypted token constants for token tests)

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

## Feature 3: Token Utilities ✅

> Dependencies: Feature 1, Feature 2

- ✅ `src/token/crypto.ts`
  - ✅ `deriveKey(apiKey)` — HMAC-SHA256 → hex → slice(0,32)
  - ✅ `decryptTokenString(apiKey, encryptedToken)` — AES-128-CBC, dual strategy (native → manual PKCS7 fallback)
  - ✅ `encryptTokenString(apiKey, plaintext)` — AES-128-CBC encryption with random IV
- ✅ `src/token/parse.ts`
  - ✅ `parseToken(token, apiKey): TokenPayload`
  - ✅ `createToken(payload, apiKey): string` — encrypt a payload into a token (inverse of parseToken)
  - ✅ `buildCompoundKey(apiKey, payload)` — compound key builder
- ✅ `src/token/guards.ts`
  - ✅ `ensureIsClient(payload)`
  - ✅ `ensureIsInternalUser(payload)`
  - ✅ `isClientToken(payload)` — type predicate
  - ✅ `isInternalUserToken(payload)` — type predicate
- ✅ `src/token/index.ts` — barrel export (public API only, crypto internals not exposed)
- ✅ `src/index.ts` re-exports all token utilities
- ✅ `test/fixtures/tokens.ts` — pre-generated encrypted token constants with encrypt helper
- ✅ `test/token.test.ts` (22 tests passing)
  - ✅ Null/empty/non-string token → `AssemblyNoTokenError`
  - ✅ Invalid hex → `AssemblyInvalidTokenError`
  - ✅ Wrong API key → `AssemblyInvalidTokenError`
  - ✅ Error cause chaining preserved
  - ✅ Valid client token → `TokenPayload` with `clientId` + `companyId`
  - ✅ Valid internal user token → `TokenPayload` with `internalUserId`
  - ✅ Token with `tokenId` → payload includes `tokenId`
  - ✅ Token with `baseUrl` → payload includes `baseUrl`
  - ✅ Block-aligned plaintext (Node 24 PKCS7 edge case) decrypts correctly
  - ✅ `buildCompoundKey` with/without `tokenId`
  - ✅ `isClientToken` / `isInternalUserToken` type predicates
  - ✅ `ensureIsClient` / `ensureIsInternalUser` guard functions
- ✅ `bun run type-check` passes
- ✅ `bun run lint` passes
- ✅ `bun run build` succeeds
- ✅ `bun test` passes (154 tests across 4 files)

---

## Feature 4: HTTP Transport Layer ✅

> Dependencies: Feature 1 · Install: `ky`, `p-throttle`

- ✅ `bun add ky p-throttle` (ky@1.14.3, p-throttle@8.1.0)
- ✅ `src/transport/rate-limiter.ts` — `createRateLimiter(requestsPerSecond)` with p-throttle acquireSlot pattern
- ✅ `src/transport/error-mapper.ts` — `mapHttpError(error)` → typed `AssemblyError`, `parseRetryAfter(header)`
- ✅ `src/transport/http.ts` — `createTransport(options)` with injectable `fetch`
  - ✅ `X-API-Key` header (not `Authorization: Bearer`)
  - ✅ `X-Assembly-SDK-Version` header
  - ✅ Retry on 429 / 5xx only, exponential backoff, respects `Retry-After` via ky's afterStatusCodes
  - ✅ Rate limiting via `p-throttle` in `beforeRequest` hook (fires on retries too)
  - ✅ Configurable `retryCount`, `retryMinTimeout`, `retryMaxTimeout`, `requestsPerSecond`
  - ✅ Strips leading `/` from paths (ky prefixUrl requirement)
- ✅ `src/transport/index.ts` — internal barrel (NOT exported from `src/index.ts`)
- ✅ `test/transport.test.ts` (39 tests, all via mock `fetch` — no real HTTP calls)
  - ✅ GET/POST/PATCH/DELETE 200 → resolves with parsed JSON
  - ✅ 400 → `AssemblyValidationError`, 401 → `AssemblyUnauthorizedError`
  - ✅ 403 → `AssemblyForbiddenError`, 404 → `AssemblyNotFoundError`
  - ✅ 422 → `AssemblyValidationError`
  - ✅ 429 + `Retry-After` → `AssemblyRateLimitError` with `retryAfter`
  - ✅ 429 without `Retry-After` → `AssemblyRateLimitError` with `undefined` retryAfter
  - ✅ 500/502/503 → `AssemblyServerError`
  - ✅ 429 once then 200 → successful retry
  - ✅ 503 once then 200 → successful retry
  - ✅ 503 exhausts retries → `AssemblyServerError`
  - ✅ retryCount: 0 → no retries
  - ✅ 21 concurrent calls with 20/s limit → all resolve
  - ✅ Rate limiter delays requests beyond the limit (timing verified)
  - ✅ `X-API-Key` header verified (not `Authorization`)
  - ✅ `X-Assembly-SDK-Version` header verified
  - ✅ `Content-Type: application/json` on mutations
  - ✅ Network failure → `AssemblyConnectionError` with cause
  - ✅ Response body preserved as `details` on errors
  - ✅ `parseRetryAfter` unit tests (9 tests: null, empty, integer, zero, decimal, negative, HTTP-date future/past, unparseable)
- ✅ `bun run type-check` passes
- ✅ `bun run lint` passes
- ✅ `bun test` passes (193 tests across 5 files)

> **Note:** Transport is internal only — consumed by the client factory (Feature 6), not exported from the main entry point. Error mapping uses try/catch around ky requests, converting `HTTPError` to typed `AssemblyError` subclasses and all other errors to `AssemblyConnectionError`. The `withErrorMapping` helper and `stripLeadingSlash` are module-level arrow functions.

---

## Feature 5: Pagination Helper ✅

> Dependency: Feature 4

- ✅ `src/pagination/paginate.ts` — `paginate<T>(fn, initialArgs?)` AsyncIterable generator
- ✅ `src/pagination/index.ts` — barrel re-export
- ✅ `src/index.ts` re-exports `paginate`, `ListArgs`, `PaginatedResponse`
- ✅ `test/pagination.test.ts` (5 tests passing)
  - ✅ Single page (no `nextToken`) → all items, stops
  - ✅ Multi-page → all items in order
  - ✅ Empty first page → yields nothing
  - ✅ `data: null` → yields nothing, no throw
  - ✅ Preserves `initialArgs` across pages
- ✅ `bun run type-check` passes
- ✅ `bun test` passes

---

## Feature 6: Client Factory & Resource Classes ✅

> Dependencies: Features 1–5

- ✅ `src/client/options.ts` — `ClientOptions` interface
- ✅ `src/client/parse-response.ts` — Zod validate-or-cast helper
- ✅ `src/client/require-token.ts` — token guard
- ✅ `src/client/build-search-params.ts` — generic search params builder
- ✅ `src/client/assembly-client.ts` — `AssemblyClient` class with 27 resource namespaces
- ✅ `src/client/create-client.ts` — `createClient()` factory
- ✅ `src/client/index.ts` — barrel export
- ✅ `src/version.ts` — SDK version constant
- ✅ `src/resources/workspace.ts` — `WorkspaceResource` (get)
- ✅ `src/resources/clients.ts` — `ClientsResource` (list, get, create, update, delete)
- ✅ `src/resources/companies.ts` — `CompaniesResource` (list, get, create, update, delete)
- ✅ `src/resources/internal-users.ts` — `InternalUsersResource` (list, get)
- ✅ `src/resources/notifications.ts` — `NotificationsResource` (list, create, delete, markRead, markUnread)
- ✅ `src/resources/custom-fields.ts` — `CustomFieldsResource` (list)
- ✅ `src/resources/custom-field-options.ts` — `CustomFieldOptionsResource` (list)
- ✅ `src/resources/notes.ts` — `NotesResource` (list, get, create, update, delete)
- ✅ `src/resources/message-channels.ts` — `MessageChannelsResource` (list, get, create)
- ✅ `src/resources/messages.ts` — `MessagesResource` (list, send)
- ✅ `src/resources/products.ts` — `ProductsResource` (list, get)
- ✅ `src/resources/prices.ts` — `PricesResource` (list, get)
- ✅ `src/resources/invoice-templates.ts` — `InvoiceTemplatesResource` (list)
- ✅ `src/resources/invoices.ts` — `InvoicesResource` (list, get, create)
- ✅ `src/resources/subscription-templates.ts` — `SubscriptionTemplatesResource` (list)
- ✅ `src/resources/subscriptions.ts` — `SubscriptionsResource` (list, get, create, cancel)
- ✅ `src/resources/payments.ts` — `PaymentsResource` (list)
- ✅ `src/resources/file-channels.ts` — `FileChannelsResource` (list, get, create)
- ✅ `src/resources/files.ts` — `FilesResource` (list, get, create, delete, updatePermissions)
- ✅ `src/resources/contract-templates.ts` — `ContractTemplatesResource` (list, get)
- ✅ `src/resources/contracts.ts` — `ContractsResource` (list, get, send)
- ✅ `src/resources/forms.ts` — `FormsResource` (list, get)
- ✅ `src/resources/form-responses.ts` — `FormResponsesResource` (list, request)
- ✅ `src/resources/tasks.ts` — `TasksResource` (list, get, create, update, delete)
- ✅ `src/resources/task-templates.ts` — `TaskTemplatesResource` (list, get)
- ✅ `src/resources/app-connections.ts` — `AppConnectionsResource` (list, create)
- ✅ `src/resources/app-installs.ts` — `AppInstallsResource` (list)
- ✅ `src/resources/index.ts` — barrel export (27 resources)
- ✅ `test/client.test.ts` (12 tests passing — all transport calls mocked)
  - ✅ Empty `workspaceId` → `AssemblyMissingApiKeyError`
  - ✅ Empty `apiKey` → `AssemblyMissingApiKeyError`
  - ✅ `isMarketplaceApp: true` without token → `AssemblyNoTokenError`
  - ✅ Marketplace mode with token → constructs OK
  - ✅ Non-marketplace without token → constructs OK
  - ✅ Two `createClient()` calls produce independent instances
  - ✅ `tokenId` in compound key → `X-API-Key` = `ws/key/tokenId`
  - ✅ No `tokenId` → `X-API-Key` = `ws/key`
  - ✅ `validateResponses: false` → raw data returned
  - ✅ `validateResponses: true` + bad shape → `AssemblyResponseParseError`
  - ✅ Validates by default
  - ✅ Exposes all resource namespaces
- ✅ `test/resources/` — 7 resource test files (29 tests passing)
  - ✅ `workspace.test.ts` (2 tests)
  - ✅ `clients.test.ts` (6 tests)
  - ✅ `companies.test.ts` (6 tests)
  - ✅ `internal-users.test.ts` (3 tests)
  - ✅ `notifications.test.ts` (4 tests)
  - ✅ `custom-fields.test.ts` (2 tests)
  - ✅ `tasks.test.ts` (6 tests)
- ✅ `bun run type-check` passes
- ✅ `bun run lint` passes
- ✅ `bun run build` succeeds
- ✅ `bun test` passes (245 tests across 14 files)

> **Note:** `ResourceContext` pattern used — all resources receive `{ transport, validateResponses }` via constructor. `buildSearchParams()` utility extracts defined values from optional args objects, keeping resource methods under the max-statements lint limit. Token is stored on the client but resource methods do not currently use `requireToken()` — this will be added when token-gated endpoints are identified.

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

- ✅ `src/bridge-ui/use-primary-cta.ts`
- ✅ `src/bridge-ui/use-secondary-cta.ts`
- ✅ `src/bridge-ui/use-actions-menu.ts`
- ✅ `src/bridge-ui/index.ts` — barrel export with `"use client"` directive
- ✅ TypeScript compile-time check that hooks accept correct types
- ✅ `bun run type-check` passes

---

## Feature 9: Build Configuration & Export Map

> Dependency: All features complete
> I think export map is already handled by bunup. So there;s nothing to do there probably.

- ⬜ `package.json` export map with all 4 entry points
- ⬜ `"sideEffects": false` in `package.json`
- ⬜ `bun run build` produces clean `dist/` output
- ⬜ All 4 entry point imports resolve correctly
- ⬜ We should ensure that npm package when published should not contain anything except tsconfig, package.jsona dn dist folder. Basically only things it need.

---

## Feature 10: JSDoc

> Dependency: All features complete

- ⬜ `createClient()` + all `ClientOptions` fields
- ⬜ All error classes
- ⬜ `parseToken()`, `ensureIsClient()`, `ensureIsInternalUser()`
- ⬜ `paginate()`
- ⬜ `sendToParent()` + all React hooks
- ⬜ All Zod schemas

---

## Feature 11: Legacy Client Wrapper ✅

> No dependency on core SDK layers. Peer dep: `@assembly-js/node-sdk >= 3.19.1`

- ✅ `src/legacy/error-filter.ts` — duck-typed `isRetryableError(error)` (429 + 5xx)
- ✅ `src/legacy/options.ts` — `RetryOptions`, `LegacyClientOptions`, `DEFAULT_RETRY`
- ✅ `src/legacy/wrap-sdk.ts` — Proxy-based wrapper, `LegacyAssemblyClient` mapped type
- ✅ `src/legacy/retry.ts` — `createRetryFn(opts)` using `p-retry`
- ✅ `src/legacy/create-legacy-client.ts` — `createLegacyClient(options)` factory
- ✅ `src/legacy/index.ts` — barrel export
- ✅ `package.json` — `assembly-kit/legacy` export, `p-retry` dep, `@assembly-js/node-sdk` optional peer dep
- ✅ `bunup.config.ts` — 9th entry point
- ✅ `test/legacy/error-filter.test.ts` (7 tests)
  - ✅ 429/500/503 → retryable
  - ✅ 401/404 → not retryable
  - ✅ Non-object / no status → not retryable
- ✅ `test/legacy/create-legacy-client.test.ts` (5 tests)
  - ✅ Constructs with apiKey only / apiKey + token
  - ✅ `retry: false` → unwrapped SDK methods
  - ✅ Retries on 429, succeeds on 2nd attempt
  - ✅ Does not retry on 401
- ✅ `bun run type-check` passes
- ✅ `bun run lint` passes
- ✅ `bun run build` succeeds (9 entry points)
- ✅ `bun test` passes (306 tests across 36 files)

---

## Module-Based Restructure ✅

Restructured from split `src/schemas/` + `src/resources/` into co-located `src/modules/<resource>/` directories. Renamed client classes to distinguish new SDK from legacy wrapper.

### Changes

- ✅ **Co-located modules** — each of 27 resources now lives in `src/modules/<name>/` with `schema.ts` (merged base + response + request), `resource.ts`, and `index.ts`
- ✅ **Shared schemas** — `HexColorSchema`, `MembershipTypeSchema`, `TokenPayloadSchema` moved to `src/schemas/shared/`
- ✅ **Client renamed** — `AssemblyClient` → `AssemblyKitClient`, `createClient()` → `createAssemblyKit()`
- ✅ **Legacy renamed** — `createLegacyClient()` → `createAssemblyClient()`, `LegacyAssemblyClient` → `AssemblyClient`
- ✅ **Entry points trimmed** — 4 entry points: `src/index.ts`, `src/app-bridge/index.ts`, `src/bridge-ui/index.ts`, `src/legacy/index.ts`
- ✅ **Schema sub-paths removed** — `assembly-kit/schemas`, `assembly-kit/schemas/base`, `assembly-kit/schemas/responses`, `assembly-kit/schemas/requests` no longer exported; all schemas available from `assembly-kit` directly
- ✅ **Tests moved** — `test/resources/` → `test/modules/`, updated imports
- ✅ **Old files deleted** — `src/schemas/base/`, `src/schemas/responses/`, `src/schemas/requests/`, `src/resources/`, old client/legacy files
- ✅ `bun run type-check` passes
- ✅ `bun run lint` passes (0 warnings, 0 errors)
- ✅ `bun run build` succeeds (4 entry points)
- ✅ `bun test` passes (306 tests across 36 files)
