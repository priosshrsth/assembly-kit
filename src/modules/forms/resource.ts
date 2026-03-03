import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { FormDataResponse, FormsDataResponse } from "./schema";
import { FormDataResponseSchema, FormsDataResponseSchema } from "./schema";

export class FormsResource {
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

  /** List forms. */
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<FormsDataResponse> {
    const raw = await this.#transport.get<unknown>("v1/forms", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: FormsDataResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single form by ID. */
  async get(id: string): Promise<FormDataResponse> {
    const raw = await this.#transport.get<unknown>(`v1/forms/${id}`);
    return parseResponse({
      data: raw,
      schema: FormDataResponseSchema,
      validate: this.#validate,
    });
  }
}
