import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { InvoiceTemplatesResponseSchema } from "./schema";
import type { InvoiceTemplate, InvoiceTemplatesResponse } from "./schema";

export class InvoiceTemplatesResource extends BaseResource {
  /** List invoice templates. */
  async list(args: ListArgs = {}): Promise<InvoiceTemplatesResponse> {
    const raw = await this.sdk.listInvoiceTemplates(args);
    return this.parse(InvoiceTemplatesResponseSchema, raw);
  }

  /** Iterate over all invoice templates, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<InvoiceTemplate[]> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
