import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface InvoiceTemplate {
  createdAt: string;
  id: string;
  name?: string;
  object: "invoiceTemplate";
  updatedAt?: string;
}

export const InvoiceTemplateSchema: z.ZodType<InvoiceTemplate> = z.object({
  createdAt: z.iso.datetime(),
  id: z.string(),
  name: z.string().optional(),
  object: z.literal("invoiceTemplate"),
  updatedAt: z.iso.datetime().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const InvoiceTemplateResponseSchema: z.ZodType<InvoiceTemplate> = InvoiceTemplateSchema;
export type InvoiceTemplateResponse = InvoiceTemplate;

export interface InvoiceTemplatesResponse {
  data: InvoiceTemplate[] | null;
  nextToken?: string;
}

export const InvoiceTemplatesResponseSchema: z.ZodType<InvoiceTemplatesResponse> = z.object({
  data: z.array(InvoiceTemplateSchema).nullable(),
  nextToken: z.string().optional(),
});
