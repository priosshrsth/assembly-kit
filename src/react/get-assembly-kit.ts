import { cache } from "react";
import type { AssemblyKitClient } from "src/assembly-kit/assembly-kit-client";
import { createAssemblyKit } from "src/assembly-kit/create-assembly-kit";

/**
 * Request-scoped cached factory for `AssemblyKitClient`.
 *
 * Uses React's `cache` to deduplicate within a single server render —
 * multiple calls with the same arguments return the same client instance.
 *
 * @param workspaceId - Required workspace identifier.
 * @param apiKey - Your Assembly API key.
 * @param token - Optional encrypted token (required for marketplace apps).
 * @param tokenId - Optional token ID (appended to the compound key).
 * @returns A cached `AssemblyKitClient` instance.
 *
 * @example
 * ```ts
 * import { getAssemblyKit } from "@anitshrsth/assembly-kit/react";
 *
 * const client = getAssemblyKit("ws-123", apiKey);
 * const workspace = await client.workspace.get();
 * ```
 */
export const getAssemblyKit: (
  workspaceId: string,
  apiKey: string,
  token?: string,
  tokenId?: string
) => AssemblyKitClient = cache(
  (
    workspaceId: string,
    apiKey: string,
    token?: string,
    tokenId?: string
  ): AssemblyKitClient =>
    createAssemblyKit({ apiKey, token, tokenId, workspaceId })
);
