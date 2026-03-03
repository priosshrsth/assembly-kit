/** Retry configuration for the legacy client wrapper. */
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

/** Options for `createLegacyClient()`. */
export interface LegacyClientOptions {
  /** Assembly API key. */
  apiKey: string;
  /** Optional encrypted token for marketplace apps. */
  token?: string;
  /** Retry configuration, or `false` to disable retry entirely. */
  retry?: RetryOptions | false;
}

export const DEFAULT_RETRY: RetryOptions = {
  factor: 2,
  maxTimeout: 5000,
  minTimeout: 1000,
  retries: 3,
};
