# assembly-kit

TypeScript SDK for the Assembly platform. ESM-only, Node.js 18+ and Bun.

## Quick Start

```ts
import { createAssemblyKit, KitMode } from "@anitshrsth/assembly-kit";

// Local mode (default) — only apiKey required
const kit = createAssemblyKit({ apiKey: "your-key" });

// Local mode with workspaceId — compound key: workspaceId/apiKey
const kit = createAssemblyKit({ apiKey: "your-key", workspaceId: "ws-123" });

// Local mode with token — token parsed, compound key from token payload
const kit = createAssemblyKit({ apiKey: "your-key", token: encryptedToken });

// Marketplace mode — either token or workspaceId required
const kit = createAssemblyKit({
  apiKey: "your-key",
  token: encryptedToken,
  kitMode: KitMode.Marketplace,
});
```

- `kitMode: "local"` (default) → only `apiKey` required. `workspaceId` and `token` are optional.
- `kitMode: "marketplace"` → either `token` or `workspaceId` must be provided.

## createAssemblyKit(options)

| Option              | Type                      | Default                    | Description                                                |
| ------------------- | ------------------------- | -------------------------- | ---------------------------------------------------------- |
| `apiKey`            | `string`                  | —                          | Required. Assembly API key.                                |
| `token`             | `string`                  | —                          | Encrypted token. Takes precedence over `workspaceId`.      |
| `workspaceId`       | `string`                  | —                          | Workspace ID. Required when `token` is not provided.       |
| `kitMode`           | `KitMode`                 | `"local"`                  | `"local"` or `"marketplace"`. See Quick Start above.       |
| `validateResponses` | `boolean`                 | `true`                     | Validate all API responses through Zod schemas.            |
| `baseUrl`           | `string`                  | `https://api.assembly.com` | Base URL for all API requests.                             |
| `retryCount`        | `number`                  | `2`                        | Number of retry attempts for retryable errors.             |
| `requestsPerSecond` | `number`                  | `20`                       | Maximum requests per second (sliding-window rate limiter). |
| `fetch`             | `typeof globalThis.fetch` | —                          | Injectable fetch function for testing.                     |

## Resource Namespaces

Access API resources via `kit.<namespace>.<method>()`:

| Namespace               | Methods                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `workspace`             | `retrieve()`                                                       |
| `clients`               | `list()` `retrieve()` `create()` `delete()` `listAll()`            |
| `companies`             | `list()` `retrieve()` `create()` `update()` `delete()` `listAll()` |
| `internalUsers`         | `list()` `retrieve()` `listAll()`                                  |
| `notes`                 | `list()` `retrieve()` `create()` `update()` `delete()` `listAll()` |
| `tasks`                 | `list()` `retrieve()` `create()` `update()` `delete()` `listAll()` |
| `taskTemplates`         | `list()` `retrieve()` `listAll()`                                  |
| `invoices`              | `list()` `retrieve()` `create()` `listAll()`                       |
| `invoiceTemplates`      | `list()` `listAll()`                                               |
| `subscriptions`         | `list()` `retrieve()` `create()` `cancel()` `listAll()`            |
| `subscriptionTemplates` | `list()` `listAll()`                                               |
| `payments`              | `list()` `listAll()`                                               |
| `products`              | `list()` `retrieve()` `listAll()`                                  |
| `prices`                | `list()` `retrieve()` `listAll()`                                  |
| `contracts`             | `retrieve()` `send()`                                              |
| `contractTemplates`     | `list()` `retrieve()`                                              |
| `forms`                 | `list()` `retrieve()` `listAll()`                                  |
| `formResponses`         | `list()` `create()`                                                |
| `files`                 | `list()` `retrieve()` `delete()` `listAll()`                       |
| `fileChannels`          | `list()` `retrieve()` `create()` `listAll()`                       |
| `messageChannels`       | `list()` `retrieve()` `create()` `listAll()`                       |
| `messages`              | `list()` `send()` `listAll()`                                      |
| `events`                | `list()` `retrieve()` `create()` `listAll()`                       |
| `notifications`         | `list()` `create()` `delete()` `markRead()` `markUnread()`         |
| `customFields`          | `list()`                                                           |
| `customFieldOptions`    | `list()`                                                           |
| `appConnections`        | `list()` `create()`                                                |
| `appInstalls`           | `list()` `retrieve()`                                              |

## Pagination

`listAll()` auto-paginates and returns `Promise<T[]>`. For manual pagination use `list()` and handle `nextToken`:

```ts
const allCompanies = await kit.companies.listAll();
const page = await kit.companies.list({ limit: 100 });
if (page.nextToken) {
  const next = await kit.companies.list({ limit: 100, nextToken: page.nextToken });
}
```

## Token Utilities

Standalone token decryption (not required for normal SDK usage):

```ts
import { AssemblyToken, createToken } from "@anitshrsth/assembly-kit";

const token = new AssemblyToken({ token: encryptedHex, apiKey });
token.workspaceId; // string
token.clientId; // string | undefined
token.companyId; // string | undefined
token.internalUserId; // string | undefined
token.isClientUser; // boolean
token.isInternalUser; // boolean

const client = token.ensureIsClient(); // ClientTokenPayload (throws if not client)
const internal = token.ensureIsInternalUser(); // InternalUserTokenPayload (throws if not internal)

// Encrypt a payload into a token
const encrypted = createToken({
  payload: { workspaceId: "ws-123", clientId: "cl-1", companyId: "co-1" },
  apiKey,
});
```

## Error Handling

All errors extend `AssemblyError`. Import from `@anitshrsth/assembly-kit`:

```ts
import {
  AssemblyError, // base class (statusCode, details)
  AssemblyNoTokenError, // 400 — token required but missing
  AssemblyInvalidTokenError, // 401 — token decryption/validation failed
  AssemblyUnauthorizedError, // 401 — API key rejected or identity assertion failed
  AssemblyForbiddenError, // 403 — insufficient permissions
  AssemblyNotFoundError, // 404 — resource not found
  AssemblyValidationError, // 422 — request payload rejected
  AssemblyRateLimitError, // 429 — rate limited (.retryAfter?: number)
  AssemblyServerError, // 500 — server error
  AssemblyResponseParseError, // 500 — Zod validation failed (.zodError)
  AssemblyConnectionError, // 503 — network error
} from "@anitshrsth/assembly-kit";

try {
  await kit.companies.retrieve(id);
} catch (err) {
  if (err instanceof AssemblyRateLimitError) {
    // err.retryAfter — seconds until retry
  } else if (err instanceof AssemblyError) {
    // err.message, err.statusCode, err.details
  }
}
```

## Schemas

Zod 4 schemas and inferred types for all resources:

```ts
import { ClientSchema, CompanySchema, TaskSchema } from "@anitshrsth/assembly-kit/schemas";
import type { Client, Company, Task } from "@anitshrsth/assembly-kit/schemas";

// Response schemas (paginated)
import { ClientsResponseSchema } from "@anitshrsth/assembly-kit/schemas";

// Request schemas
import { ClientCreateRequestSchema } from "@anitshrsth/assembly-kit/schemas";
```

## Multi-Workspace (React Server Components)

Use React `cache()` to deduplicate per request:

```ts
import { cache } from "react";
import { createAssemblyKit } from "@anitshrsth/assembly-kit";

export const getAssemblyKit = cache((apiKey: string, workspaceId: string) =>
  createAssemblyKit({ apiKey, workspaceId }),
);
```

## Entry Points

| Import path                          | Key exports                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `@anitshrsth/assembly-kit`           | `createAssemblyKit`, `AssemblyKit`, errors, schemas, token utils                                          |
| `@anitshrsth/assembly-kit/schemas`   | All Zod schemas and inferred types                                                                        |
| `@anitshrsth/assembly-kit/client`    | `createAssemblyKit`, `AssemblyKit`, `AssemblyKitOptions`                                                  |
| `@anitshrsth/assembly-kit/errors`    | All error classes                                                                                         |
| `@anitshrsth/assembly-kit/token`     | `AssemblyToken`, `createToken`                                                                            |
| `@anitshrsth/assembly-kit/logger`    | `createLogger`, `logger` (requires pino peer dep)                                                         |
| `@anitshrsth/assembly-kit/bridge-ui` | `usePrimaryCta`, `useSecondaryCta`, `useActionsMenu` (requires react + @assembly-js/app-bridge peer deps) |
