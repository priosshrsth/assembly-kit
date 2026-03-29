import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { ListCustomFieldResponseSchema } from "./schema";
import type { ListCustomFieldResponse } from "./schema";

export class CustomFieldsResource {
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

  /** List custom fields with optional entity type filter. */
  async list(args: { entityType?: string } = {}): Promise<ListCustomFieldResponse> {
    const raw = await this.#transport.get<unknown>("v1/custom-fields", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: ListCustomFieldResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }
}
