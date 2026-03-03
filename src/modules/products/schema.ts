import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface Product {
  createdAt: string;
  description?: string;
  id: string;
  name?: string;
  object: "product";
  updatedAt: string;
}

export const ProductSchema: z.ZodType<Product> = z.object({
  createdAt: z.iso.datetime(),
  description: z.string().optional(),
  id: z.string(),
  name: z.string().optional(),
  object: z.literal("product"),
  updatedAt: z.iso.datetime(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const ProductResponseSchema: z.ZodType<Product> = ProductSchema;
export type ProductResponse = Product;

export interface ProductsResponse {
  data: Product[] | null;
}

export const ProductsResponseSchema: z.ZodType<ProductsResponse> = z.object({
  data: z.array(ProductSchema).nullable(),
});
