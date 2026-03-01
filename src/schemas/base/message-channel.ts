import { z } from "zod";

import type { MembershipType } from "./membership-type";
import { MembershipTypeSchema } from "./membership-type";

export interface MessageChannel {
  clientId?: string | null;
  companyId?: string | null;
  createdAt: string;
  id: string;
  lastMessageDate?: string | null;
  memberIds?: string[];
  /** @deprecated Use `clientId`/`companyId` instead. */
  membershipEntityId?: string;
  membershipType: MembershipType;
  object: "messageChannel";
  updatedAt: string;
}

export const MessageChannelSchema: z.ZodType<MessageChannel> = z.object({
  clientId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  lastMessageDate: z.string().nullable().optional(),
  memberIds: z.array(z.string()).optional(),
  membershipEntityId: z.string().optional(),
  membershipType: MembershipTypeSchema,
  object: z.literal("messageChannel"),
  updatedAt: z.iso.datetime(),
});
