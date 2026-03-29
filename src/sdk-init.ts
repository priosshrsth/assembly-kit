/**
 * Custom SDK initializer that wraps `@assembly-js/node-sdk`.
 *
 * Calls `assemblyApi()` once with a dummy key (under ASSEMBLY_ENV=local) to
 * obtain the `DefaultService` reference + `sendWebhook`. Then wraps it in a
 * Proxy that sets `OpenAPI.HEADERS` to this instance's compound key before
 * every method call — making multiple `createAssemblyKit()` instances safe
 * in the same process.
 *
 * With `unbundle: false` in vite.config.ts, the SDK is inlined into
 * assembly-kit's dist. Consumers never need to install `@assembly-js/node-sdk`.
 */

import { type AssemblyAPI, OpenAPI, assemblyApi } from "@assembly-js/node-sdk";

const SDK_VERSION: string = "3.19.1";

/** The underlying SDK type returned by `assemblyApi()`. */
export type AssemblySDK = AssemblyAPI;

// Obtain the DefaultService reference once. We pass a placeholder key and
// set ASSEMBLY_ENV=local so init.js skips token decryption. The headers it
// sets are immediately overwritten per-instance via the Proxy.
const _prevEnv: string | undefined = process.env.ASSEMBLY_ENV;
process.env.ASSEMBLY_ENV = "local";
const _baseSdk: AssemblyAPI = assemblyApi({ apiKey: "__placeholder__" });
process.env.ASSEMBLY_ENV = _prevEnv;

/**
 * Create a per-instance SDK wrapper that sets `OpenAPI.HEADERS` to this
 * instance's compound key before every method call.
 *
 * JS is single-threaded, so the header is always correct when the fetch fires.
 */
export function initSdk({ compoundKey }: { compoundKey: string }): AssemblySDK {
  const headers: Record<string, string> = {
    "X-API-Key": compoundKey,
    "X-Assembly-SDK-Version": SDK_VERSION,
  };

  return new Proxy(_baseSdk, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => {
        OpenAPI.HEADERS = headers;
        return (value as (...a: unknown[]) => unknown).apply(target, args);
      };
    },
  });
}
