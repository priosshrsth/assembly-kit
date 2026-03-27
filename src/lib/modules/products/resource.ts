import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { ProductResponseSchema, ProductsResponseSchema } from "./schema";
import type { Product, ProductsResponse } from "./schema";

export class ProductsResource extends BaseResource {
  /** List products. */
  async list(args: ListArgs = {}): Promise<ProductsResponse> {
    const raw = await this.sdk.listProducts(args);
    return this.parse(ProductsResponseSchema, raw);
  }

  /** Retrieve a single product by ID. */
  async retrieve(id: string): Promise<Product> {
    const raw = await this.sdk.retrieveProduct({ id });
    return this.parse(ProductResponseSchema, raw);
  }

  /** Iterate over all products, automatically paginating. Default limit per page: 500. */
  listAll(args: Omit<ListArgs, "nextToken"> = {}): AsyncGenerator<Product> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
