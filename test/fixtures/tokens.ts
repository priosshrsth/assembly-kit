/**
 * Pre-generated encrypted token constants for testing.
 *
 * Tokens are produced by encrypting known JSON payloads with AES-128-CBC
 * using a key derived from `TEST_API_KEY` via HMAC-SHA256. The first 16 bytes
 * of the hex blob are the IV, followed by the ciphertext.
 */
import { encryptTokenString } from "src/token/crypto";

// ---------------------------------------------------------------------------
// Test API key — all test tokens are encrypted with this key
// ---------------------------------------------------------------------------
export const TEST_API_KEY = "test-api-key-for-assembly-kit-unit-tests";

// ---------------------------------------------------------------------------
// Test workspace / user IDs
// ---------------------------------------------------------------------------
export const TEST_WORKSPACE_ID = "ws-00000000-0000-0000-0000-000000000001";
export const TEST_CLIENT_ID = "cl-00000000-0000-0000-0000-000000000002";
export const TEST_COMPANY_ID = "co-00000000-0000-0000-0000-000000000003";
export const TEST_INTERNAL_USER_ID = "iu-00000000-0000-0000-0000-000000000004";
export const TEST_TOKEN_ID = "tk-00000000-0000-0000-0000-000000000005";
export const TEST_BASE_URL = "https://staging-api.assembly.com";

// ---------------------------------------------------------------------------
// Encrypt helper — thin wrapper around encryptTokenString for payloads
// ---------------------------------------------------------------------------
const encryptPayload = (
  apiKey: string,
  payload: Record<string, string>
): string => encryptTokenString({ apiKey, plaintext: JSON.stringify(payload) });

/** Pad a payload's workspaceId so the JSON is exactly `targetLen` bytes. */
const padPayload = (
  basePayload: Record<string, string>,
  targetLen: number
): Record<string, string> => {
  const currentLen = Buffer.byteLength(JSON.stringify(basePayload), "utf8");
  if (currentLen > targetLen) {
    throw new Error(
      `Base payload is ${currentLen} bytes, cannot shrink to ${targetLen}`
    );
  }
  const padding = "x".repeat(targetLen - currentLen);
  return { ...basePayload, workspaceId: basePayload.workspaceId + padding };
};

// ---------------------------------------------------------------------------
// 1. Client token: { workspaceId, clientId, companyId }
// ---------------------------------------------------------------------------
export const CLIENT_TOKEN = encryptPayload(TEST_API_KEY, {
  clientId: TEST_CLIENT_ID,
  companyId: TEST_COMPANY_ID,
  workspaceId: TEST_WORKSPACE_ID,
});

// ---------------------------------------------------------------------------
// 2. Internal user token: { workspaceId, internalUserId }
// ---------------------------------------------------------------------------
export const INTERNAL_USER_TOKEN = encryptPayload(TEST_API_KEY, {
  internalUserId: TEST_INTERNAL_USER_ID,
  workspaceId: TEST_WORKSPACE_ID,
});

// ---------------------------------------------------------------------------
// 3. Token with tokenId: { workspaceId, clientId, companyId, tokenId }
// ---------------------------------------------------------------------------
export const TOKEN_WITH_TOKEN_ID = encryptPayload(TEST_API_KEY, {
  clientId: TEST_CLIENT_ID,
  companyId: TEST_COMPANY_ID,
  tokenId: TEST_TOKEN_ID,
  workspaceId: TEST_WORKSPACE_ID,
});

// ---------------------------------------------------------------------------
// 4. Token with baseUrl: { workspaceId, internalUserId, baseUrl }
// ---------------------------------------------------------------------------
export const TOKEN_WITH_BASE_URL = encryptPayload(TEST_API_KEY, {
  baseUrl: TEST_BASE_URL,
  internalUserId: TEST_INTERNAL_USER_ID,
  workspaceId: TEST_WORKSPACE_ID,
});

// ---------------------------------------------------------------------------
// 5. Block-aligned token (JSON is exactly 128 bytes — Node 24 PKCS7 edge case)
//    When plaintext is exactly a multiple of 16 bytes, PKCS7 adds a full
//    16-byte padding block. This is the case that fails on Node 24 with
//    OpenSSL 3.4/3.5 when autoPadding=true.
// ---------------------------------------------------------------------------
const blockAlignedBase: Record<string, string> = {
  internalUserId: TEST_INTERNAL_USER_ID,
  workspaceId: TEST_WORKSPACE_ID,
};
const blockAlignedPadded = padPayload(blockAlignedBase, 128);
const blockAlignedJson = JSON.stringify(blockAlignedPadded);
if (Buffer.byteLength(blockAlignedJson, "utf8") % 16 !== 0) {
  throw new Error("Block-aligned fixture is not a multiple of 16 bytes");
}
export const BLOCK_ALIGNED_TOKEN = encryptTokenString({
  apiKey: TEST_API_KEY,
  plaintext: blockAlignedJson,
});

// Export the padded workspace ID so tests can verify the decrypted payload
export const BLOCK_ALIGNED_WORKSPACE_ID = blockAlignedPadded.workspaceId;
