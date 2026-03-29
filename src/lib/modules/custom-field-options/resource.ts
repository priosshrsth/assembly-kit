import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { ListCustomFieldOptionResponseSchema } from "./schema";
import type { ListCustomFieldOptionResponse } from "./schema";

export class CustomFieldOptionsResource {
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

  /** List options for a multi-select custom field. */
  async list(args: { id: string; label?: string }): Promise<ListCustomFieldOptionResponse> {
    const { id, ...params } = args;
    const raw = await this.#transport.get<unknown>(`v1/custom-fields/${id}/options`, {
      searchParams: buildSearchParams(params),
    });
    return parseResponse({
      schema: ListCustomFieldOptionResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }
}
