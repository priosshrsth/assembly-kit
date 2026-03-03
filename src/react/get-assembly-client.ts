import { cache } from "react";
import { createAssemblyClient } from "src/assembly-client/create-assembly-client";
import type { AssemblyClient } from "src/assembly-client/wrap-sdk";

/**
 * Request-scoped cached factory for the legacy `AssemblyClient`.
 *
 * Uses React's `cache` to deduplicate within a single server render —
 * multiple calls with the same arguments return the same client instance.
 *
 * Requires `@assembly-js/node-sdk` as a peer dependency. With
 * `"sideEffects": false`, bundlers tree-shake this module if unused.
 *
 * @param apiKey - Your Assembly API key.
 * @param token - Optional encrypted token for marketplace apps.
 * @returns A cached `AssemblyClient` instance.
 *
 * @example
 * ```ts
 * import { getAssemblyClient } from "@anitshrsth/assembly-kit/react";
 *
 * const client = getAssemblyClient(apiKey, token);
 * const workspace = await client.retrieveWorkspace();
 * ```
 */
export const getAssemblyClient: (
  apiKey: string,
  token?: string
) => AssemblyClient = cache(
  (apiKey: string, token?: string): AssemblyClient =>
    createAssemblyClient({ apiKey, token })
);
