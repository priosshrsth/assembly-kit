import type { AppConnectionType } from "src/schemas/base/app-connection";
import { AppConnectionTypeSchema } from "src/schemas/base/app-connection";
import type { MembershipType } from "src/schemas/base/membership-type";
import { MembershipTypeSchema } from "src/schemas/base/membership-type";
import { z } from "zod";

export interface AppConnectionCreateRequest {
  clientIds?: string[];
  companyId?: string;
  content: string;
  installId: string;
  membershipType: MembershipType;
  type: AppConnectionType;
}

export const AppConnectionCreateRequestSchema: z.ZodType<AppConnectionCreateRequest> =
  z.object({
    clientIds: z.array(z.string()).optional(),
    companyId: z.string().optional(),
    content: z.string(),
    installId: z.string(),
    membershipType: MembershipTypeSchema,
    type: AppConnectionTypeSchema,
  });
