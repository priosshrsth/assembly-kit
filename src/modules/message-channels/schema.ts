import { MembershipTypeSchema } from "src/schemas/shared/membership-type";
import type { MembershipType } from "src/schemas/shared/membership-type";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const MessageChannelResponseSchema: z.ZodType<MessageChannel> =
  MessageChannelSchema;
export type MessageChannelResponse = MessageChannel;

export interface MessageChannelsResponse {
  data: MessageChannel[] | null;
}

export const MessageChannelsResponseSchema: z.ZodType<MessageChannelsResponse> =
  z.object({
    data: z.array(MessageChannelSchema).nullable(),
  });

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

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
