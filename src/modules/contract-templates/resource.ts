import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import {
  ContractTemplateResponseSchema,
  ContractTemplatesResponseSchema,
} from "./schema";
import type { ContractTemplate, ContractTemplatesResponse } from "./schema";

export interface ListContractTemplatesArgs extends ListArgs {
  name?: string;
}

export class ContractTemplatesResource extends BaseResource {
  /** List contract templates. */
  async list(
    args: ListContractTemplatesArgs = {}
  ): Promise<ContractTemplatesResponse> {
    const raw = await this.sdk.listContractTemplates(args);
    return this.parse(ContractTemplatesResponseSchema, raw);
  }

  /** Retrieve a single contract template by ID. */
  async retrieve(id: string): Promise<ContractTemplate> {
    const raw = await this.sdk.retrieveContractTemplate({ id });
    return this.parse(ContractTemplateResponseSchema, raw);
  }

  /** Iterate over all contract templates, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListContractTemplatesArgs, "nextToken"> = {}
  ): AsyncGenerator<ContractTemplate> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
