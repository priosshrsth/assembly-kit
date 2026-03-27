import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface ContractTemplate {
  createdAt: string;
  id: string;
  name?: string;
  object: "contractTemplate";
  updatedAt?: string;
}

export const ContractTemplateSchema: z.ZodType<ContractTemplate> = z.object({
  createdAt: z.iso.datetime(),
  id: z.string(),
  name: z.string().optional(),
  object: z.literal("contractTemplate"),
  updatedAt: z.iso.datetime().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const ContractTemplateResponseSchema: z.ZodType<ContractTemplate> = ContractTemplateSchema;
export type ContractTemplateResponse = ContractTemplate;

export interface ContractTemplatesResponse {
  data: ContractTemplate[] | null;
  nextToken?: string;
}

export const ContractTemplatesResponseSchema: z.ZodType<ContractTemplatesResponse> = z.object({
  data: z.array(ContractTemplateSchema).nullable(),
  nextToken: z.string().optional(),
});
