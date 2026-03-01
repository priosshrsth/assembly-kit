import { MessageSchema } from "src/schemas/base/message";
import type { Message } from "src/schemas/base/message";
import { z } from "zod";

export { MessageSchema as MessageResponseSchema };
export type { Message as MessageResponse };

export interface MessagesResponse {
  data: Message[] | null;
}

export const MessagesResponseSchema: z.ZodType<MessagesResponse> = z.object({
  data: z.array(MessageSchema).nullable(),
});
