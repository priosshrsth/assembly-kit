import { buildSearchParams } from "src/client/build-search-params";
import { parseResponse } from "src/client/parse-response";
import type { NotificationCreateRequest } from "src/schemas/requests/notification";
import type {
  NotificationResponse,
  NotificationsResponse,
} from "src/schemas/responses/notification";
import {
  NotificationResponseSchema,
  NotificationsResponseSchema,
} from "src/schemas/responses/notification";
import type { Transport } from "src/transport/http";

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
}
