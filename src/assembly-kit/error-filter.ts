/**
 * Duck-typed retryable error check.
 * Retries on 429 (rate limit) and 5xx (server errors).
 * Uses duck typing to avoid importing SDK internals.
 */
export const isRetryableError = (error: unknown): boolean => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const { status } = error as { status: unknown };
    return status === 429 || (typeof status === "number" && status >= 500);
  }
  return false;
};
