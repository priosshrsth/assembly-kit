import { AssemblyInvalidTokenError } from "src/errors/invalid-token";
import { AssemblyNoTokenError } from "src/errors/no-token";
import { AssemblyUnauthorizedError } from "src/errors/unauthorized";
import type { TokenPayload } from "src/schemas/shared/token";

import { decrypt, validatePayload } from "./parse";

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
 * Decrypts and validates an Assembly token, exposing the payload and
 * convenience getters for identity checks and compound key building.
 *
 * @example
 * ```ts
 * const token = new AssemblyToken({ token: encryptedHex, apiKey });
 * token.workspaceId;   // always present
 * token.isClientUser;  // true if clientId + companyId present
 *
 * const key = token.buildCompoundKey({ apiKey });
 * ```
 *
 * @throws {AssemblyNoTokenError} If `token` is nullish or empty.
 * @throws {AssemblyInvalidTokenError} If decryption, JSON parsing, or schema validation fails.
 */
export class AssemblyToken {
  readonly payload: TokenPayload;

  constructor({ token, apiKey }: { token: unknown; apiKey: string }) {
    if (token === undefined || token === null || token === "") {
      throw new AssemblyNoTokenError();
    }

    if (typeof token !== "string") {
      throw new AssemblyInvalidTokenError({
        message: `Expected token to be a string, got ${typeof token}`,
      });
    }

    this.payload = validatePayload(decrypt({ apiKey, token }));
  }

  /** The workspace ID embedded in the token. Always present. */
  get workspaceId(): string {
    return this.payload.workspaceId;
  }

  /** The token ID, if present (used in marketplace compound keys). */
  get tokenId(): string | undefined {
    return this.payload.tokenId;
  }

  /** The API base URL override, if present. */
  get baseUrl(): string | undefined {
    return this.payload.baseUrl;
  }

  /** The client (portal user) ID, if present. */
  get clientId(): string | undefined {
    return this.payload.clientId;
  }

  /** The company ID associated with the client, if present. */
  get companyId(): string | undefined {
    return this.payload.companyId;
  }

  /** The internal (team member) user ID, if present. */
  get internalUserId(): string | undefined {
    return this.payload.internalUserId;
  }

  /** `true` when the token belongs to a client (portal) user. */
  get isClientUser(): boolean {
    return (
      this.payload.clientId !== undefined &&
      this.payload.companyId !== undefined
    );
  }

  /** `true` when the token belongs to an internal (team member) user. */
  get isInternalUser(): boolean {
    return this.payload.internalUserId !== undefined;
  }

  /**
   * Assert that the token belongs to a client user and return the narrowed payload.
   *
   * @returns {ClientTokenPayload} The payload narrowed to `ClientTokenPayload`.
   * @throws {AssemblyUnauthorizedError} If the token does not represent a client user.
   */
  ensureIsClient(): ClientTokenPayload {
    if (!this.isClientUser) {
      throw new AssemblyUnauthorizedError({
        message:
          "This operation requires a client token (clientId + companyId), but the token does not contain client fields",
      });
    }
    return this.payload as ClientTokenPayload;
  }

  /**
   * Assert that the token belongs to an internal (team member) user and return the narrowed payload.
   *
   * @returns {InternalUserTokenPayload} The payload narrowed to `InternalUserTokenPayload`.
   * @throws {AssemblyUnauthorizedError} If the token does not represent an internal user.
   */
  ensureIsInternalUser(): InternalUserTokenPayload {
    if (!this.isInternalUser) {
      throw new AssemblyUnauthorizedError({
        message:
          "This operation requires an internal user token (internalUserId), but the token does not contain an internalUserId",
      });
    }
    return this.payload as InternalUserTokenPayload;
  }

  /**
   * Build the compound API key sent in the `X-API-Key` header.
   *
   * - With `tokenId`: `{workspaceId}/{apiKey}/{tokenId}`
   * - Without `tokenId`: `{workspaceId}/{apiKey}`
   */
  buildCompoundKey({ apiKey }: { apiKey: string }): string {
    if (this.payload.tokenId) {
      return `${this.payload.workspaceId}/${apiKey}/${this.payload.tokenId}`;
    }
    return `${this.payload.workspaceId}/${apiKey}`;
  }
}
