import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const PaymentResponseSchema: z.ZodType<Payment> = PaymentSchema;
export type PaymentResponse = Payment;

export interface PaymentsResponse {
  data: Payment[] | null;
  nextToken?: string;
}

export const PaymentsResponseSchema: z.ZodType<PaymentsResponse> = z.object({
  data: z.array(PaymentSchema).nullable(),
  nextToken: z.string().optional(),
});
