/**
 * Pre-generated encrypted token constants for testing.
 *
 * Tokens are produced by encrypting known JSON payloads with AES-128-CBC
 * using a key derived from `TEST_API_KEY` via HMAC-SHA256. The first 16 bytes
 * of the hex blob are the IV, followed by the ciphertext.
 */
import * as nodeCrypto from "node:crypto";

// ---------------------------------------------------------------------------
// Test API key — all test tokens are encrypted with this key
// ---------------------------------------------------------------------------
export const TEST_API_KEY = "test-api-key-for-assembly-kit-unit-tests";

// ---------------------------------------------------------------------------
// Encrypt helpers (reverse of decryptTokenString)
// ---------------------------------------------------------------------------
const deriveEncryptionKey = (apiKey: string): string =>
  nodeCrypto.createHmac("sha256", apiKey).digest("hex").slice(0, 32);

const encrypt = (keyBuffer: Buffer, plaintext: string): string => {
  const iv = nodeCrypto.randomBytes(16);
  const cipher = nodeCrypto.createCipheriv("aes-128-cbc", keyBuffer, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, encrypted]).toString("hex");
};

const encryptPayload = (
  apiKey: string,
  payload: Record<string, string>
): string => {
  const keyBuffer = Buffer.from(deriveEncryptionKey(apiKey), "hex");
  return encrypt(keyBuffer, JSON.stringify(payload));
};

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

/**
 * Encrypt a payload whose JSON string is exactly `targetLen` bytes,
 * producing a block-aligned plaintext (multiple of 16 bytes).
 * PKCS7 will add a full 16-byte padding block — this is the Node 24 edge case.
 */
const encryptBlockAlignedPayload = (
  apiKey: string,
  basePayload: Record<string, string>,
  targetLen: number
): string => {
  const padded = padPayload(basePayload, targetLen);
  const paddedJson = JSON.stringify(padded);
  const paddedLen = Buffer.byteLength(paddedJson, "utf8");
  if (paddedLen % 16 !== 0) {
    throw new Error(`Padded JSON is ${paddedLen} bytes, not a multiple of 16`);
  }
  const keyBuffer = Buffer.from(deriveEncryptionKey(apiKey), "hex");
  return encrypt(keyBuffer, paddedJson);
};

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
export const BLOCK_ALIGNED_TOKEN = encryptBlockAlignedPayload(
  TEST_API_KEY,
  blockAlignedBase,
  128
);

// Export the padded workspace ID so tests can verify the decrypted payload
const blockAlignedJson = JSON.stringify(blockAlignedBase);
const blockAlignedPadding = "x".repeat(
  128 - Buffer.byteLength(blockAlignedJson, "utf8")
);
export const BLOCK_ALIGNED_WORKSPACE_ID =
  TEST_WORKSPACE_ID + blockAlignedPadding;
