import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

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

export class CompaniesResource extends BaseResource {
  /** Create a new company. */
  async create(body: CompanyCreateRequest): Promise<Company> {
    const raw = await this.sdk.createCompany({ requestBody: body as never });
    return this.parse(CompanyResponseSchema, raw);
  }

  /** List companies with optional filters. */
  async list(args: ListCompaniesArgs = {}): Promise<CompaniesResponse> {
    const raw = await this.sdk.listCompanies(args);
    return this.parse(CompaniesResponseSchema, raw);
  }

  /** Retrieve a single company by ID. */
  async retrieve(id: string): Promise<Company> {
    const raw = await this.sdk.retrieveCompany({ id });
    return this.parse(CompanyResponseSchema, raw);
  }

  /** Update a company. */
  async update(args: { id: string; body: CompanyUpdateRequest }): Promise<Company> {
    const raw = await this.sdk.updateCompany({
      id: args.id,
      requestBody: args.body as never,
    });
    return this.parse(CompanyResponseSchema, raw);
  }

  /** Delete a company by ID. */
  async delete(id: string): Promise<void> {
    await this.sdk.deleteCompany({ id });
  }

  /** Iterate over all companies, automatically paginating. Default limit per page: 10000. */
  async listAll(args: Omit<ListCompaniesArgs, "nextToken"> = {}): Promise<Company[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 10_000,
    });
  }
}
