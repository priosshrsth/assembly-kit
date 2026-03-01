import { z } from "zod";

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
