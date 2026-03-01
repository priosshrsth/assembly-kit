import { z } from "zod";

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
