import { z } from "zod";

export interface ContractSendRequest {
  clientId: string;
  companyId?: string;
  contractTemplateId: string;
}

export const ContractSendRequestSchema: z.ZodType<ContractSendRequest> =
  z.object({
    clientId: z.string(),
    companyId: z.string().optional(),
    contractTemplateId: z.string(),
  });
