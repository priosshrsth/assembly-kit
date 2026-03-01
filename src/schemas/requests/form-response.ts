import { z } from "zod";

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
