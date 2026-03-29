import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { NotificationResponseSchema, NotificationsResponseSchema } from "./schema";
import type { Notification, NotificationCreateRequest, NotificationsResponse } from "./schema";

export class NotificationsResource {
  readonly #transport: Transport;
  readonly #validate: boolean;

  constructor({
    transport,
    validateResponses,
  }: {
    transport: Transport;
    validateResponses: boolean;
  }) {
    this.#transport = transport;
    this.#validate = validateResponses;
  }

  /** Create a new notification. */
  async create(body: NotificationCreateRequest): Promise<Notification> {
    const raw = await this.#transport.post<unknown>("v1/notifications", body);
    return parseResponse({
      schema: NotificationResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** List notifications. */
  async list(): Promise<NotificationsResponse> {
    const raw = await this.#transport.get<unknown>("v1/notifications", {
      searchParams: buildSearchParams(),
    });
    return parseResponse({
      schema: NotificationsResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Delete a notification by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/notifications/${id}`);
  }

  /** Mark a notification as read. */
  async markRead(id: string): Promise<Notification> {
    const raw = await this.#transport.post<unknown>(`v1/notifications/${id}/read`);
    return parseResponse({
      schema: NotificationResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Mark a notification as unread. */
  async markUnread(id: string): Promise<Notification> {
    const raw = await this.#transport.post<unknown>(`v1/notifications/${id}/unread`);
    return parseResponse({
      schema: NotificationResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }
}
