import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { PriceResponseSchema, PricesResponseSchema } from "./schema";
import type { Price, PricesResponse } from "./schema";

export interface ListPricesArgs extends ListArgs {
  productId?: string;
}

export class PricesResource extends BaseResource {
  /** List prices with optional filters. */
  async list(args: ListPricesArgs = {}): Promise<PricesResponse> {
    const raw = await this.sdk.listPrices(args as never);
    return this.parse(PricesResponseSchema, raw);
  }

  /** Retrieve a single price by ID. */
  async retrieve(id: string): Promise<Price> {
    const raw = await this.sdk.retrievePrice({ id });
    return this.parse(PriceResponseSchema, raw);
  }

  /** Iterate over all prices, automatically paginating. Default limit per page: 500. */
  listAll(args: Omit<ListPricesArgs, "nextToken"> = {}): AsyncGenerator<Price> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
