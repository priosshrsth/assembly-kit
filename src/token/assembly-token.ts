import { AsyncLocalStorage } from "node:async_hooks";

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
 * Decrypts and validates an Assembly token, exposing the payload with
 * convenience getters for identity checks and compound key building.
 *
 * Use `AssemblyToken.run()` to store a request-scoped instance via
 * `AsyncLocalStorage`, then retrieve it anywhere with `AssemblyToken.current()`.
 * This is safe for Vercel fluid compute — no shared state across requests.
 *
 * @example
 * ```ts
 * // Request-scoped (recommended for serverless)
 * const t = AssemblyToken.new({ token: encryptedHex, apiKey });
 * const same = AssemblyToken.new({ token: encryptedHex, apiKey }); // returns the same instance
 *
 * // Direct instantiation (always creates a new instance)
 * const token = new AssemblyToken({ token: encryptedHex, apiKey });
 * ```
 *
 * @throws {AssemblyNoTokenError} If `token` is nullish or empty.
 * @throws {AssemblyInvalidTokenError} If decryption, JSON parsing, or schema validation fails.
 */
export class AssemblyToken {
  static readonly #store: AsyncLocalStorage<AssemblyToken> = new AsyncLocalStorage<AssemblyToken>();

  readonly currentToken: string;
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

    this.currentToken = token;
    this.payload = validatePayload(decrypt({ apiKey, token }));
  }

  /**
   * Get or create a request-scoped `AssemblyToken` instance via `AsyncLocalStorage`.
   * Returns the existing instance if one exists with the same token. If the token
   * differs, a new instance is created and replaces the previous one.
   *
   * @returns The `AssemblyToken` instance for the current async context.
   */
  static new(options: { token: unknown; apiKey: string }): AssemblyToken {
    const existing = AssemblyToken.#store.getStore();
    if (existing && existing.currentToken === options.token) {
      return existing;
    }
    const instance = new AssemblyToken(options);
    AssemblyToken.#store.enterWith(instance);
    return instance;
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
    return this.payload.clientId !== undefined && this.payload.companyId !== undefined;
  }

  /** `true` when the token belongs to an internal (team member) user. */
  get isInternalUser(): boolean {
    return this.payload.internalUserId !== undefined;
  }

  /**
   * Assert that the token belongs to a client user and return the narrowed payload.
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
