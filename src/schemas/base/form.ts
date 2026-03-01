import { z } from "zod";

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
