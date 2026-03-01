import { z } from "zod";

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
