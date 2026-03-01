import { z } from "zod";

export interface Payment {
  amount?: number;
  createdAt: string;
  currency?: string;
  id: string;
  invoiceId?: string;
  object: "payment";
  status?: string;
}

export const PaymentSchema: z.ZodType<Payment> = z.object({
  amount: z.number().optional(),
  createdAt: z.iso.datetime(),
  currency: z.string().optional(),
  id: z.string(),
  invoiceId: z.string().optional(),
  object: z.literal("payment"),
  status: z.string().optional(),
});
