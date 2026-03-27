# assembly-kit

TypeScript SDK for the [Assembly](https://assembly.ac) platform. ESM-only, targets Node.js 18+, Node.js 24+, and Bun.

## Installation

```bash
bun add @anitshrsth/assembly-kit
# or
npm install @anitshrsth/assembly-kit
```

## Usage

### Client

Create an SDK client with `createAssemblyKit()`. Each call produces an independent instance with its own HTTP transport and rate limiter (safe for serverless environments).

```typescript
import { createAssemblyKit } from "@anitshrsth/assembly-kit";

const client = createAssemblyKit({
  workspaceId: "ws-123",
  apiKey: "your-api-key",
});

// Access resources via namespaces
const workspace = await client.workspace.get();
const companies = await client.companies.list();
const task = await client.tasks.create({ title: "Follow up" });
```

#### Options

| Option              | Type      | Default                    | Description                                                                                                               |
| ------------------- | --------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `workspaceId`       | `string`  | —                          | Required. Used to build the compound API key.                                                                             |
| `apiKey`            | `string`  | —                          | Required. Your Assembly API key.                                                                                          |
| `token`             | `string`  | —                          | Encrypted token from Assembly. Required when `isMarketplaceApp` is `true`, optional otherwise.                            |
| `isMarketplaceApp`  | `boolean` | `false`                    | When true, token is required at construction time.                                                                        |
| `tokenId`           | `string`  | —                          | Extracted from the parsed token. Appended to the compound key automatically. Skipped when `SKIP_TOKEN_ID` env var is set. |
| `retryCount`        | `number`  | `2`                        | Max retry attempts for retryable errors.                                                                                  |
| `requestsPerSecond` | `number`  | `20`                       | Rate limiter sliding window limit.                                                                                        |
| `validateResponses` | `boolean` | `true`                     | Validate API responses through Zod schemas.                                                                               |
| `baseUrl`           | `string`  | `https://api.assembly.com` | Base URL for all API requests.                                                                                            |

#### Resource namespaces

| Namespace               | Methods                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `workspace`             | `get()`                                                          |
| `clients`               | `list()`, `get()`, `create()`, `update()`, `delete()`            |
| `companies`             | `list()`, `get()`, `create()`, `update()`, `delete()`            |
| `internalUsers`         | `list()`, `get()`                                                |
| `customFields`          | `list(entityType)`                                               |
| `customFieldOptions`    | `list()`                                                         |
| `notes`                 | `list()`, `get()`, `create()`, `update()`, `delete()`            |
| `messageChannels`       | `list()`, `get()`, `create()`                                    |
| `messages`              | `list()`, `send()`                                               |
| `products`              | `list()`, `get()`                                                |
| `prices`                | `list()`, `get()`                                                |
| `invoiceTemplates`      | `list()`                                                         |
| `invoices`              | `list()`, `get()`, `create()`                                    |
| `subscriptionTemplates` | `list()`                                                         |
| `subscriptions`         | `list()`, `get()`, `create()`, `cancel()`                        |
| `payments`              | `list()`                                                         |
| `fileChannels`          | `list()`, `get()`, `create()`                                    |
| `files`                 | `list()`, `get()`, `create()`, `delete()`, `updatePermissions()` |
| `contractTemplates`     | `list()`, `get()`                                                |
| `contracts`             | `list()`, `get()`, `send()`                                      |
| `forms`                 | `list()`, `get()`                                                |
| `formResponses`         | `list()`, `request()`                                            |
| `tasks`                 | `list()`, `get()`, `create()`, `update()`, `delete()`            |
| `taskTemplates`         | `list()`, `get()`                                                |
| `notifications`         | `list()`, `create()`, `delete()`, `markRead()`, `markUnread()`   |
| `appConnections`        | `list()`, `create()`                                             |
| `appInstalls`           | `list()`                                                         |

#### Marketplace apps

```typescript
const client = createAssemblyKit({
  workspaceId: "ws-123",
  apiKey: "your-api-key",
  token: encryptedToken,
  isMarketplaceApp: true,
});
```

#### Disabling response validation

```typescript
const client = createAssemblyKit({
  workspaceId: "ws-123",
  apiKey: "your-api-key",
  validateResponses: false, // skip Zod parsing for performance
});
```

### Pagination

Use `paginate()` to iterate through all pages of a paginated resource:

```typescript
import { createAssemblyKit, paginate } from "@anitshrsth/assembly-kit";

const client = createAssemblyKit({ workspaceId: "ws-123", apiKey: "key" });

for await (const task of paginate(client.tasks.list)) {
  console.log(task.title);
}
```

### Error classes

All Assembly errors extend the base `AssemblyError` class, which carries a `statusCode` and optional `details` payload. Import them from the package root:

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
  await client.workspaces.get(id);
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
| `AssemblyInvalidTokenError`  | 401    | Token could not be decrypted                            |
| `AssemblyUnauthorizedError`  | 401    | API key rejected by Assembly                            |
| `AssemblyForbiddenError`     | 403    | API key lacks required permission                       |
| `AssemblyNotFoundError`      | 404    | Requested resource does not exist                       |
| `AssemblyValidationError`    | 422    | Request payload rejected by API                         |
| `AssemblyRateLimitError`     | 429    | Rate limit exceeded (`.retryAfter?: number`)            |
| `AssemblyServerError`        | 500    | Unexpected error on Assembly servers                    |
| `AssemblyResponseParseError` | 500    | API response failed Zod schema validation (`.zodError`) |
| `AssemblyConnectionError`    | 503    | Network error reaching the API                          |

### Schemas

All Zod schemas are available from `assembly-kit/schemas`. Each resource has a **base** schema, a **response** schema (wrapping the base for paginated API responses), and optionally a **request** schema for create/update payloads.

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

Response schemas wrap the base schemas into the paginated shape returned by the Assembly API:

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

Request schemas define the shape of create/update payloads:

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

Decrypt, validate, and inspect encrypted Assembly tokens using the `AssemblyToken` class.

#### `AssemblyToken`

Decrypt and validate a token using your API key. The constructor decrypts the token and exposes the payload along with convenience getters and guard methods:

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
token.isClientUser; // true if clientId + companyId present
token.isInternalUser; // true if internalUserId present

// Throwing guards — return narrowed payload type or throw AssemblyUnauthorizedError
const clientPayload = token.ensureIsClient(); // ClientTokenPayload
const internalPayload = token.ensureIsInternalUser(); // InternalUserTokenPayload

// Build compound API key for the X-API-Key header
const key = token.buildCompoundKey({ apiKey });
// With tokenId:    "workspaceId/apiKey/tokenId"
// Without tokenId: "workspaceId/apiKey"
```

Throws `AssemblyNoTokenError` if the token is missing, or `AssemblyInvalidTokenError` if decryption/validation fails.

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

### React Server Components (`assembly-kit/react`)

Pre-built cached singletons for React Server Components. Each helper wraps its core counterpart with React's [`cache`](https://react.dev/reference/react/cache), deduplicating instances within a single server render. Arguments are primitives so React compares by value.

Requires `react >= 18` as a peer dependency.

```bash
bun add @anitshrsth/assembly-kit react
```

#### `getAssemblyToken`

Cached factory for `AssemblyToken`. Decrypts and validates the token once per render:

```ts
import { getAssemblyToken } from "@anitshrsth/assembly-kit/react";

const token = getAssemblyToken(encryptedHex, apiKey);
token.workspaceId; // string
token.isClientUser; // boolean
```

#### `getAssemblyKit`

Cached factory for `AssemblyKitClient`:

```ts
import { getAssemblyKit } from "@anitshrsth/assembly-kit/react";

const client = getAssemblyKit(workspaceId, apiKey, token, tokenId);
const workspace = await client.workspace.get();
```

#### `getAssemblyClient`

Cached factory for the legacy `AssemblyClient`. Requires `@assembly-js/node-sdk` as a peer dependency — tree-shaken if unused:

```ts
import { getAssemblyClient } from "@anitshrsth/assembly-kit/react";

const client = getAssemblyClient(apiKey, token);
const workspace = await client.retrieveWorkspace();
```

#### Full example

```tsx
// app/page.tsx
import { getAssemblyKit, getAssemblyToken } from "@anitshrsth/assembly-kit/react";

export default async function Page() {
  const apiKey = process.env.ASSEMBLY_API_KEY!;
  const workspaceId = process.env.ASSEMBLY_WORKSPACE_ID!;
  const rawToken = process.env.ASSEMBLY_TOKEN; // optional for marketplace apps

  // Both calls are deduplicated — only one instance is created per render
  const token = rawToken ? getAssemblyToken(rawToken, apiKey) : undefined;
  const client = getAssemblyKit(workspaceId, apiKey, rawToken, token?.tokenId);

  const workspace = await client.workspace.get();
  // ...
}
```

#### Non-React caching (plain Node.js / Bun)

For non-React environments, use a `Map` keyed by token (when present) or workspaceId for process-level caching:

```ts
import { AssemblyToken, createAssemblyKit, type AssemblyKitClient } from "@anitshrsth/assembly-kit";

const cache = new Map<string, AssemblyKitClient>();

export function getAssemblyKit(opts: {
  workspaceId: string;
  apiKey: string;
  token?: string;
  tokenId?: string;
}): AssemblyKitClient {
  const key = opts.token ?? opts.workspaceId;
  let cached = cache.get(key);
  if (!cached) {
    cached = createAssemblyKit(opts);
    cache.set(key, cached);
  }
  return cached;
}
```

> **Note:** For long-lived processes with many different tokens, consider adding cache eviction (TTL or LRU) to avoid unbounded memory growth.

### App Bridge

The app-bridge entry point provides framework-agnostic utilities for communicating with the Assembly dashboard from an embedded iframe app. Works in any JavaScript environment — no React dependency required.

#### `sendToParent`

Sends a typed postMessage payload to the Assembly dashboard parent frame:

```typescript
import { sendToParent, Icons } from "@anitshrsth/assembly-kit/app-bridge";
import type { PrimaryCtaPayload } from "@anitshrsth/assembly-kit/app-bridge";

// Register a primary CTA button in the dashboard header
const payload: PrimaryCtaPayload = {
  type: "header.primaryCta",
  label: "Create Invoice",
  icon: Icons.Plus,
  onClick: "header.primaryCta.onClick",
};

sendToParent(payload);
```

When called without a `portalUrl`, it fans out the message to all known Assembly dashboard domains. Pass a specific origin to restrict:

```typescript
sendToParent(payload, "https://dashboard.assembly.com");
```

`sendToParent` is SSR-safe — it's a no-op when `window` is undefined.

#### Payload types

```typescript
import type {
  PrimaryCtaPayload, // { type: "header.primaryCta", label?, icon?, onClick? }
  SecondaryCtaPayload, // { type: "header.secondaryCta", label?, icon?, onClick? }
  ActionsMenuPayload, // { type: "header.actionsMenu", items: ActionItem[] }
  AppBridgePayload, // Discriminated union of all three
  ActionItem, // { label, onClick, icon?, color? }
  CtaConfig, // { label?, icon?, onClick?(), color? }
  BridgeOpts, // { portalUrl?, show? }
} from "@anitshrsth/assembly-kit/app-bridge";
```

#### Clearing a slot

Send a payload with only the `type` field to remove a button, or an empty items array for the actions menu:

```typescript
sendToParent({ type: "header.primaryCta" });
sendToParent({ type: "header.actionsMenu", items: [] });
```

### Bridge UI (React Hooks)

React hooks that wrap `sendToParent` into a declarative API. They handle setup, cleanup, and `beforeunload` automatically.

Requires `react >= 18` as a peer dependency.

#### `usePrimaryCta`

Registers a primary CTA button in the dashboard header:

```tsx
import { usePrimaryCta } from "@anitshrsth/assembly-kit/bridge-ui";
import { Icons } from "@anitshrsth/assembly-kit/app-bridge";

function MyApp() {
  usePrimaryCta({
    label: "Create Invoice",
    icon: Icons.Plus,
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
import { Icons } from "@anitshrsth/assembly-kit/app-bridge";

function MyApp() {
  useSecondaryCta({
    label: "Export",
    icon: Icons.Download,
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
import { Icons } from "@anitshrsth/assembly-kit/app-bridge";

function MyApp() {
  useActionsMenu([
    { label: "Archive", onClick: "actions.archive", icon: Icons.Archive },
    {
      label: "Delete",
      onClick: "actions.delete",
      icon: Icons.Trash,
      color: "red",
    },
  ]);

  return <div>My App</div>;
}
```

#### Visibility toggle

All hooks accept an optional second argument to control visibility:

```tsx
usePrimaryCta({ label: "Save", onClick: () => save() }, { show: hasChanges });
```

When `show` is `false`, the slot is cleared in the dashboard header. Defaults to `true`.

#### Portal URL

If your app is embedded in a custom portal, pass the portal origin to restrict postMessage targeting:

```tsx
usePrimaryCta(
  { label: "Save", onClick: () => save() },
  { portalUrl: "https://my-portal.example.com" },
);
```

### Legacy Client

A drop-in wrapper around the original `@assembly-js/node-sdk` that adds automatic retry with exponential backoff on 429 (rate limit) and 5xx (server) errors. Uses a `Proxy` to wrap all 76+ SDK methods automatically.

Requires `@assembly-js/node-sdk` as a peer dependency — install it alongside `@anitshrsth/assembly-kit`:

```bash
bun add @anitshrsth/assembly-kit @assembly-js/node-sdk
```

#### Basic usage

```typescript
import { createAssemblyClient } from "@anitshrsth/assembly-kit/assembly-client";

const client = createAssemblyClient({
  apiKey: "your-api-key",
  token: "encrypted-token", // optional
});

// All original SDK methods are available, with automatic retry
const workspace = await client.retrieveWorkspace();
const clients = await client.listClients({ limit: 50 });
```

#### Custom retry options

```typescript
const client = createAssemblyClient({
  apiKey: "your-api-key",
  retry: {
    retries: 5, // max attempts (default: 3)
    minTimeout: 500, // min delay in ms (default: 1000)
    maxTimeout: 10000, // max delay in ms (default: 5000)
    factor: 2, // exponential factor (default: 2)
  },
});
```

#### Disabling retry

```typescript
const client = createAssemblyClient({
  apiKey: "your-api-key",
  retry: false, // SDK methods called directly, no retry wrapper
});
```

> **Note:** The original SDK uses a global `OpenAPI` config object internally. Multiple `createAssemblyClient()` calls with different credentials will interfere with each other. Use one instance per credential set.

## Development

```bash
bun run build        # build to dist/
bun run dev          # build in watch mode
bun test             # run tests
bun run type-check   # TypeScript check (no emit)
bun run lint         # oxlint
bun run fix          # auto-fix lint + format
```

## License

MIT
