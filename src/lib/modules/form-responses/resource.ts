import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { FormResponseItemResponseSchema, FormResponsesResponseSchema } from "./schema";
import type { FormResponse, FormResponseCreateRequest, FormResponsesResponse } from "./schema";

export class FormResponsesResource {
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

  /** List form responses. */
  async list(args: { formId?: string; clientId?: string } = {}): Promise<FormResponsesResponse> {
    const { formId, ...rest } = args;
    const path = formId ? `v1/forms/${formId}/form-responses` : "v1/forms/form-responses";
    const raw: unknown = await this.#transport.get(path, { searchParams: buildSearchParams(rest) });
    return parseResponse({
      schema: FormResponsesResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Request a form response (send form to a client). */
  async create(body: FormResponseCreateRequest): Promise<FormResponse> {
    const raw: unknown = await this.#transport.post("v1/form-responses", body);
    return parseResponse({
      schema: FormResponseItemResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }
}
