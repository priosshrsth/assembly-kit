import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { SubscriptionResponseSchema, SubscriptionsResponseSchema } from "./schema";
import type { Subscription, SubscriptionCreateRequest, SubscriptionsResponse } from "./schema";

export interface ListSubscriptionsArgs extends ListArgs {
  clientId?: string;
  status?: string;
}

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

  /** Create a subscription. */
  async create(body: SubscriptionCreateRequest): Promise<Subscription> {
    const raw = await this.#transport.post<unknown>("v1/subscriptions", body);
    return parseResponse({
      schema: SubscriptionResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** List subscriptions with optional filters. */
  async list(args: ListSubscriptionsArgs = {}): Promise<SubscriptionsResponse> {
    const raw = await this.#transport.get<unknown>("v1/subscriptions", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: SubscriptionsResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single subscription by ID. */
  async retrieve(id: string): Promise<Subscription> {
    const raw = await this.#transport.get<unknown>(`v1/subscriptions/${id}`);
    return parseResponse({
      schema: SubscriptionResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Cancel a subscription. */
  async cancel(id: string): Promise<Subscription> {
    const raw = await this.#transport.post<unknown>(`v1/subscriptions/${id}/cancel`);
    return parseResponse({
      schema: SubscriptionResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all subscriptions, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListSubscriptionsArgs, "nextToken"> = {}): Promise<Subscription[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
