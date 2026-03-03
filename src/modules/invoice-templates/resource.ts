import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { InvoiceTemplatesResponse } from "./schema";
import { InvoiceTemplatesResponseSchema } from "./schema";

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
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<InvoiceTemplatesResponse> {
    const raw = await this.#transport.get<unknown>("v1/invoice-templates", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: InvoiceTemplatesResponseSchema,
      validate: this.#validate,
    });
  }
}
