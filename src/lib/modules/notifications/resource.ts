import { BaseResource } from "src/client/base-resource";

import { NotificationResponseSchema, NotificationsResponseSchema } from "./schema";
import type { Notification, NotificationCreateRequest, NotificationsResponse } from "./schema";

export class NotificationsResource extends BaseResource {
  /** Create a new notification. */
  async create(body: NotificationCreateRequest): Promise<Notification> {
    const raw = await this.sdk.createNotification({ requestBody: body });
    return this.parse(NotificationResponseSchema, raw);
  }

  /** List notifications. */
  async list(): Promise<NotificationsResponse> {
    const raw = await this.sdk.listNotifications({});
    return this.parse(NotificationsResponseSchema, raw);
  }

  /** Delete a notification by ID. */
  async delete(id: string): Promise<void> {
    await this.sdk.deleteNotification({ id });
  }

  /** Mark a notification as read. */
  async markRead(id: string): Promise<Notification> {
    const raw = await this.sdk.markNotificationRead({ id });
    return this.parse(NotificationResponseSchema, raw);
  }

  /** Mark a notification as unread. */
  async markUnread(id: string): Promise<Notification> {
    const raw = await this.sdk.markNotificationUnread({ id });
    return this.parse(NotificationResponseSchema, raw);
  }
}
