import type { MembershipType } from "src/schemas/base/membership-type";
import { MembershipTypeSchema } from "src/schemas/base/membership-type";
import { z } from "zod";

export interface FileChannelCreateRequest {
  clientId?: string;
  companyId?: string;
  membershipType: MembershipType;
}

export const FileChannelCreateRequestSchema: z.ZodType<FileChannelCreateRequest> =
  z.object({
    clientId: z.string().optional(),
    companyId: z.string().optional(),
    membershipType: MembershipTypeSchema,
  });
