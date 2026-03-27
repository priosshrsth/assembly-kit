import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { InvoiceResponseSchema, InvoicesResponseSchema } from "./schema";
import type { Invoice, InvoiceCreateRequest, InvoicesResponse } from "./schema";

export interface ListInvoicesArgs extends ListArgs {
  clientId?: string;
  status?: string;
}

export class InvoicesResource extends BaseResource {
  /** Create an invoice. */
  async create(body: InvoiceCreateRequest): Promise<Invoice> {
    const raw = await this.sdk.createInvoice({ requestBody: body as never });
    return this.parse(InvoiceResponseSchema, raw);
  }

  /** List invoices with optional filters. */
  async list(args: ListInvoicesArgs = {}): Promise<InvoicesResponse> {
    const raw = await this.sdk.listInvoices(args);
    return this.parse(InvoicesResponseSchema, raw);
  }

  /** Retrieve a single invoice by ID. */
  async retrieve(id: string): Promise<Invoice> {
    const raw = await this.sdk.retrieveInvoice({ id });
    return this.parse(InvoiceResponseSchema, raw);
  }

  /** Iterate over all invoices, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListInvoicesArgs, "nextToken"> = {}): Promise<Invoice[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
