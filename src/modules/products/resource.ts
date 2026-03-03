import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { ProductResponse, ProductsResponse } from "./schema";
import { ProductResponseSchema, ProductsResponseSchema } from "./schema";

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
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<ProductsResponse> {
    const raw = await this.#transport.get<unknown>("v1/products", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: ProductsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single product by ID. */
  async get(id: string): Promise<ProductResponse> {
    const raw = await this.#transport.get<unknown>(`v1/products/${id}`);
    return parseResponse({
      data: raw,
      schema: ProductResponseSchema,
      validate: this.#validate,
    });
  }
}
