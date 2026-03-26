import { AssemblyInvalidTokenError } from "src/errors/invalid-token";
import type { TokenPayload } from "src/schemas/shared/token";
import { TokenPayloadSchema } from "src/schemas/shared/token";

import { decryptTokenString, encryptTokenString } from "./crypto";

/** Decrypt the token string, wrapping errors as AssemblyInvalidTokenError. */
export const decrypt = ({
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
export const validatePayload = (decrypted: string): TokenPayload => {
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
 * Encrypt a token payload into a hex-encoded AES-128-CBC token string.
 *
 * The payload is validated against `TokenPayloadSchema`, serialized to JSON,
 * and encrypted using the API key with HMAC-SHA256 key derivation and AES-128-CBC.
 *
 * @param options.payload - The token payload to encrypt.
 * @param options.apiKey - The workspace/app API key used to derive the encryption key.
 * @returns The hex-encoded encrypted token string.
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
