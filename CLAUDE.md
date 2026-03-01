# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run build          # Build all entry points to dist/ via bunup
bun run dev            # Build in watch mode
bun test               # Run tests
bun test --watch       # Run tests in watch mode
bun test path/to.test.ts  # Run a single test file
bun run type-check     # TypeScript type checking (no emit)
bun run lint           # oxlint
bun run format         # oxfmt
bun run check          # ultracite check (lint + format check)
bun run fix            # ultracite fix (auto-fix lint + format)
bun run release        # Bump version, commit, push, tag via bumpp
```

Pre-commit hook (lefthook) auto-runs `bun x ultracite fix` on staged files.

After any significant code change, always run `bun run lint` and `bun run fix` to ensure lint and formatting pass before committing.

## Architecture

`assembly-kit` is a TypeScript-first SDK for the Assembly platform. It is an **ESM-only single package** with 4 entry points, targeting Node.js 18+, Node.js 24+, and Bun.

### Entry Points

| Export                    | Purpose                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `assembly-kit`            | `createClient()`, error classes, token utilities, `paginate()`                         |
| `assembly-kit/schemas`    | All Zod schemas and inferred types (no client dependency)                              |
| `assembly-kit/app-bridge` | Framework-agnostic `sendToParent()` postMessage utilities                              |
| `assembly-kit/react`      | React hooks wrapping app-bridge (`usePrimaryCta`, `useSecondaryCta`, `useActionsMenu`) |

### Source Layer Dependency Order

```
src/errors/          ← base AssemblyError class + createAssemblyError factory + all subclasses
src/schemas/         ← Zod schemas: base/ → responses/ → requests/
src/token/           ← parseToken(), ensureIsClient(), ensureIsInternalUser(), crypto primitives
src/transport/       ← ky HTTP client + p-throttle rate limiter + error mapper
src/pagination/      ← paginate() AsyncIterable cursor helper
src/client/          ← createClient() factory + AssemblyClient class
src/resources/       ← workspace, clients, companies, internalUsers, notifications, customFields, tasks, token
src/app-bridge/      ← parallel track, no dependency on layers above
src/react/           ← depends on app-bridge only
```

### Zod Version

This project uses **Zod 4** (`^4.3.6`). Do not use Zod 3 APIs.

| Zod 3 (forbidden)      | Zod 4 (correct)          |
| ---------------------- | ------------------------ |
| `error.format()`       | `z.prettifyError(error)` |
| `error.flatten()`      | `z.treeifyError(error)`  |
| `import from "zod/v3"` | `import from "zod"`      |

Always import from `"zod"` directly. `ZodError` can be imported as a type: `import type { ZodError } from "zod"`. Use `z.infer<typeof Schema>` for type inference.

### TypeScript Requirements

**`isolatedDeclarations` is enabled** in `tsconfig.json`. This means every exported binding must have an explicit type annotation — the compiler cannot infer types across module boundaries.

```ts
// ✗ Wrong — type must not be inferred
export const BASE_URL = "https://api.assembly.com";

// ✓ Correct — type explicitly declared
export const BASE_URL: string = "https://api.assembly.com";

// ✗ Wrong — return type must not be inferred
export function createFoo(x: string) {
  return { x };
}

// ✓ Correct — return type explicitly declared
export function createFoo(x: string): { x: string } {
  return { x };
}
```

This applies to every `export const`, `export function`, `export class`, and `export type` in the codebase.

### Key Technical Decisions

**HTTP:** `ky` (fetch-based, ESM). Auth header is `X-API-Key: <compoundKey>` — **not** `Authorization: Bearer`. Also send `X-Assembly-SDK-Version` on every request.

**Compound key format:**

- With `tokenId`: `${workspaceId}/${apiKey}/${tokenId}`
- Without `tokenId`: `${workspaceId}/${apiKey}`

**Rate limiting:** `p-throttle` (sliding window, 20 req/s default). Applied in ky's `beforeRequest` hook. No `bottleneck` — avoids fixed `minTime` penalty at low request rates.

**No module-level singletons.** Every `createClient()` creates a fresh transport, rate limiter, and parsed token. This is critical for serverless safety (Vercel, Cloudflare Workers).

**Token decryption** is fully synchronous and local — no network call:

1. HMAC-SHA256(apiKey).hex.slice(0,32) → 128-bit key
2. AES-128-CBC decrypt: first 16 bytes of hex blob = IV, rest = ciphertext
3. `setAutoPadding(false)` + manual PKCS7 strip — required for Node 24 (OpenSSL 3.4/3.5) compatibility
4. JSON.parse → validate with `TokenPayloadSchema` using `.strip()` (unknown fields silently dropped)

Always import crypto as `import * as nodeCrypto from 'node:crypto'` (explicit `node:` prefix for Bun + Node compat).

**`isMarketplaceApp` flag:** When `true`, a token is required at `createClient()` construction time. When `false`, token is optional but endpoints requiring user context throw `AssemblyNoTokenError` at call time.

**`validateResponses` flag:** When `true` (default), all API responses are parsed through Zod schemas. Failed parses throw `AssemblyResponseParseError` (which carries the `ZodError`). Set to `false` to skip parsing for performance or trusted environments.

### Testing

- `bun test` — zero real HTTP calls. The transport accepts an injectable `fetch` function; tests pass mock fetch implementations.
- Token tests use pre-generated fixtures in `tests/fixtures/tokens.ts` — real encrypted tokens produced from the known test API key, covering client user, internal user, tokenId, baseUrl, and block-aligned payloads (the Node 24 PKCS7 edge case).

### Planning Docs

Full feature specs and implementation sequencing are in `docs/planning/`:

- `prd.md` — requirements for all features including error hierarchy, token payload shape, resource methods, app-bridge payload types
- `implementation-plan.md` — step-by-step implementation guide with concrete code patterns per feature
- `node-sdk-internals.md` — verified token decryption algorithm internals
