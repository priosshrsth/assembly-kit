import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import {
  SubscriptionResponseSchema,
  SubscriptionsResponseSchema,
} from "./schema";
import type {
  Subscription,
  SubscriptionCreateRequest,
  SubscriptionsResponse,
} from "./schema";

export interface ListSubscriptionsArgs extends ListArgs {
  clientId?: string;
  status?: string;
}

export class SubscriptionsResource extends BaseResource {
  /** Create a subscription. */
  async create(body: SubscriptionCreateRequest): Promise<Subscription> {
    const raw = await this.sdk.createSubscription({
      requestBody: body as never,
    });
    return this.parse(SubscriptionResponseSchema, raw);
  }

  /** List subscriptions with optional filters. */
  async list(args: ListSubscriptionsArgs = {}): Promise<SubscriptionsResponse> {
    const raw = await this.sdk.listSubscriptions(args as never);
    return this.parse(SubscriptionsResponseSchema, raw);
  }

  /** Retrieve a single subscription by ID. */
  async retrieve(id: string): Promise<Subscription> {
    const raw = await this.sdk.retrieveSubscription({ id });
    return this.parse(SubscriptionResponseSchema, raw);
  }

  /** Cancel a subscription. */
  async cancel(id: string): Promise<Subscription> {
    const raw = await this.sdk.cancelSubscription({ id });
    return this.parse(SubscriptionResponseSchema, raw);
  }

  /** Iterate over all subscriptions, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListSubscriptionsArgs, "nextToken"> = {}
  ): AsyncGenerator<Subscription> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
