import { cache } from "react";
import { AssemblyToken } from "src/token/assembly-token";

/**
 * Request-scoped cached factory for `AssemblyToken`.
 *
 * Uses React's `cache` to deduplicate within a single server render —
 * multiple calls with the same arguments return the same instance.
 *
 * @param token - Encrypted token hex string from Assembly.
 * @param apiKey - Your Assembly API key (used for decryption).
 * @returns A cached `AssemblyToken` instance.
 *
 * @example
 * ```ts
 * import { getAssemblyToken } from "@anitshrsth/assembly-kit/react";
 *
 * // Both calls return the same instance within a single render
 * const token = getAssemblyToken(encryptedHex, apiKey);
 * const same = getAssemblyToken(encryptedHex, apiKey);
 * ```
 */
export const getAssemblyToken: (
  token: string,
  apiKey: string
) => AssemblyToken = cache(
  (token: string, apiKey: string): AssemblyToken =>
    new AssemblyToken({ apiKey, token })
);
