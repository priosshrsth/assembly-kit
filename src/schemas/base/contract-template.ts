import { z } from "zod";

export interface ContractTemplate {
  createdAt: string;
  id: string;
  name?: string;
  object: "contractTemplate";
  updatedAt: string;
}

export const ContractTemplateSchema: z.ZodType<ContractTemplate> = z.object({
  createdAt: z.iso.datetime(),
  id: z.string(),
  name: z.string().optional(),
  object: z.literal("contractTemplate"),
  updatedAt: z.iso.datetime(),
});
