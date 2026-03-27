import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface InProductDeliveryTarget {
  body: string;
  title: string;
}

export const InProductDeliveryTargetSchema: z.ZodType<InProductDeliveryTarget> = z.object({
  body: z.string(),
  title: z.string(),
});

export interface EmailDeliveryTarget {
  body: string;
  subject: string;
}

export const EmailDeliveryTargetSchema: z.ZodType<EmailDeliveryTarget> = z.object({
  body: z.string(),
  subject: z.string(),
});

export interface NotificationDeliveryTargets {
  email?: EmailDeliveryTarget;
  inProduct?: InProductDeliveryTarget;
}

export const NotificationDeliveryTargetsSchema: z.ZodType<NotificationDeliveryTargets> = z.object({
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

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const NotificationResponseSchema: z.ZodType<Notification> = NotificationSchema;
export type NotificationResponse = Notification;

export interface NotificationsResponse {
  data: Notification[] | null;
}

export const NotificationsResponseSchema: z.ZodType<NotificationsResponse> = z.object({
  data: z.array(NotificationSchema).nullable(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

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

export const NotificationCreateRequestSchema: z.ZodType<NotificationCreateRequest> = z.object({
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
