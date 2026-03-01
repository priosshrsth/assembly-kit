import type { MembershipType } from "src/schemas/base/membership-type";
import { MembershipTypeSchema } from "src/schemas/base/membership-type";
import { z } from "zod";

export interface MessageChannelCreateRequest {
  clientId?: string;
  companyId?: string;
  memberIds?: string[];
  membershipType: MembershipType;
}

export const MessageChannelCreateRequestSchema: z.ZodType<MessageChannelCreateRequest> =
  z.object({
    clientId: z.string().optional(),
    companyId: z.string().optional(),
    memberIds: z.array(z.string()).optional(),
    membershipType: MembershipTypeSchema,
  });
