import { ContractSchema } from "src/schemas/base/contract";
import type { Contract } from "src/schemas/base/contract";
import { z } from "zod";

export { ContractSchema as ContractResponseSchema };
export type { Contract as ContractResponse };

export interface ContractsResponse {
  data: Contract[] | null;
}

export const ContractsResponseSchema: z.ZodType<ContractsResponse> = z.object({
  data: z.array(ContractSchema).nullable(),
});
