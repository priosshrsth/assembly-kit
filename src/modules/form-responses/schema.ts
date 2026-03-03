import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface FormResponse {
  clientId?: string;
  companyId?: string;
  createdAt: string;
  formId?: string;
  id: string;
  object: "formResponse";
  status?: string;
  updatedAt: string;
}

export const FormResponseSchema: z.ZodType<FormResponse> = z.object({
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  createdAt: z.iso.datetime(),
  formId: z.string().optional(),
  id: z.string(),
  object: z.literal("formResponse"),
  status: z.string().optional(),
  updatedAt: z.iso.datetime(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const FormResponseItemResponseSchema: z.ZodType<FormResponse> =
  FormResponseSchema;
export type FormResponseItemResponse = FormResponse;

export interface FormResponsesResponse {
  data: FormResponse[] | null;
}

export const FormResponsesResponseSchema: z.ZodType<FormResponsesResponse> =
  z.object({
    data: z.array(FormResponseSchema).nullable(),
  });

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface FormResponseCreateRequest {
  clientId: string;
  companyId?: string;
  formId: string;
}

export const FormResponseCreateRequestSchema: z.ZodType<FormResponseCreateRequest> =
  z.object({
    clientId: z.string(),
    companyId: z.string().optional(),
    formId: z.string(),
  });
