import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { CompaniesResponseSchema, CompanyResponseSchema } from "./schema";
import type {
  CompaniesResponse,
  Company,
  CompanyCreateRequest,
  CompanyUpdateRequest,
} from "./schema";

export interface ListCompaniesArgs extends ListArgs {
  isPlaceholder?: boolean;
  name?: string;
}

export class CompaniesResource {
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

  /** Create a new company. */
  async create(body: CompanyCreateRequest): Promise<Company> {
    const raw: unknown = await this.#transport.post("v1/companies", body);
    return parseResponse({ schema: CompanyResponseSchema, data: raw, validate: this.#validate });
  }

  /** List companies with optional filters. */
  async list(args: ListCompaniesArgs = {}): Promise<CompaniesResponse> {
    const raw: unknown = await this.#transport.get("v1/companies", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: CompaniesResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single company by ID. */
  async retrieve(id: string): Promise<Company> {
    const raw: unknown = await this.#transport.get(`v1/companies/${id}`);
    return parseResponse({ schema: CompanyResponseSchema, data: raw, validate: this.#validate });
  }

  /** Update a company. */
  async update(args: { id: string; body: CompanyUpdateRequest }): Promise<Company> {
    const raw: unknown = await this.#transport.patch(`v1/companies/${args.id}`, args.body);
    return parseResponse({ schema: CompanyResponseSchema, data: raw, validate: this.#validate });
  }

  /** Delete a company by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/companies/${id}`);
  }

  /** Iterate over all companies, automatically paginating. Default limit per page: 10000. */
  async listAll(args: Omit<ListCompaniesArgs, "nextToken"> = {}): Promise<Company[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 10_000,
    });
  }
}
