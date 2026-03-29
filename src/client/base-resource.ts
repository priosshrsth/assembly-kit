import pRetry from "p-retry";
import type { AssemblySDK } from "src/sdk-init";
import type { z } from "zod";

import type { RetryOptions } from "./options";
import { parseResponse } from "./parse-response";

const isRetryableError = (error: unknown): boolean => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const { status } = error as { status: unknown };
    return status === 429 || (typeof status === "number" && status >= 500);
  }
  return false;
};

/**
 * Wraps an SDK instance with a Proxy that retries every method call
 * on 429/5xx errors using p-retry.
 */
const withRetry = (sdk: AssemblySDK, retry: RetryOptions): AssemblySDK =>
  new Proxy(sdk, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") {
        return value;
      }
      return (...args: unknown[]) =>
        pRetry(() => value.apply(target, args), {
          factor: retry.factor ?? 2,
          maxTimeout: retry.maxTimeout ?? 5000,
          minTimeout: retry.minTimeout ?? 1000,
          retries: retry.retries ?? 3,
          shouldRetry: (context: { error: unknown }) => isRetryableError(context.error),
        });
    },
  });

export abstract class BaseResource {
  protected readonly sdk: AssemblySDK;
  protected readonly validateResponses: boolean;

  constructor(sdk: AssemblySDK, validateResponses: boolean, retry: RetryOptions | false) {
    this.sdk = retry === false ? sdk : withRetry(sdk, retry);
    this.validateResponses = validateResponses;
  }

  /** Parse and validate data against a Zod schema when validation is enabled. */
  protected parse<T>(schema: z.ZodType<T>, data: unknown): T {
    if (!this.validateResponses) {
      return data as T;
    }
    return parseResponse(schema, data);
  }
}
