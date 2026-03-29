import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { AppConnectionResponseSchema, AppConnectionsResponseSchema } from "./schema";
import type { AppConnection, AppConnectionCreateRequest, AppConnectionsResponse } from "./schema";

export class AppConnectionsResource {
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

  /** List app connections for an install. */
  async list(args: {
    installId: string;
    clientId?: string;
    companyId?: string;
  }): Promise<AppConnectionsResponse> {
    const { installId, ...filters } = args;
    const raw: unknown = await this.#transport.get(`v1/installs/${installId}/connections`, {
      searchParams: buildSearchParams(filters),
    });
    return parseResponse({
      schema: AppConnectionsResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Create an app connection for a manual app install. */
  async create(args: {
    installId: string;
    body: AppConnectionCreateRequest;
  }): Promise<AppConnection> {
    const raw: unknown = await this.#transport.post(
      `v1/installs/${args.installId}/connections`,
      args.body,
    );
    return parseResponse({
      schema: AppConnectionResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }
}
