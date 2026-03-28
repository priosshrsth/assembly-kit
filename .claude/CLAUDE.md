# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** The root `CLAUDE.md` is a **consumer-facing** file that ships with the npm package.
> It is read by AI assistants in projects that depend on `@anitshrsth/assembly-kit`.
> This file (`.claude/CLAUDE.md`) is the **contributor-facing** file for repo development.

## Commands

```bash
pnpm run build         # Build all entry points to dist/ via vp pack
pnpm run dev           # Build in watch mode
pnpm test              # Run tests via vp test
pnpm run check         # Lint + format + type check via vp check
pnpm run release       # Bump version, commit, push, tag via bumpp
```

Pre-commit hook runs `vp check --fix` on staged files.

After any significant code change, always run `vp check --fix` to ensure lint, formatting, and type checking pass before committing.

## Documentation Rules

After any significant code change, update the following:

1. **`docs/progress.md`** — mark completed features, update status
2. **`README.md`** — keep usage examples and API docs current
3. **`CLAUDE.md` (root)** — update the consumer-facing SDK reference when public API surface changes (new resources, changed options, new entry points, new error classes)
4. **Feature-specific docs** — if README.md grows too large, create docs under `docs/` (e.g. `docs/app-bridge.md`) and link from the main README

Always keep docs in sync with the code. Do not defer documentation to a later step.

## Architecture

`assembly-kit` is a TypeScript-first SDK for the Assembly platform. It is an **ESM-only single package** with 6 entry points, targeting Node.js 18+, Node.js 24+, and Bun.

### Entry Points

| Export                         | Purpose                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `assembly-kit`                 | `createAssemblyKit()`, error classes, token utilities, `paginate()`                    |
| `assembly-kit/schemas`         | All Zod schemas and inferred types (no client dependency)                              |
| `assembly-kit/app-bridge`      | Framework-agnostic `sendToParent()` postMessage utilities                              |
| `assembly-kit/bridge-ui`       | React hooks wrapping app-bridge (`usePrimaryCta`, `useSecondaryCta`, `useActionsMenu`) |
| `assembly-kit/assembly-client` | `createAssemblyClient()` — retry wrapper around `@assembly-js/node-sdk`                |
| `assembly-kit/react`           | React Server Component cached singletons (`getAssemblyKit`, `getAssemblyToken`, etc.)  |

### Source Layer Dependency Order

```
src/errors/            ← base AssemblyError class + all subclasses
src/schemas/shared/    ← shared cross-module schemas: hex-color, membership-type, token
src/token/             ← optional standalone utilities: parseToken(), createToken(), guards, crypto (NOT used by createAssemblyKit)
src/transport/         ← ky HTTP client + p-throttle rate limiter + error mapper
src/pagination/        ← paginate() AsyncIterable cursor helper
src/modules/           ← 27 co-located modules, each with schema.ts + resource.ts + index.ts
src/assembly-kit/      ← createAssemblyKit() factory + AssemblyKitClient class (workspaceId is required, token is opaque)
src/assembly-client/   ← createAssemblyClient() wrapper around @assembly-js/node-sdk
src/react/             ← React `cache` wrappers for token, assembly-kit, assembly-client
src/app-bridge/        ← parallel track, no dependency on layers above
src/bridge-ui/         ← depends on app-bridge only
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

**No module-level singletons.** Every `createAssemblyKit()` creates a fresh transport and rate limiter. This is critical for serverless safety (Vercel, Cloudflare Workers).

**`workspaceId` is required.** Every `createAssemblyKit()` call requires an explicit `workspaceId` parameter. The compound key is always `${workspaceId}/${apiKey}` (or `${workspaceId}/${apiKey}/${tokenId}`). Raw apiKey alone is never sent.

**Token is opaque.** The SDK does **not** decrypt or parse the token. It is received as-is (required for marketplace apps, optional otherwise). Token decryption utilities (`parseToken`, `createToken`) are available as optional standalone exports for apps that need to inspect token contents.

**Token decryption utilities** (standalone, not used by `createAssemblyKit`):

1. HMAC-SHA256(apiKey).hex.slice(0,32) → 128-bit key
2. AES-128-CBC decrypt: first 16 bytes of hex blob = IV, rest = ciphertext
3. Dual strategy: native autoPadding first, manual PKCS7 fallback for Node 24 (OpenSSL 3.4/3.5)
4. JSON.parse → validate with `TokenPayloadSchema` (unknown fields silently dropped)

Always import crypto as `import { ... } from 'node:crypto'` (explicit `node:` prefix for Bun + Node compat).

**`isMarketplaceApp` flag:** When `true`, a token is required at `createAssemblyKit()` construction time. When `false`, token is optional but endpoints requiring user context throw `AssemblyNoTokenError` at call time.

**`validateResponses` flag:** When `true` (default), all API responses are parsed through Zod schemas. Failed parses throw `AssemblyResponseParseError` (which carries the `ZodError`). Set to `false` to skip parsing for performance or trusted environments.

### Testing

- `bun test` — zero real HTTP calls. The transport accepts an injectable `fetch` function; tests pass mock fetch implementations.
- Token tests use pre-generated fixtures in `tests/fixtures/tokens.ts` — real encrypted tokens produced from the known test API key, covering client user, internal user, tokenId, baseUrl, and block-aligned payloads (the Node 24 PKCS7 edge case).

### Planning Docs

Full feature specs and implementation sequencing are in `docs/planning/`:

- `prd.md` — requirements for all features including error hierarchy, token payload shape, resource methods, app-bridge payload types
- `implementation-plan.md` — step-by-step implementation guide with concrete code patterns per feature
- `node-sdk-internals.md` — verified token decryption algorithm internals
