import { parseResponse } from "src/client/parse-response";
import type { ListCustomFieldResponse } from "src/schemas/responses/custom-field";
import { ListCustomFieldResponseSchema } from "src/schemas/responses/custom-field";
import type { Transport } from "src/transport/http";

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
