import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { PriceResponse, PricesResponse } from "./schema";
import { PriceResponseSchema, PricesResponseSchema } from "./schema";

export class PricesResource {
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

  /** List prices. */
  async list(args?: {
    productId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<PricesResponse> {
    const raw = await this.#transport.get<unknown>("v1/prices", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: PricesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single price by ID. */
  async get(id: string): Promise<PriceResponse> {
    const raw = await this.#transport.get<unknown>(`v1/prices/${id}`);
    return parseResponse({
      data: raw,
      schema: PriceResponseSchema,
      validate: this.#validate,
    });
  }
}
