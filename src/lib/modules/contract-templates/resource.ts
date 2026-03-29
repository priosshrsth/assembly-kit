import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { ContractTemplateResponseSchema, ContractTemplatesResponseSchema } from "./schema";
import type { ContractTemplate, ContractTemplatesResponse } from "./schema";

export interface ListContractTemplatesArgs extends ListArgs {
  name?: string;
}

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
  async list(args: ListContractTemplatesArgs = {}): Promise<ContractTemplatesResponse> {
    const raw: unknown = await this.#transport.get("v1/contract-templates", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: ContractTemplatesResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single contract template by ID. */
  async retrieve(id: string): Promise<ContractTemplate> {
    const raw: unknown = await this.#transport.get(`v1/contract-templates/${id}`);
    return parseResponse({
      schema: ContractTemplateResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all contract templates, automatically paginating. Default limit per page: 500. */
  async listAll(
    args: Omit<ListContractTemplatesArgs, "nextToken"> = {},
  ): Promise<ContractTemplate[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
