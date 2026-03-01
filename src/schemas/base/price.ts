import { z } from "zod";

export interface Price {
  amount?: number;
  currency?: string;
  id: string;
  interval?: string;
  object: "price";
  productId?: string;
}

export const PriceSchema: z.ZodType<Price> = z.object({
  amount: z.number().optional(),
  currency: z.string().optional(),
  id: z.string(),
  interval: z.string().optional(),
  object: z.literal("price"),
  productId: z.string().optional(),
});
