/** Retry configuration for the SDK client wrapper. */
export interface RetryOptions {
  /** Maximum number of retries. @default 3 */
  retries?: number;
  /** Minimum time between retries in ms. @default 1000 */
  minTimeout?: number;
  /** Maximum time between retries in ms. @default 5000 */
  maxTimeout?: number;
  /** Exponential backoff factor. @default 2 */
  factor?: number;
}

export const DEFAULT_RETRY: RetryOptions = {
  factor: 2,
  maxTimeout: 5000,
  minTimeout: 1000,
  retries: 3,
};

/**
 * Options for `createAssemblyKit()`.
 *
 * - `isMarketplaceApp: true` → `token` is required (marketplace apps receive it from the platform).
 * - `isMarketplaceApp: false` (default) → `workspaceId` is required; `token` is optional.
 * - When both `token` and `workspaceId` are provided, `token` takes precedence.
 */
export interface AssemblyKitOptions {
  /** Assembly API key. */
  apiKey: string;
  /** Encrypted token from Assembly. Required when `isMarketplaceApp` is `true`. */
  token?: string;
  /** Workspace ID. Required when `isMarketplaceApp` is `false` and `token` is not provided. */
  workspaceId?: string;
  /**
   * When `true`, `token` is required at construction time (marketplace apps).
   * When `false` (default), `workspaceId` is required instead.
   * @default false
   */
  isMarketplaceApp?: boolean;
  /** Retry configuration, or `false` to disable retry entirely. */
  retry?: RetryOptions | false;
  /** When true, all responses are validated through Zod schemas. Default: true. */
  validateResponses?: boolean;
}
