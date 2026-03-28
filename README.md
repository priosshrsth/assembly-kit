# assembly-kit

TypeScript SDK for the [Assembly](https://assembly.ac) platform. ESM-only, targets Node.js 18+, Node.js 24+, and Bun.

## Installation

```bash
pnpm add @anitshrsth/assembly-kit
# or
bun add @anitshrsth/assembly-kit
# or
npm install @anitshrsth/assembly-kit
```

## Usage

### Client

Create an SDK client with `createAssemblyKit()`. At least one of `token` or `workspaceId` must be provided:

```typescript
import { createAssemblyKit } from "@anitshrsth/assembly-kit";

// With token (e.g. marketplace apps, portal users)
const kit = createAssemblyKit({
  apiKey: "your-api-key",
  token: encryptedToken,
});

// With workspaceId only (server-to-server, local dev)
const kit = createAssemblyKit({
  apiKey: "your-api-key",
  workspaceId: "ws-123",
});

// Access resources via namespaces
const workspace = await kit.workspace.retrieve();
const companies = await kit.companies.list();
const task = await kit.tasks.create({ title: "Follow up", ... });
```

When only `workspaceId` is provided (no token), the SDK automatically sets `ASSEMBLY_ENV=local` at runtime and builds the compound key as `workspaceId/apiKey`.

#### Multiple workspaces

Each `createAssemblyKit()` call returns a fully independent client. To work with multiple workspaces or API keys, create one instance per credential set.

**React Server Components (recommended):** Use React's `cache()` to deduplicate instances per request. This is the idiomatic approach for Next.js App Router:

```typescript
// lib/assembly.ts
import { cache } from "react";
import { createAssemblyKit } from "@anitshrsth/assembly-kit";

export const getAssemblyKit = cache((apiKey: string, workspaceId: string) =>
  createAssemblyKit({ apiKey, workspaceId }),
);

// In any Server Component or server action:
const kitA = getAssemblyKit("api-key-a", "ws-workspace-a");
const kitB = getAssemblyKit("api-key-b", "ws-workspace-b");

// Same args within the same request → same instance (deduplicated by React)
const same = getAssemblyKit("api-key-a", "ws-workspace-a"); // === kitA
```

**Plain Node.js / Bun:** Manage your own singleton map:

```typescript
import { createAssemblyKit } from "@anitshrsth/assembly-kit";
import type { AssemblyKit } from "@anitshrsth/assembly-kit";

const clients = new Map<string, AssemblyKit>();

function getKit(apiKey: string, workspaceId: string): AssemblyKit {
  const existing = clients.get(workspaceId);
  if (existing) return existing;

  const kit = createAssemblyKit({ apiKey, workspaceId });
  clients.set(workspaceId, kit);
  return kit;
}

const kitA = getKit("api-key-a", "ws-workspace-a");
const kitB = getKit("api-key-b", "ws-workspace-b");
```

#### Options

| Option              | Type                  | Default   | Description                                                               |
| ------------------- | --------------------- | --------- | ------------------------------------------------------------------------- |
| `apiKey`            | `string`              | —         | Required. Your Assembly API key.                                          |
| `token`             | `string`              | —         | Encrypted token from Assembly. Required if `workspaceId` is not provided. |
| `workspaceId`       | `string`              | —         | Explicit workspace ID. Required if `token` is not provided.               |
| `retry`             | `RetryOptions\|false` | see below | Retry config, or `false` to disable retry entirely.                       |
| `validateResponses` | `boolean`             | `true`    | When true, all responses are validated through Zod schemas.               |

**Default retry options:**

| Option       | Default |
| ------------ | ------- |
| `retries`    | `3`     |
| `minTimeout` | `1000`  |
| `maxTimeout` | `5000`  |
| `factor`     | `2`     |

#### Token properties

When a token is provided, the decrypted payload is available directly on the instance:

```typescript
const kit = createAssemblyKit({ apiKey, token });

kit.token; // AssemblyToken | undefined — the decrypted token instance
kit.payload; // TokenPayload | undefined — the decrypted token payload

// Assert token type — throws AssemblyNoTokenError or AssemblyUnauthorizedError
const clientPayload = kit.ensureIsClient(); // ClientTokenPayload
const internalPayload = kit.ensureIsInternalUser(); // InternalUserTokenPayload
```

#### Disabling response validation

```typescript
const kit = createAssemblyKit({
  apiKey: "your-api-key",
  token: encryptedToken,
  validateResponses: false, // skip Zod parsing for performance
});
```

#### Disabling retry

```typescript
const kit = createAssemblyKit({
  apiKey: "your-api-key",
  token: encryptedToken,
  retry: false,
});
```

#### Resource namespaces

| Namespace               | Methods                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `workspace`             | `retrieve()`                                                            |
| `clients`               | `list()`, `retrieve()`, `create()`, `update()`, `delete()`, `listAll()` |
| `companies`             | `list()`, `retrieve()`, `create()`, `update()`, `delete()`, `listAll()` |
| `internalUsers`         | `list()`, `retrieve()`, `listAll()`                                     |
| `customFields`          | `list()`                                                                |
| `customFieldOptions`    | `list()`                                                                |
| `notes`                 | `list()`, `retrieve()`, `create()`, `update()`, `delete()`, `listAll()` |
| `messageChannels`       | `list()`, `retrieve()`, `create()`, `listAll()`                         |
| `messages`              | `list()`, `send()`, `listAll()`                                         |
| `products`              | `list()`, `retrieve()`, `listAll()`                                     |
| `prices`                | `list()`, `retrieve()`, `listAll()`                                     |
| `invoiceTemplates`      | `list()`, `listAll()`                                                   |
| `invoices`              | `list()`, `retrieve()`, `create()`, `listAll()`                         |
| `subscriptionTemplates` | `list()`, `listAll()`                                                   |
| `subscriptions`         | `list()`, `retrieve()`, `create()`, `cancel()`, `listAll()`             |
| `payments`              | `list()`, `listAll()`                                                   |
| `fileChannels`          | `list()`, `retrieve()`, `create()`, `listAll()`                         |
| `files`                 | `list()`, `retrieve()`, `create()`, `delete()`, `listAll()`             |
| `contractTemplates`     | `list()`, `retrieve()`, `listAll()`                                     |
| `contracts`             | `list()`, `retrieve()`, `send()`                                        |
| `forms`                 | `list()`, `retrieve()`, `listAll()`                                     |
| `formResponses`         | `list()`, `create()`                                                    |
| `tasks`                 | `list()`, `retrieve()`, `create()`, `update()`, `delete()`, `listAll()` |
| `taskTemplates`         | `list()`, `retrieve()`, `listAll()`                                     |
| `notifications`         | `list()`, `create()`, `delete()`, `markRead()`, `markUnread()`          |
| `events`                | `list()`, `retrieve()`, `create()`, `listAll()`                         |
| `appConnections`        | `list()`, `create()`                                                    |
| `appInstalls`           | `list()`, `retrieve()`                                                  |

### Pagination

Every resource that supports listing also exposes `listAll()`, which collects all pages into a single array by following `nextToken` cursors automatically:

```typescript
import { AssemblyKit } from "@anitshrsth/assembly-kit";

const kit = createAssemblyKit({ apiKey, token });

// Returns Promise<Company[]> — all pages collected
const allCompanies = await kit.companies.listAll();

// Filter arguments are passed through on every page
const allTasks = await kit.tasks.listAll({ status: "open" });
```

For manual pagination, use `list()` directly and handle `nextToken` yourself:

```typescript
const page1 = await kit.companies.list({ limit: 100 });
if (page1.nextToken) {
  const page2 = await kit.companies.list({ limit: 100, nextToken: page1.nextToken });
}
```

### Error classes

All errors extend the base `AssemblyError` class, which carries a `statusCode` and optional `details` payload. Import from the package root or from `@anitshrsth/assembly-kit/errors`:

```typescript
import {
  AssemblyError,
  AssemblyMissingApiKeyError,
  AssemblyNoTokenError,
  AssemblyInvalidTokenError,
  AssemblyUnauthorizedError,
  AssemblyForbiddenError,
  AssemblyNotFoundError,
  AssemblyValidationError,
  AssemblyRateLimitError,
  AssemblyServerError,
  AssemblyConnectionError,
  AssemblyResponseParseError,
} from "@anitshrsth/assembly-kit";
```

#### Catching errors

```typescript
import {
  AssemblyRateLimitError,
  AssemblyUnauthorizedError,
  AssemblyError,
} from "@anitshrsth/assembly-kit";

try {
  await kit.companies.retrieve(id);
} catch (err) {
  if (err instanceof AssemblyRateLimitError) {
    console.log("Retry after:", err.retryAfter); // seconds, if provided
  } else if (err instanceof AssemblyUnauthorizedError) {
    console.log("Check your API key");
  } else if (err instanceof AssemblyError) {
    console.log(err.message, err.statusCode, err.details);
  }
}
```

#### Error hierarchy

| Class                        | Status | Thrown when                                             |
| ---------------------------- | ------ | ------------------------------------------------------- |
| `AssemblyError`              | —      | Base class for all errors                               |
| `AssemblyMissingApiKeyError` | 400    | API key is absent or empty                              |
| `AssemblyNoTokenError`       | 400    | Token required but not provided                         |
| `AssemblyInvalidTokenError`  | 401    | Token could not be decrypted or validated               |
| `AssemblyUnauthorizedError`  | 401    | API key rejected, or token fails identity assertion     |
| `AssemblyForbiddenError`     | 403    | API key lacks required permission                       |
| `AssemblyNotFoundError`      | 404    | Requested resource does not exist                       |
| `AssemblyValidationError`    | 422    | Request payload rejected by API                         |
| `AssemblyRateLimitError`     | 429    | Rate limit exceeded (`.retryAfter?: number`)            |
| `AssemblyServerError`        | 500    | Unexpected error on Assembly servers                    |
| `AssemblyResponseParseError` | 500    | API response failed Zod schema validation (`.zodError`) |
| `AssemblyConnectionError`    | 503    | Network error reaching the API                          |

### Schemas

All Zod schemas are available from `@anitshrsth/assembly-kit/schemas` (also re-exported from the package root). Each resource has a base schema, a response schema (for paginated API responses), and optionally a request schema for create/update payloads.

```typescript
import {
  ClientSchema,
  CompanySchema,
  TaskSchema,
  TaskStatusSchema,
  WorkspaceSchema,
  InternalUserSchema,
  InvoiceSchema,
  CustomFieldSchema,
  TokenPayloadSchema,
  HexColorSchema,
} from "@anitshrsth/assembly-kit/schemas";

// TypeScript types inferred from schemas
import type {
  Client,
  Company,
  Task,
  TaskStatus,
  Workspace,
  InternalUser,
} from "@anitshrsth/assembly-kit/schemas";
```

#### Response schemas

```typescript
import {
  ClientsResponseSchema,
  CompaniesResponseSchema,
  TasksResponseSchema,
} from "@anitshrsth/assembly-kit/schemas";

import type {
  ClientsResponse,
  CompaniesResponse,
  TasksResponse,
} from "@anitshrsth/assembly-kit/schemas";
```

#### Request schemas

```typescript
import {
  ClientCreateRequestSchema,
  ClientUpdateRequestSchema,
  CompanyCreateRequestSchema,
  TaskCreateRequestSchema,
} from "@anitshrsth/assembly-kit/schemas";

import type { ClientCreateRequest, ClientUpdateRequest } from "@anitshrsth/assembly-kit/schemas";
```

#### Validating data

```typescript
import { ClientSchema } from "@anitshrsth/assembly-kit/schemas";

const result = ClientSchema.safeParse(unknownData);

if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error);
}
```

### Token Utilities

Decrypt, validate, and inspect encrypted Assembly tokens using the `AssemblyToken` class. These utilities are standalone — they are also used internally by `AssemblyKit` when a token is provided.

Import from either the package root or from `@anitshrsth/assembly-kit/token`:

```typescript
import { AssemblyToken, createToken } from "@anitshrsth/assembly-kit";
// or
import { AssemblyToken, createToken } from "@anitshrsth/assembly-kit/token";
```

#### `AssemblyToken`

Decrypts and validates a token using your API key. The constructor exposes the payload along with convenience getters and guard methods:

```typescript
import { AssemblyToken } from "@anitshrsth/assembly-kit";

const token = new AssemblyToken({ token: encryptedTokenHex, apiKey });

// Convenience getters
token.workspaceId; // string — always present
token.clientId; // string | undefined — present for client (portal) users
token.companyId; // string | undefined — present for client users
token.internalUserId; // string | undefined — present for internal (team member) users
token.tokenId; // string | undefined — present in some marketplace tokens
token.baseUrl; // string | undefined — overrides the API base URL if set

// Identity checks
token.isClientUser; // true if clientId + companyId are present
token.isInternalUser; // true if internalUserId is present

// Throwing guards — return narrowed payload type or throw AssemblyUnauthorizedError
const clientPayload = token.ensureIsClient(); // ClientTokenPayload
const internalPayload = token.ensureIsInternalUser(); // InternalUserTokenPayload

// Build the compound API key for the X-API-Key header
const key = token.buildCompoundKey({ apiKey });
// With tokenId:    "workspaceId/apiKey/tokenId"
// Without tokenId: "workspaceId/apiKey"
```

Throws `AssemblyNoTokenError` if the token is missing, or `AssemblyInvalidTokenError` if decryption or validation fails.

For request-scoped usage, use `AssemblyToken.new()` — it returns the existing instance for the current async context if the token matches:

```typescript
const token = AssemblyToken.new({ token: encryptedTokenHex, apiKey });
```

#### `createToken`

Encrypt a `TokenPayload` into a hex-encoded token string (the inverse of `new AssemblyToken()`):

```typescript
import { createToken } from "@anitshrsth/assembly-kit";

const encrypted = createToken({
  payload: {
    workspaceId: "ws-123",
    clientId: "cl-456",
    companyId: "co-789",
  },
  apiKey,
});
// encrypted is a hex-encoded AES-128-CBC encrypted string
```

The payload is validated against `TokenPayloadSchema` before encryption. Throws `AssemblyInvalidTokenError` if validation fails. Each call produces a different ciphertext (random IV).

### Logger

A request-scoped Pino logger is available from `@anitshrsth/assembly-kit/logger`. Requires `pino` and `pino-pretty` as peer dependencies.

```typescript
import { createLogger, logger } from "@anitshrsth/assembly-kit/logger";

// Request-scoped: returns the same instance within the same async context
const log = createLogger({ level: "debug" });
log.info("hello");
log.warn("careful");

// Or use the default module-level logger
import { logger } from "@anitshrsth/assembly-kit/logger";
logger.info("starting up");
```

The logger uses `pino-pretty` in non-production environments and plain JSON in production (`NODE_ENV=production`). The default log level respects the `LOG_LEVEL` environment variable.

### App Bridge (React Hooks)

React hooks that register UI elements in the Assembly dashboard header from an embedded iframe app. Handles setup, cleanup, and `beforeunload` automatically.

Requires `react >= 18` and `@assembly-js/app-bridge` as peer dependencies:

```bash
pnpm add react @assembly-js/app-bridge
```

Import from `@anitshrsth/assembly-kit/bridge-ui`:

#### `usePrimaryCta`

Registers a primary CTA button in the dashboard header:

```tsx
import { usePrimaryCta } from "@anitshrsth/assembly-kit/bridge-ui";
import type { CtaConfig } from "@assembly-js/app-bridge";

function MyApp() {
  usePrimaryCta({
    label: "Create Invoice",
    onClick: () => {
      console.log("Primary CTA clicked");
    },
  });

  return <div>My App</div>;
}
```

#### `useSecondaryCta`

Registers a secondary CTA button. Same API as `usePrimaryCta`:

```tsx
import { useSecondaryCta } from "@anitshrsth/assembly-kit/bridge-ui";

function MyApp() {
  useSecondaryCta({
    label: "Export",
    onClick: () => {
      console.log("Secondary CTA clicked");
    },
  });

  return <div>My App</div>;
}
```

#### `useActionsMenu`

Registers a dropdown actions menu in the dashboard header:

```tsx
import { useActionsMenu } from "@anitshrsth/assembly-kit/bridge-ui";
import type { ActionMenuItem } from "@assembly-js/app-bridge";

function MyApp() {
  useActionsMenu([
    { label: "Archive", onClick: () => archive() },
    { label: "Delete", onClick: () => remove() },
  ]);

  return <div>My App</div>;
}
```

#### Visibility toggle

All hooks accept an optional second argument to control visibility. When `false`, the slot is cleared. Defaults to `true`:

```tsx
usePrimaryCta({ label: "Save", onClick: () => save() }, false);
useActionsMenu([{ label: "Archive", onClick: () => archive() }], hasItems);
```

## Entry Points

| Import path                          | Exports                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `@anitshrsth/assembly-kit`           | `createAssemblyKit`, `AssemblyKit`, all errors, all schemas, `AssemblyToken`, `createToken` |
| `@anitshrsth/assembly-kit/client`    | `createAssemblyKit`, `AssemblyKit`, `AssemblyKitOptions`, `RetryOptions`                    |
| `@anitshrsth/assembly-kit/errors`    | All error classes                                                                           |
| `@anitshrsth/assembly-kit/schemas`   | All Zod schemas and inferred types (no client dependency)                                   |
| `@anitshrsth/assembly-kit/token`     | `AssemblyToken`, `createToken`, `ClientTokenPayload`, `InternalUserTokenPayload`            |
| `@anitshrsth/assembly-kit/logger`    | `createLogger`, `logger`                                                                    |
| `@anitshrsth/assembly-kit/bridge-ui` | `usePrimaryCta`, `useSecondaryCta`, `useActionsMenu`                                        |

## Development

```bash
pnpm run build    # build to dist/
pnpm run dev      # build in watch mode
pnpm test         # run tests
pnpm run check    # lint + format + type check
pnpm run release  # bump version, commit, push, tag
```

## License

MIT
