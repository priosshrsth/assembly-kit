import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { InvoiceTemplatesResponseSchema } from "./schema";
import type { InvoiceTemplate, InvoiceTemplatesResponse } from "./schema";

export class InvoiceTemplatesResource {
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

  /** List invoice templates. */
  async list(args: ListArgs = {}): Promise<InvoiceTemplatesResponse> {
    const raw = await this.#transport.get<unknown>("v1/invoice-templates", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: InvoiceTemplatesResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all invoice templates, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<InvoiceTemplate[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
