import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { InternalUserResponseSchema, InternalUsersResponseSchema } from "./schema";
import type { InternalUser, InternalUsersResponse } from "./schema";

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

  /** List internal users. */
  async list(args: ListArgs = {}): Promise<InternalUsersResponse> {
    const raw: unknown = await this.#transport.get("v1/internal-users", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: InternalUsersResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single internal user by ID. */
  async retrieve(id: string): Promise<InternalUser> {
    const raw: unknown = await this.#transport.get(`v1/internal-users/${id}`);
    return parseResponse({
      schema: InternalUserResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all internal users, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<InternalUser[]> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
