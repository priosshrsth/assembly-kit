import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { ListCustomFieldResponse } from "./schema";
import { ListCustomFieldResponseSchema } from "./schema";

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

  /** List custom fields for a given entity type. */
  async list(entityType: string): Promise<ListCustomFieldResponse> {
    const raw = await this.#transport.get<unknown>("v1/custom-fields", {
      searchParams: { entityType },
    });
    return parseResponse({
      data: raw,
      schema: ListCustomFieldResponseSchema,
      validate: this.#validate,
    });
  }
}
