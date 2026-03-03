import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  SubscriptionCreateRequest,
  SubscriptionResponse,
  SubscriptionsResponse,
} from "./schema";
import {
  SubscriptionResponseSchema,
  SubscriptionsResponseSchema,
} from "./schema";

export class SubscriptionsResource {
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

  /** List subscriptions with optional filters. */
  async list(args?: {
    clientId?: string;
    companyId?: string;
    status?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<SubscriptionsResponse> {
    const raw = await this.#transport.get<unknown>("v1/subscriptions", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: SubscriptionsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single subscription by ID. */
  async get(id: string): Promise<SubscriptionResponse> {
    const raw = await this.#transport.get<unknown>(`v1/subscriptions/${id}`);
    return parseResponse({
      data: raw,
      schema: SubscriptionResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new subscription. */
  async create(body: SubscriptionCreateRequest): Promise<SubscriptionResponse> {
    const raw = await this.#transport.post<unknown>("v1/subscriptions", body);
    return parseResponse({
      data: raw,
      schema: SubscriptionResponseSchema,
      validate: this.#validate,
    });
  }

  /** Cancel a subscription by ID. */
  async cancel(id: string): Promise<SubscriptionResponse> {
    const raw = await this.#transport.post<unknown>(
      `v1/subscriptions/${id}/cancel`
    );
    return parseResponse({
      data: raw,
      schema: SubscriptionResponseSchema,
      validate: this.#validate,
    });
  }
}
