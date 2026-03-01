import { CompanySchema } from "src/schemas/base/company";
import type { Company } from "src/schemas/base/company";
import { z } from "zod";

export { CompanySchema as CompanyResponseSchema };
export type { Company as CompanyResponse };

export interface CompaniesResponse {
  data: Company[] | null;
}

export const CompaniesResponseSchema: z.ZodType<CompaniesResponse> = z.object({
  data: z.array(CompanySchema).nullable(),
});
