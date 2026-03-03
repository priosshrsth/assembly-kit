import pRetry from "p-retry";

import { isRetryableError } from "./error-filter";
import type { RetryOptions } from "./options";

/**
 * Creates a retry wrapper function configured with the given options.
 * Only retries on 429 and 5xx errors (determined by `isRetryableError`).
 */
export const createRetryFn =
  (opts: RetryOptions): (<T>(fn: () => Promise<T>) => Promise<T>) =>
  <T>(fn: () => Promise<T>): Promise<T> =>
    pRetry(fn, {
      factor: opts.factor ?? 2,
      maxTimeout: opts.maxTimeout ?? 5000,
      minTimeout: opts.minTimeout ?? 1000,
      retries: opts.retries ?? 3,
      shouldRetry: (context: { error: unknown }) =>
        isRetryableError(context.error),
    });
