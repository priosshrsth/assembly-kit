import { PriceSchema } from "src/schemas/base/price";
import type { Price } from "src/schemas/base/price";
import { z } from "zod";

export { PriceSchema as PriceResponseSchema };
export type { Price as PriceResponse };

export interface PricesResponse {
  data: Price[] | null;
}

export const PricesResponseSchema: z.ZodType<PricesResponse> = z.object({
  data: z.array(PriceSchema).nullable(),
});
