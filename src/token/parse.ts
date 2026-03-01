import { AssemblyInvalidTokenError } from "src/errors/invalid-token";
import { AssemblyNoTokenError } from "src/errors/no-token";
import type { TokenPayload } from "src/schemas/base/token";
import { TokenPayloadSchema } from "src/schemas/base/token";

import { decryptTokenString, encryptTokenString } from "./crypto";

/** Decrypt the token string, wrapping errors as AssemblyInvalidTokenError. */
const decrypt = ({
  apiKey,
  token,
}: {
  apiKey: string;
  token: string;
}): string => {
  try {
    return decryptTokenString({ apiKey, encryptedToken: token });
  } catch (error) {
    throw new AssemblyInvalidTokenError({
      cause: error,
      message:
        "Failed to decrypt token — verify the API key and token are correct",
    });
  }
};

/** Parse + validate decrypted JSON against TokenPayloadSchema. */
const validatePayload = (decrypted: string): TokenPayload => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decrypted);
  } catch (error) {
    throw new AssemblyInvalidTokenError({
      cause: error,
      message: "Decrypted token is not valid JSON",
    });
  }

  const result = TokenPayloadSchema.safeParse(parsed);
  if (!result.success) {
    throw new AssemblyInvalidTokenError({
      cause: result.error,
      message: "Token payload failed schema validation",
    });
  }

  return result.data;
};

/**
 * Decrypt and validate an Assembly token.
 *
 * The token is a hex-encoded AES-128-CBC encrypted JSON string produced by the
 * Assembly backend. It is decrypted using the API key (HMAC-SHA256 key derivation)
 * and validated against `TokenPayloadSchema`.
 *
 * @param {object} options - Token decryption options.
 * @param {unknown} options.token - The encrypted token string (hex-encoded). Nullish or empty values throw.
 * @param {string} options.apiKey - The workspace/app API key used to derive the decryption key.
 * @returns {TokenPayload} The validated token payload.
 * @throws {AssemblyNoTokenError} If `token` is nullish or empty.
 * @throws {AssemblyInvalidTokenError} If decryption, JSON parsing, or schema validation fails.
 */
export const parseToken = ({
  token,
  apiKey,
}: {
  token: unknown;
  apiKey: string;
}): TokenPayload => {
  if (token === undefined || token === null || token === "") {
    throw new AssemblyNoTokenError();
  }

  if (typeof token !== "string") {
    throw new AssemblyInvalidTokenError({
      message: `Expected token to be a string, got ${typeof token}`,
    });
  }

  return validatePayload(decrypt({ apiKey, token }));
};

/**
 * Encrypt a token payload into a hex-encoded AES-128-CBC token string.
 *
 * This is the inverse of `parseToken`. The payload is validated against
 * `TokenPayloadSchema`, serialized to JSON, and encrypted using the API key
 * with the same HMAC-SHA256 key derivation and AES-128-CBC cipher.
 *
 * @param {object} options - Token creation options.
 * @param {TokenPayload} options.payload - The token payload to encrypt.
 * @param {string} options.apiKey - The workspace/app API key used to derive the encryption key.
 * @returns {string} The hex-encoded encrypted token string.
 * @throws {AssemblyInvalidTokenError} If the payload fails schema validation.
 */
export const createToken = ({
  payload,
  apiKey,
}: {
  payload: TokenPayload;
  apiKey: string;
}): string => {
  const result = TokenPayloadSchema.safeParse(payload);
  if (!result.success) {
    throw new AssemblyInvalidTokenError({
      cause: result.error,
      message: "Token payload failed schema validation",
    });
  }

  return encryptTokenString({
    apiKey,
    plaintext: JSON.stringify(result.data),
  });
};

/**
 * Build the compound API key sent in the `X-API-Key` header.
 *
 * - With `tokenId`: `{workspaceId}/{apiKey}/{tokenId}`
 * - Without `tokenId`: `{workspaceId}/{apiKey}`
 *
 * @param {object} options - Compound key options.
 * @param {string} options.apiKey - The workspace/app API key.
 * @param {TokenPayload} options.payload - The decoded token payload.
 * @returns {string} The compound key string.
 */
export const buildCompoundKey = ({
  apiKey,
  payload,
}: {
  apiKey: string;
  payload: TokenPayload;
}): string => {
  if (payload.tokenId) {
    return `${payload.workspaceId}/${apiKey}/${payload.tokenId}`;
  }
  return `${payload.workspaceId}/${apiKey}`;
};
