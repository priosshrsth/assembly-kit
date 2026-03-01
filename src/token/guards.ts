import { AssemblyUnauthorizedError } from "src/errors/unauthorized";
import type { TokenPayload } from "src/schemas/base/token";

/** A token payload that identifies a client (portal) user. */
export interface ClientTokenPayload extends TokenPayload {
  clientId: string;
  companyId: string;
}

/** A token payload that identifies an internal (team member) user. */
export interface InternalUserTokenPayload extends TokenPayload {
  internalUserId: string;
}

/**
 * Type predicate that checks whether a token payload belongs to a client user.
 * Client tokens always have both `clientId` and `companyId`.
 */
export const isClientToken = (
  payload: TokenPayload
): payload is ClientTokenPayload =>
  payload.clientId !== undefined && payload.companyId !== undefined;

/**
 * Type predicate that checks whether a token payload belongs to an internal user.
 * Internal user tokens always have `internalUserId`.
 */
export const isInternalUserToken = (
  payload: TokenPayload
): payload is InternalUserTokenPayload => payload.internalUserId !== undefined;

/**
 * Assert that the token belongs to a client user and narrow the type.
 *
 * @param {TokenPayload} payload - The token payload to check.
 * @returns {ClientTokenPayload} The payload narrowed to `ClientTokenPayload`.
 * @throws {AssemblyUnauthorizedError} If the token does not represent a client user.
 */
export const ensureIsClient = (payload: TokenPayload): ClientTokenPayload => {
  if (!isClientToken(payload)) {
    throw new AssemblyUnauthorizedError({
      message:
        "This operation requires a client token (clientId + companyId), but the token does not contain client fields",
    });
  }
  return payload;
};

/**
 * Assert that the token belongs to an internal (team member) user and narrow the type.
 *
 * @param {TokenPayload} payload - The token payload to check.
 * @returns {InternalUserTokenPayload} The payload narrowed to `InternalUserTokenPayload`.
 * @throws {AssemblyUnauthorizedError} If the token does not represent an internal user.
 */
export const ensureIsInternalUser = (
  payload: TokenPayload
): InternalUserTokenPayload => {
  if (!isInternalUserToken(payload)) {
    throw new AssemblyUnauthorizedError({
      message:
        "This operation requires an internal user token (internalUserId), but the token does not contain an internalUserId",
    });
  }
  return payload;
};
