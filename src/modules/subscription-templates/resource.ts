import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import { SubscriptionTemplatesResponseSchema } from "./schema";
import type {
  SubscriptionTemplate,
  SubscriptionTemplatesResponse,
} from "./schema";

export class SubscriptionTemplatesResource extends BaseResource {
  /** List subscription templates. */
  async list(args: ListArgs = {}): Promise<SubscriptionTemplatesResponse> {
    const raw = await this.sdk.listSubscriptionTemplates(args);
    return this.parse(SubscriptionTemplatesResponseSchema, raw);
  }

  /** Iterate over all subscription templates, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListArgs, "nextToken"> = {}
  ): AsyncGenerator<SubscriptionTemplate> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
