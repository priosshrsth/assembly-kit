import { createDecipheriv, createHmac } from "node:crypto";

/**
 * Derive a 128-bit AES decryption key from the API key using HMAC-SHA256.
 * Takes the first 32 hex characters (16 bytes) of the HMAC digest.
 */
export const deriveDecryptionKey = (apiKey: string): string =>
  createHmac("sha256", apiKey).digest("hex").slice(0, 32);

/** Strip PKCS7 padding from raw decrypted bytes. */
const stripPkcs7 = (raw: Buffer): Buffer => {
  const padLen = raw.at(-1);
  if (padLen === undefined || padLen < 1 || padLen > 16) {
    throw new Error(`Invalid PKCS7 padding byte: ${padLen}`);
  }

  for (let i = raw.length - padLen; i < raw.length; i += 1) {
    if (raw[i] !== padLen) {
      throw new Error(
        `Invalid PKCS7 padding at byte ${i}: expected ${padLen}, got ${raw[i]}`
      );
    }
  }

  return raw.subarray(0, raw.length - padLen);
};

interface CipherParts {
  keyBuffer: Buffer;
  iv: Buffer;
  ciphertext: Buffer;
}

/** Parse the hex-encoded token into key buffer, IV, and ciphertext. */
const parseEncryptedToken = ({
  apiKey,
  encryptedToken,
}: {
  apiKey: string;
  encryptedToken: string;
}): CipherParts => {
  const keyBuffer = Buffer.from(deriveDecryptionKey(apiKey), "hex");
  const blob = Buffer.from(encryptedToken, "hex");
  return { ciphertext: blob.subarray(16), iv: blob.subarray(0, 16), keyBuffer };
};

/** Decrypt with native autoPadding (works on Node 18/22 and most Bun versions). */
const decryptNative = ({ ciphertext, iv, keyBuffer }: CipherParts): string => {
  const decipher = createDecipheriv("aes-128-cbc", keyBuffer, iv);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
};

/**
 * Decrypt with manual PKCS7 strip (handles Node 24 OpenSSL 3.4/3.5 edge case).
 * If the runtime ignores setAutoPadding(false) and strips padding anyway
 * (some Bun versions), the result won't be block-aligned — return it as-is.
 */
const decryptManual = ({ ciphertext, iv, keyBuffer }: CipherParts): string => {
  const decipher = createDecipheriv("aes-128-cbc", keyBuffer, iv);
  decipher.setAutoPadding(false);
  const raw = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  // If length isn't a multiple of 16, the runtime already stripped padding
  if (raw.length % 16 !== 0) {
    return raw.toString("utf8");
  }

  return stripPkcs7(raw).toString("utf8");
};

/**
 * Decrypt an AES-128-CBC encrypted token string using the API key.
 *
 * The encrypted token is a hex-encoded binary blob where:
 * - First 16 bytes = IV (initialization vector)
 * - Remaining bytes = ciphertext
 *
 * Strategy: try native autoPadding first (works on most runtimes), then
 * fall back to manual PKCS7 strip with autoPadding disabled. This handles:
 * - Node 24 (OpenSSL 3.4/3.5) where autoPadding fails on block-aligned payloads
 * - Bun versions where setAutoPadding(false) may be silently ignored
 *
 * @throws {Error} If decryption fails on both paths
 */
export const decryptTokenString = ({
  apiKey,
  encryptedToken,
}: {
  apiKey: string;
  encryptedToken: string;
}): string => {
  const parts = parseEncryptedToken({ apiKey, encryptedToken });

  try {
    return decryptNative(parts);
  } catch {
    return decryptManual(parts);
  }
};
