import { z } from "zod";

export interface NotificationCreateRequest {
  deliveryTargets: {
    email?: {
      body?: string;
      subject?: string;
    };
    inProduct: {
      body: string;
      title: string;
    };
  };
  recipientId: string;
  senderId: string;
}

export const NotificationCreateRequestSchema: z.ZodType<NotificationCreateRequest> =
  z.object({
    deliveryTargets: z.object({
      email: z
        .object({
          body: z.string().optional(),
          subject: z.string().optional(),
        })
        .optional(),
      inProduct: z.object({
        body: z.string(),
        title: z.string(),
      }),
    }),
    recipientId: z.string(),
    senderId: z.string(),
  });
