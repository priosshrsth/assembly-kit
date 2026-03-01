import { z } from "zod";

export interface InvoiceLineItemRequest {
  amount: number;
  description: string;
  priceId: string;
  productId: string;
  quantity: number;
}

export const InvoiceLineItemRequestSchema: z.ZodType<InvoiceLineItemRequest> =
  z.object({
    amount: z.number(),
    description: z.string(),
    priceId: z.string(),
    productId: z.string(),
    quantity: z.number(),
  });

export interface InvoicePaymentMethodPreferenceRequest {
  feePaidByClient?: boolean;
  type: string;
}

export const InvoicePaymentMethodPreferenceRequestSchema: z.ZodType<InvoicePaymentMethodPreferenceRequest> =
  z.object({
    feePaidByClient: z.boolean().optional(),
    type: z.string(),
  });

export interface InvoiceCreateRequest {
  clientId: string;
  companyId?: string;
  currency?: string;
  dueDate?: string;
  lineItems: InvoiceLineItemRequest[];
  memo?: string;
  paymentMethodPreferences?: InvoicePaymentMethodPreferenceRequest[];
}

export const InvoiceCreateRequestSchema: z.ZodType<InvoiceCreateRequest> =
  z.object({
    clientId: z.string(),
    companyId: z.string().optional(),
    currency: z.string().optional(),
    dueDate: z.string().optional(),
    lineItems: z.array(InvoiceLineItemRequestSchema),
    memo: z.string().optional(),
    paymentMethodPreferences: z
      .array(InvoicePaymentMethodPreferenceRequestSchema)
      .optional(),
  });
