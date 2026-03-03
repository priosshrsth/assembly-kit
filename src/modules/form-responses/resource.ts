import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  FormResponseCreateRequest,
  FormResponseItemResponse,
  FormResponsesResponse,
} from "./schema";
import {
  FormResponseItemResponseSchema,
  FormResponsesResponseSchema,
} from "./schema";

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

  /** List form responses with optional filters. */
  async list(args?: {
    formId?: string;
    clientId?: string;
    companyId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<FormResponsesResponse> {
    const raw = await this.#transport.get<unknown>("v1/form-responses", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: FormResponsesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Request a form response from a client. */
  async request(
    body: FormResponseCreateRequest
  ): Promise<FormResponseItemResponse> {
    const raw = await this.#transport.post<unknown>("v1/form-responses", body);
    return parseResponse({
      data: raw,
      schema: FormResponseItemResponseSchema,
      validate: this.#validate,
    });
  }
}
