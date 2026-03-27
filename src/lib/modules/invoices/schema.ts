import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export type InvoiceStatus = "draft" | "open" | "paid" | "void";

export const InvoiceStatusSchema: z.ZodType<InvoiceStatus> = z.enum([
  "draft",
  "open",
  "paid",
  "void",
]);

export interface InvoiceLineItem {
  amount?: number;
  description?: string;
  priceId?: string;
  productId?: string;
  quantity?: number;
}

export const InvoiceLineItemSchema: z.ZodType<InvoiceLineItem> = z.object({
  amount: z.number().optional(),
  description: z.string().optional(),
  priceId: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().optional(),
});

export type PaymentMethodType = "bankAccount" | "creditCard";

export const PaymentMethodTypeSchema: z.ZodType<PaymentMethodType> = z.enum([
  "creditCard",
  "bankAccount",
]);

export interface PaymentMethodPreference {
  feePaidByClient?: boolean;
  type?: PaymentMethodType;
}

export const PaymentMethodPreferenceSchema: z.ZodType<PaymentMethodPreference> = z.object({
  feePaidByClient: z.boolean().optional(),
  type: PaymentMethodTypeSchema.optional(),
});

export interface Invoice {
  billingReason?: string;
  clientId?: string;
  collectionMethod?: string;
  companyId?: string;
  createdAt: string;
  currency?: string;
  dueDate?: string;
  fileUrl?: string;
  id: string;
  lineItems?: InvoiceLineItem[];
  memo?: string;
  number?: string;
  object: "invoice";
  paymentMethodPreferences?: PaymentMethodPreference[];
  paymentSuccessDate?: string | null;
  receiptNumber?: string;
  receiptUrl?: string;
  /** @deprecated Use `clientId`/`companyId` instead. */
  recipientId?: string;
  sentDate?: string;
  status?: InvoiceStatus;
  taxAmount?: number;
  taxPercentage?: number;
  total?: number;
  updatedAt: string;
}

export const InvoiceSchema: z.ZodType<Invoice> = z.object({
  billingReason: z.string().optional(),
  clientId: z.string().optional(),
  collectionMethod: z.string().optional(),
  companyId: z.string().optional(),
  createdAt: z.iso.datetime(),
  currency: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional(),
  id: z.string(),
  lineItems: z.array(InvoiceLineItemSchema).optional(),
  memo: z.string().optional(),
  number: z.string().optional(),
  object: z.literal("invoice"),
  paymentMethodPreferences: z.array(PaymentMethodPreferenceSchema).optional(),
  paymentSuccessDate: z.string().nullable().optional(),
  receiptNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  recipientId: z.string().optional(),
  sentDate: z.string().optional(),
  status: InvoiceStatusSchema.optional(),
  taxAmount: z.number().optional(),
  taxPercentage: z.number().optional(),
  total: z.number().optional(),
  updatedAt: z.iso.datetime(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const InvoiceResponseSchema: z.ZodType<Invoice> = InvoiceSchema;
export type InvoiceResponse = Invoice;

export interface InvoicesResponse {
  data: Invoice[] | null;
  nextToken?: string;
}

export const InvoicesResponseSchema: z.ZodType<InvoicesResponse> = z.object({
  data: z.array(InvoiceSchema).nullable(),
  nextToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface InvoiceLineItemRequest {
  amount: number;
  description: string;
  priceId: string;
  productId: string;
  quantity: number;
}

export const InvoiceLineItemRequestSchema: z.ZodType<InvoiceLineItemRequest> = z.object({
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

export const InvoiceCreateRequestSchema: z.ZodType<InvoiceCreateRequest> = z.object({
  clientId: z.string(),
  companyId: z.string().optional(),
  currency: z.string().optional(),
  dueDate: z.string().optional(),
  lineItems: z.array(InvoiceLineItemRequestSchema),
  memo: z.string().optional(),
  paymentMethodPreferences: z.array(InvoicePaymentMethodPreferenceRequestSchema).optional(),
});
