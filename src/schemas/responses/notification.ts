import { z } from "zod";

interface NotificationItem {
  event: string;
  id: string;
  recipientClientId: string;
  recipientCompanyId?: string | null;
}

export interface NotificationsResponse {
  data: NotificationItem[];
}

export const NotificationsResponseSchema: z.ZodType<NotificationsResponse> =
  z.object({
    data: z
      .object({
        event: z.string(),
        id: z.string(),
        recipientClientId: z.uuid(),
        recipientCompanyId: z.uuid().nullish(),
      })
      .array(),
  });
