import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  ContractResponse,
  ContractSendRequest,
  ContractsResponse,
} from "./schema";
import { ContractResponseSchema, ContractsResponseSchema } from "./schema";

export class ContractsResource {
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

  /** List contracts with optional filters. */
  async list(args?: {
    clientId?: string;
    companyId?: string;
    status?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<ContractsResponse> {
    const raw = await this.#transport.get<unknown>("v1/contracts", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: ContractsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single contract by ID. */
  async get(id: string): Promise<ContractResponse> {
    const raw = await this.#transport.get<unknown>(`v1/contracts/${id}`);
    return parseResponse({
      data: raw,
      schema: ContractResponseSchema,
      validate: this.#validate,
    });
  }

  /** Send a contract to a client. */
  async send(body: ContractSendRequest): Promise<ContractResponse> {
    const raw = await this.#transport.post<unknown>("v1/contracts", body);
    return parseResponse({
      data: raw,
      schema: ContractResponseSchema,
      validate: this.#validate,
    });
  }
}
