export interface ClientOptions {
  /** Workspace ID — required, used to build the compound API key. */
  workspaceId: string;
  /** API key — required, used to build the compound API key. */
  apiKey: string;
  /** Opaque token string. Required when `isMarketplaceApp` is true. */
  token?: string;
  /** When true, a token must be provided at construction time. Defaults to false. */
  isMarketplaceApp?: boolean;
  /** Optional token ID appended to the compound key. */
  tokenId?: string;
  /** Number of retry attempts for retryable errors. Defaults to 2. */
  retryCount?: number;
  /** Maximum requests per second for the rate limiter. Defaults to 20. */
  requestsPerSecond?: number;
  /** When true, API responses are validated through Zod schemas. Defaults to true. */
  validateResponses?: boolean;
  /** Base URL for all API requests. Defaults to https://app.assembly.com/api. */
  baseUrl?: string;
  /** Injectable fetch function for testing. Defaults to global fetch. */
  fetch?: typeof globalThis.fetch;
}
