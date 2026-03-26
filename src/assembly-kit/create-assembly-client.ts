import { assemblyApi } from "@assembly-js/node-sdk";

import { DEFAULT_RETRY } from "./options";
import type { LegacyClientOptions } from "./options";
import { createRetryFn } from "./retry";
import { wrapSdk } from "./wrap-sdk";
import type { AssemblyClient } from "./wrap-sdk";

/**
 * Creates a legacy Assembly client that wraps the original `@assembly-js/node-sdk`
 * with automatic retry on 429 and 5xx errors.
 *
 * **Global singleton caveat:** The original SDK mutates a global `OpenAPI` config
 * object, so multiple `createAssemblyClient()` calls with different credentials will
 * interfere with each other. Use a single instance per credential set.
 *
 * @example
 * ```ts
 * import { createAssemblyClient } from "assembly-kit/legacy";
 *
 * const client = createAssemblyClient({ apiKey: "your-key", token: "encrypted-token" });
 * const workspace = await client.retrieveWorkspace();
 * ```
 */
export const createAssemblyClient = (
  options: LegacyClientOptions
): AssemblyClient => {
  const sdk = assemblyApi({ apiKey: options.apiKey, token: options.token });

  if (options.retry === false) {
    return sdk as unknown as AssemblyClient;
  }

  const retryOpts = { ...DEFAULT_RETRY, ...options.retry };
  const retryFn = createRetryFn(retryOpts);
  return wrapSdk(sdk, retryFn);
};
