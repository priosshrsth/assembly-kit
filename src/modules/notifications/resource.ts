import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  NotificationCreateRequest,
  NotificationResponse,
  NotificationsResponse,
} from "./schema";
import {
  NotificationResponseSchema,
  NotificationsResponseSchema,
} from "./schema";

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

  /** List notifications with optional filters. */
  async list(args?: {
    recipientId?: string;
    includeRead?: boolean;
    recipientClientId?: string;
    recipientInternalUserId?: string;
  }): Promise<NotificationsResponse> {
    const raw = await this.#transport.get<unknown>("v1/notifications", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: NotificationsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new notification. */
  async create(body: NotificationCreateRequest): Promise<NotificationResponse> {
    const raw = await this.#transport.post<unknown>("v1/notifications", body);
    return parseResponse({
      data: raw,
      schema: NotificationResponseSchema,
      validate: this.#validate,
    });
  }

  /** Delete a notification by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/notifications/${id}`);
  }

  /** Mark a notification as read. */
  async markRead(id: string): Promise<void> {
    await this.#transport.post(`v1/notifications/${id}/read`);
  }

  /** Mark a notification as unread. */
  async markUnread(id: string): Promise<void> {
    await this.#transport.post(`v1/notifications/${id}/unread`);
  }
}
