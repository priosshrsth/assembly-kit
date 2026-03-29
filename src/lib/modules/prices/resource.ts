import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { PriceResponseSchema, PricesResponseSchema } from "./schema";
import type { Price, PricesResponse } from "./schema";

export interface ListPricesArgs extends ListArgs {
  productId?: string;
}

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

  /** List prices with optional filters. */
  async list(args: ListPricesArgs = {}): Promise<PricesResponse> {
    const raw: unknown = await this.#transport.get("v1/prices", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: PricesResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single price by ID. */
  async retrieve(id: string): Promise<Price> {
    const raw: unknown = await this.#transport.get(`v1/prices/${id}`);
    return parseResponse({ schema: PriceResponseSchema, data: raw, validate: this.#validate });
  }

  /** Iterate over all prices, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListPricesArgs, "nextToken"> = {}): Promise<Price[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
