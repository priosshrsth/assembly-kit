import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { SubscriptionTemplatesResponse } from "./schema";
import { SubscriptionTemplatesResponseSchema } from "./schema";

export class SubscriptionTemplatesResource {
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

  /** List subscription templates. */
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<SubscriptionTemplatesResponse> {
    const raw = await this.#transport.get<unknown>(
      "v1/subscription-templates",
      { searchParams: buildSearchParams(args) }
    );
    return parseResponse({
      data: raw,
      schema: SubscriptionTemplatesResponseSchema,
      validate: this.#validate,
    });
  }
}
