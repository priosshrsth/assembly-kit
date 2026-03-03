import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const PriceResponseSchema: z.ZodType<Price> = PriceSchema;
export type PriceResponse = Price;

export interface PricesResponse {
  data: Price[] | null;
}

export const PricesResponseSchema: z.ZodType<PricesResponse> = z.object({
  data: z.array(PriceSchema).nullable(),
});
