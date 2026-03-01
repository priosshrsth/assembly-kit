import { NotificationSchema } from "src/schemas/base/notification";
import type { Notification } from "src/schemas/base/notification";
import { z } from "zod";

export { NotificationSchema as NotificationResponseSchema };
export type { Notification as NotificationResponse };

export interface NotificationsResponse {
  data: Notification[] | null;
}

export const NotificationsResponseSchema: z.ZodType<NotificationsResponse> =
  z.object({
    data: z.array(NotificationSchema).nullable(),
  });
