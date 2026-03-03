import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  ContractTemplateResponse,
  ContractTemplatesResponse,
} from "./schema";
import {
  ContractTemplateResponseSchema,
  ContractTemplatesResponseSchema,
} from "./schema";

export class ContractTemplatesResource {
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

  /** List contract templates. */
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<ContractTemplatesResponse> {
    const raw = await this.#transport.get<unknown>("v1/contract-templates", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: ContractTemplatesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single contract template by ID. */
  async get(id: string): Promise<ContractTemplateResponse> {
    const raw = await this.#transport.get<unknown>(
      `v1/contract-templates/${id}`
    );
    return parseResponse({
      data: raw,
      schema: ContractTemplateResponseSchema,
      validate: this.#validate,
    });
  }
}
