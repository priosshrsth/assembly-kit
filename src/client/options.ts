import type { KitMode } from "src/constants/kit-mode";

/**
 * Options for `createAssemblyKit()`.
 *
 * - `kitMode: "local"` (default) → only `apiKey` required. `workspaceId` and `token` are optional.
 * - `kitMode: "marketplace"` → either `token` or `workspaceId` must be provided.
 * - When `token` is provided, compound key is built from the decrypted token payload.
 * - When only `workspaceId` is provided, compound key is `workspaceId/apiKey`.
 * - When neither is provided (local mode), compound key is just `apiKey`.
 */
export interface AssemblyKitOptions {
  /** Assembly API key. */
  apiKey: string;
  /** Encrypted token from Assembly. */
  token?: string;
  /** Workspace ID. Optional — used to build compound key when token is not provided. */
  workspaceId?: string;
  /**
   * App mode.
   * - `"local"` — only `apiKey` required. `workspaceId` and `token` optional.
   * - `"marketplace"` — either `token` or `workspaceId` required.
   * @default "local"
   */
  kitMode?: KitMode;
  /** When true, API responses are validated through Zod schemas. @default true */
  validateResponses?: boolean;
  /** Base URL for all API requests. @default "https://app.assembly.com/api" */
  baseUrl?: string;
  /** Number of retry attempts for retryable errors. @default 2 */
  retryCount?: number;
  /** Maximum requests per second for the rate limiter. @default 20 */
  requestsPerSecond?: number;
  /** Injectable fetch function for testing. Defaults to global fetch. */
  fetch?: typeof globalThis.fetch;
}
