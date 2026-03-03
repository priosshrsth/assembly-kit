import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface Message {
  channelId?: string;
  createdAt: string;
  id: string;
  isAttachmentIncluded?: boolean;
  object: "message";
  senderId?: string;
  text?: string;
  updatedAt: string;
}

export const MessageSchema: z.ZodType<Message> = z.object({
  channelId: z.string().optional(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  isAttachmentIncluded: z.boolean().optional(),
  object: z.literal("message"),
  senderId: z.string().optional(),
  text: z.string().optional(),
  updatedAt: z.iso.datetime(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const MessageResponseSchema: z.ZodType<Message> = MessageSchema;
export type MessageResponse = Message;

export interface MessagesResponse {
  data: Message[] | null;
}

export const MessagesResponseSchema: z.ZodType<MessagesResponse> = z.object({
  data: z.array(MessageSchema).nullable(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface SendMessageRequest {
  channelId: string;
  senderId: string;
  text: string;
}

export const SendMessageRequestSchema: z.ZodType<SendMessageRequest> = z.object(
  {
    channelId: z.string(),
    senderId: z.string(),
    text: z.string(),
  }
);
