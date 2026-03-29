import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { InvoiceResponseSchema, InvoicesResponseSchema } from "./schema";
import type { Invoice, InvoiceCreateRequest, InvoicesResponse } from "./schema";

export interface ListInvoicesArgs extends ListArgs {
  clientId?: string;
  status?: string;
}

export class InvoicesResource {
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

  /** Create an invoice. */
  async create(body: InvoiceCreateRequest): Promise<Invoice> {
    const raw = await this.#transport.post<unknown>("v1/invoices", body);
    return parseResponse({ schema: InvoiceResponseSchema, data: raw, validate: this.#validate });
  }

  /** List invoices with optional filters. */
  async list(args: ListInvoicesArgs = {}): Promise<InvoicesResponse> {
    const raw = await this.#transport.get<unknown>("v1/invoices", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: InvoicesResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single invoice by ID. */
  async retrieve(id: string): Promise<Invoice> {
    const raw = await this.#transport.get<unknown>(`v1/invoices/${id}`);
    return parseResponse({ schema: InvoiceResponseSchema, data: raw, validate: this.#validate });
  }

  /** Iterate over all invoices, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListInvoicesArgs, "nextToken"> = {}): Promise<Invoice[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
