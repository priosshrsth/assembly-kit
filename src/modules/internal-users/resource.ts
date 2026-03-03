import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { InternalUserResponse, InternalUsersResponse } from "./schema";
import {
  InternalUserResponseSchema,
  InternalUsersResponseSchema,
} from "./schema";

export class InternalUsersResource {
  readonly #transport: Transport;
  readonly #validate: boolean;

  constructor({
    transport,
    validateResponses,
  }: {
    transport: Transport;
    validateResponses: boolean;
  }) {
    this.#transport = transport;
    this.#validate = validateResponses;
  }

  /** List internal users with optional pagination. */
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<InternalUsersResponse> {
    const raw = await this.#transport.get<unknown>("v1/internal-users", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: InternalUsersResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single internal user by ID. */
  async get(id: string): Promise<InternalUserResponse> {
    const raw = await this.#transport.get<unknown>(`v1/internal-users/${id}`);
    return parseResponse({
      data: raw,
      schema: InternalUserResponseSchema,
      validate: this.#validate,
    });
  }
}
