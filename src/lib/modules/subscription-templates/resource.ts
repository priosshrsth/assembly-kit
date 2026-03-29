import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { SubscriptionTemplatesResponseSchema } from "./schema";
import type { SubscriptionTemplate, SubscriptionTemplatesResponse } from "./schema";

export class SubscriptionTemplatesResource {
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

  /** List subscription templates. */
  async list(args: ListArgs = {}): Promise<SubscriptionTemplatesResponse> {
    const raw = await this.#transport.get<unknown>("v1/subscription-templates", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: SubscriptionTemplatesResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all subscription templates, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<SubscriptionTemplate[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
