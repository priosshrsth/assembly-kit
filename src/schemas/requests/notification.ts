import { z } from "zod";

type NotificationSender = "client" | "internalUser";

const NotificationSenderSchema: z.ZodType<NotificationSender> = z.enum([
  "internalUser",
  "client",
]);

export interface NotificationRequestBody {
  deliveryTargets?: {
    inProduct?: {
      body?: string;
      title: string;
    };
  };
  recipientClientId?: string;
  recipientCompanyId?: string;
  recipientInternalUserId?: string;
  senderCompanyId?: string;
  senderId: string;
  senderType: NotificationSender;
}

export const NotificationRequestBodySchema: z.ZodType<NotificationRequestBody> =
  z.object({
    deliveryTargets: z
      .object({
        inProduct: z
          .object({
            body: z.string().optional(),
            title: z.string(),
          })
          .optional(),
      })
      .optional(),
    recipientClientId: z.string().optional(),
    recipientCompanyId: z.string().optional(),
    recipientInternalUserId: z.string().optional(),
    senderCompanyId: z.string().optional(),
    senderId: z.string(),
    senderType: NotificationSenderSchema,
  });
