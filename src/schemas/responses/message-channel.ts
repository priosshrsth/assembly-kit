import { MessageChannelSchema } from "src/schemas/base/message-channel";
import type { MessageChannel } from "src/schemas/base/message-channel";
import { z } from "zod";

export { MessageChannelSchema as MessageChannelResponseSchema };
export type { MessageChannel as MessageChannelResponse };

export interface MessageChannelsResponse {
  data: MessageChannel[] | null;
}

export const MessageChannelsResponseSchema: z.ZodType<MessageChannelsResponse> =
  z.object({
    data: z.array(MessageChannelSchema).nullable(),
  });
