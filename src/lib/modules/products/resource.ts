import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { ProductResponseSchema, ProductsResponseSchema } from "./schema";
import type { Product, ProductsResponse } from "./schema";

export class ProductsResource {
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

  /** List products. */
  async list(args: ListArgs = {}): Promise<ProductsResponse> {
    const raw: unknown = await this.#transport.get("v1/products", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: ProductsResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single product by ID. */
  async retrieve(id: string): Promise<Product> {
    const raw: unknown = await this.#transport.get(`v1/products/${id}`);
    return parseResponse({ schema: ProductResponseSchema, data: raw, validate: this.#validate });
  }

  /** Iterate over all products, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<Product[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
