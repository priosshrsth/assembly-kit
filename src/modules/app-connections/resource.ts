import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  AppConnectionCreateRequest,
  AppConnectionResponse,
  AppConnectionsResponse,
} from "./schema";
import {
  AppConnectionResponseSchema,
  AppConnectionsResponseSchema,
} from "./schema";

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

  /** List app connections with optional filters. */
  async list(args?: {
    installId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<AppConnectionsResponse> {
    const raw = await this.#transport.get<unknown>("v1/app-connections", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: AppConnectionsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new app connection. */
  async create(
    body: AppConnectionCreateRequest
  ): Promise<AppConnectionResponse> {
    const raw = await this.#transport.post<unknown>("v1/app-connections", body);
    return parseResponse({
      data: raw,
      schema: AppConnectionResponseSchema,
      validate: this.#validate,
    });
  }
}
