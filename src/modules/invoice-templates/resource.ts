import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import { InvoiceTemplatesResponseSchema } from "./schema";
import type { InvoiceTemplate, InvoiceTemplatesResponse } from "./schema";

export class InvoiceTemplatesResource extends BaseResource {
  /** List invoice templates. */
  async list(args: ListArgs = {}): Promise<InvoiceTemplatesResponse> {
    const raw = await this.sdk.listInvoiceTemplates(args);
    return this.parse(InvoiceTemplatesResponseSchema, raw);
  }

  /** Iterate over all invoice templates, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListArgs, "nextToken"> = {}
  ): AsyncGenerator<InvoiceTemplate> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
