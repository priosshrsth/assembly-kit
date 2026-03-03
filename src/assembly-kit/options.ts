export interface ClientOptions {
  /** Workspace ID — required, used to build the compound API key. */
  workspaceId: string;
  /** API key — required, used to build the compound API key. */
  apiKey: string;
  /** Encrypted token from Assembly. Required when `isMarketplaceApp` is true, optional otherwise. */
  token?: string;
  /** When true, a token must be provided at construction time. Defaults to false. */
  isMarketplaceApp?: boolean;
  /** Extracted from the parsed token. Appended to the compound key automatically. Skipped when `SKIP_TOKEN_ID` env var is set. */
  tokenId?: string;
  /** Number of retry attempts for retryable errors. Defaults to 2. */
  retryCount?: number;
  /** Maximum requests per second for the rate limiter. Defaults to 20. */
  requestsPerSecond?: number;
  /** When true, API responses are validated through Zod schemas. Defaults to true. */
  validateResponses?: boolean;
  /** Base URL for all API requests. Defaults to https://api.assembly.com. */
  baseUrl?: string;
  /** Injectable fetch function for testing. Defaults to global fetch. */
  fetch?: typeof globalThis.fetch;
}
