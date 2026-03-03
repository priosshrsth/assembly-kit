import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  CompaniesResponse,
  CompanyCreateRequest,
  CompanyResponse,
  CompanyUpdateRequest,
} from "./schema";
import { CompaniesResponseSchema, CompanyResponseSchema } from "./schema";

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

  /** List companies with optional filters. */
  async list(args?: {
    name?: string;
    isPlaceholder?: boolean;
    nextToken?: string;
    limit?: number;
  }): Promise<CompaniesResponse> {
    const raw = await this.#transport.get<unknown>("v1/companies", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: CompaniesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single company by ID. */
  async get(id: string): Promise<CompanyResponse> {
    const raw = await this.#transport.get<unknown>(`v1/companies/${id}`);
    return parseResponse({
      data: raw,
      schema: CompanyResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new company. */
  async create(body: CompanyCreateRequest): Promise<CompanyResponse> {
    const raw = await this.#transport.post<unknown>("v1/companies", body);
    return parseResponse({
      data: raw,
      schema: CompanyResponseSchema,
      validate: this.#validate,
    });
  }

  /** Update an existing company. */
  async update({
    id,
    body,
  }: {
    id: string;
    body: CompanyUpdateRequest;
  }): Promise<CompanyResponse> {
    const raw = await this.#transport.patch<unknown>(
      `v1/companies/${id}`,
      body
    );
    return parseResponse({
      data: raw,
      schema: CompanyResponseSchema,
      validate: this.#validate,
    });
  }

  /** Delete a company by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/companies/${id}`);
  }
}
