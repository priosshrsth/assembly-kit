import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { ListCustomFieldOptionResponse } from "./schema";
import { ListCustomFieldOptionResponseSchema } from "./schema";

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

  /** List custom field options with optional filters. */
  async list(args?: {
    customFieldId?: string;
  }): Promise<ListCustomFieldOptionResponse> {
    const raw = await this.#transport.get<unknown>("v1/custom-field-options", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: ListCustomFieldOptionResponseSchema,
      validate: this.#validate,
    });
  }
}
