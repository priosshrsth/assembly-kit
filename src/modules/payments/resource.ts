import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { PaymentsResponse } from "./schema";
import { PaymentsResponseSchema } from "./schema";

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
  async list(args?: {
    invoiceId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<PaymentsResponse> {
    const raw = await this.#transport.get<unknown>("v1/payments", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: PaymentsResponseSchema,
      validate: this.#validate,
    });
  }
}
