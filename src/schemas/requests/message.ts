import { z } from "zod";

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
