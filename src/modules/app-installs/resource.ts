import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { AppInstallsResponse } from "./schema";
import { AppInstallsResponseSchema } from "./schema";

export class AppInstallsResource {
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

  /** List app installs. */
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<AppInstallsResponse> {
    const raw = await this.#transport.get<unknown>("v1/app-installs", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: AppInstallsResponseSchema,
      validate: this.#validate,
    });
  }
}
