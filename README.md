# assembly-kit

TypeScript SDK for the [Assembly](https://assembly.ac) platform. ESM-only, targets Node.js 18+, Node.js 24+, and Bun.

## Installation

```bash
bun add assembly-kit
# or
npm install assembly-kit
```

## Usage

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
} from "assembly-kit";
```

#### Catching errors

```typescript
import {
  AssemblyRateLimitError,
  AssemblyUnauthorizedError,
  AssemblyError,
} from "assembly-kit";

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

All Zod schemas live under `assembly-kit/schemas`. Each resource has a **base** schema, a **response** schema (wrapping the base for paginated API responses), and optionally a **request** schema for create/update payloads.

```typescript
// Base schemas — the core shape of each resource
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
} from "assembly-kit/schemas";

// TypeScript types inferred from schemas
import type {
  Client,
  Company,
  Task,
  TaskStatus,
  Workspace,
  InternalUser,
} from "assembly-kit/schemas";
```

#### Response schemas

Response schemas wrap the base schemas into the paginated shape returned by the Assembly API:

```typescript
import {
  ClientsResponseSchema,
  CompaniesResponseSchema,
  TasksResponseSchema,
} from "assembly-kit/schemas";

import type {
  ClientsResponse,
  CompaniesResponse,
  TasksResponse,
} from "assembly-kit/schemas";
```

#### Request schemas

Request schemas define the shape of create/update payloads:

```typescript
import {
  ClientCreateRequestSchema,
  ClientUpdateRequestSchema,
  CompanyCreateRequestSchema,
  TaskCreateRequestSchema,
} from "assembly-kit/schemas";

import type {
  ClientCreateRequest,
  ClientUpdateRequest,
} from "assembly-kit/schemas";
```

#### Validating data

```typescript
import { ClientSchema } from "assembly-kit/schemas";

const result = ClientSchema.safeParse(unknownData);

if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error);
}
```

#### Sub-path imports

You can also import from specific schema groups to reduce bundle size:

```typescript
import { ClientSchema } from "assembly-kit/schemas/base";
import { ClientsResponseSchema } from "assembly-kit/schemas/responses";
import { ClientCreateRequestSchema } from "assembly-kit/schemas/requests";
```

### Token Utilities

Parse and validate encrypted Assembly tokens, build compound API keys, and narrow token payloads to client or internal user types.

#### `parseToken`

Decrypt and validate a token using your API key. Returns the typed `TokenPayload`:

```typescript
import { parseToken } from "assembly-kit";

const payload = parseToken({ token: encryptedTokenHex, apiKey });
// payload.workspaceId — always present
// payload.clientId    — present for client (portal) users
// payload.companyId   — present for client users
// payload.internalUserId — present for internal (team member) users
// payload.tokenId     — present in some marketplace tokens
// payload.baseUrl     — overrides the API base URL if set
```

Throws `AssemblyNoTokenError` if the token is missing, or `AssemblyInvalidTokenError` if decryption/validation fails.

#### `buildCompoundKey`

Build the compound API key for the `X-API-Key` header:

```typescript
import { buildCompoundKey } from "assembly-kit";

const key = buildCompoundKey({ apiKey, payload });
// With tokenId:    "workspaceId/apiKey/tokenId"
// Without tokenId: "workspaceId/apiKey"
```

#### Type guards

Narrow a `TokenPayload` to a specific user type:

```typescript
import {
  isClientToken,
  isInternalUserToken,
  ensureIsClient,
  ensureIsInternalUser,
} from "assembly-kit";
import type {
  ClientTokenPayload,
  InternalUserTokenPayload,
} from "assembly-kit";

// Type predicates (return boolean)
if (isClientToken(payload)) {
  payload.clientId; // string (narrowed)
  payload.companyId; // string (narrowed)
}

if (isInternalUserToken(payload)) {
  payload.internalUserId; // string (narrowed)
}

// Throwing guards (return narrowed type or throw AssemblyUnauthorizedError)
const client = ensureIsClient(payload);
const internal = ensureIsInternalUser(payload);
```

### App Bridge

The app-bridge entry point provides framework-agnostic utilities for communicating with the Assembly dashboard from an embedded iframe app. Works in any JavaScript environment — no React dependency required.

#### `sendToParent`

Sends a typed postMessage payload to the Assembly dashboard parent frame:

```typescript
import { sendToParent, Icons } from "assembly-kit/app-bridge";
import type { PrimaryCtaPayload } from "assembly-kit/app-bridge";

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
} from "assembly-kit/app-bridge";
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
import { usePrimaryCta } from "assembly-kit/bridge-ui";
import { Icons } from "assembly-kit/app-bridge";

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
import { useSecondaryCta } from "assembly-kit/bridge-ui";
import { Icons } from "assembly-kit/app-bridge";

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
import { useActionsMenu } from "assembly-kit/bridge-ui";
import { Icons } from "assembly-kit/app-bridge";

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
  { portalUrl: "https://my-portal.example.com" }
);
```

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
