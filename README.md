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
