import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  InvoiceCreateRequest,
  InvoiceResponse,
  InvoicesResponse,
} from "./schema";
import { InvoiceResponseSchema, InvoicesResponseSchema } from "./schema";

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

  /** List invoices with optional filters. */
  async list(args?: {
    clientId?: string;
    companyId?: string;
    status?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<InvoicesResponse> {
    const raw = await this.#transport.get<unknown>("v1/invoices", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: InvoicesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single invoice by ID. */
  async get(id: string): Promise<InvoiceResponse> {
    const raw = await this.#transport.get<unknown>(`v1/invoices/${id}`);
    return parseResponse({
      data: raw,
      schema: InvoiceResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new invoice. */
  async create(body: InvoiceCreateRequest): Promise<InvoiceResponse> {
    const raw = await this.#transport.post<unknown>("v1/invoices", body);
    return parseResponse({
      data: raw,
      schema: InvoiceResponseSchema,
      validate: this.#validate,
    });
  }
}
