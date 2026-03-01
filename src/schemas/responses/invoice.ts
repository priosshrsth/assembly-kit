import { InvoiceSchema } from "src/schemas/base/invoice";
import type { Invoice } from "src/schemas/base/invoice";
import { z } from "zod";

export { InvoiceSchema as InvoiceResponseSchema };
export type { Invoice as InvoiceResponse };

export interface InvoicesResponse {
  data: Invoice[] | null;
}

export const InvoicesResponseSchema: z.ZodType<InvoicesResponse> = z.object({
  data: z.array(InvoiceSchema).nullable(),
});
