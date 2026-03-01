import { ProductSchema } from "src/schemas/base/product";
import type { Product } from "src/schemas/base/product";
import { z } from "zod";

export { ProductSchema as ProductResponseSchema };
export type { Product as ProductResponse };

export interface ProductsResponse {
  data: Product[] | null;
}

export const ProductsResponseSchema: z.ZodType<ProductsResponse> = z.object({
  data: z.array(ProductSchema).nullable(),
});
