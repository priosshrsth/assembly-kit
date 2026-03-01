import { z } from "zod";

export interface InProductDeliveryTarget {
  body: string;
  title: string;
}

export const InProductDeliveryTargetSchema: z.ZodType<InProductDeliveryTarget> =
  z.object({
    body: z.string(),
    title: z.string(),
  });

export interface EmailDeliveryTarget {
  body: string;
  subject: string;
}

export const EmailDeliveryTargetSchema: z.ZodType<EmailDeliveryTarget> =
  z.object({
    body: z.string(),
    subject: z.string(),
  });

export interface NotificationDeliveryTargets {
  email?: EmailDeliveryTarget;
  inProduct?: InProductDeliveryTarget;
}

export const NotificationDeliveryTargetsSchema: z.ZodType<NotificationDeliveryTargets> =
  z.object({
    email: EmailDeliveryTargetSchema.optional(),
    inProduct: InProductDeliveryTargetSchema.optional(),
  });

export interface Notification {
  createdAt: string;
  deliveryTargets?: NotificationDeliveryTargets;
  id: string;
  isRead?: boolean;
  object: "notification";
  recipientId?: string;
  senderId?: string;
}

export const NotificationSchema: z.ZodType<Notification> = z.object({
  createdAt: z.iso.datetime(),
  deliveryTargets: NotificationDeliveryTargetsSchema.optional(),
  id: z.string(),
  isRead: z.boolean().optional(),
  object: z.literal("notification"),
  recipientId: z.string().optional(),
  senderId: z.string().optional(),
});
