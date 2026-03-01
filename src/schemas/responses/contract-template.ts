import { ContractTemplateSchema } from "src/schemas/base/contract-template";
import type { ContractTemplate } from "src/schemas/base/contract-template";
import { z } from "zod";

export { ContractTemplateSchema as ContractTemplateResponseSchema };
export type { ContractTemplate as ContractTemplateResponse };

export interface ContractTemplatesResponse {
  data: ContractTemplate[] | null;
}

export const ContractTemplatesResponseSchema: z.ZodType<ContractTemplatesResponse> =
  z.object({
    data: z.array(ContractTemplateSchema).nullable(),
  });
