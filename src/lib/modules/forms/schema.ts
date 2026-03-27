import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface Form {
  createdAt: string;
  id: string;
  latestSubmissionDate?: string | null;
  name?: string;
  object: "form";
  updatedAt: string;
}

export const FormSchema: z.ZodType<Form> = z.object({
  createdAt: z.iso.datetime(),
  id: z.string(),
  latestSubmissionDate: z.string().nullable().optional(),
  name: z.string().optional(),
  object: z.literal("form"),
  updatedAt: z.iso.datetime(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const FormDataResponseSchema: z.ZodType<Form> = FormSchema;
export type FormDataResponse = Form;

export interface FormsDataResponse {
  data: Form[] | null;
  nextToken?: string;
}

export const FormsDataResponseSchema: z.ZodType<FormsDataResponse> = z.object({
  data: z.array(FormSchema).nullable(),
  nextToken: z.string().optional(),
});
