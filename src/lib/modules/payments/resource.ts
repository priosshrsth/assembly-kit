import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { PaymentsResponseSchema } from "./schema";
import type { Payment, PaymentsResponse } from "./schema";

export interface ListPaymentsArgs extends ListArgs {
  clientId?: string;
  invoiceId?: string;
}

export class PaymentsResource {
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

  /** List payments with optional filters. */
  async list(args: ListPaymentsArgs = {}): Promise<PaymentsResponse> {
    const raw: unknown = await this.#transport.get("v1/payments", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: PaymentsResponseSchema, data: raw, validate: this.#validate });
  }

  /** Iterate over all payments, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListPaymentsArgs, "nextToken"> = {}): Promise<Payment[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
