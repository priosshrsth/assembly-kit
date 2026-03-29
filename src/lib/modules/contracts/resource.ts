import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { ContractResponseSchema, ContractsResponseSchema } from "./schema";
import type { Contract, ContractSendRequest, ContractsResponse } from "./schema";

export interface ListContractsArgs {
  clientId?: string;
  contractTemplateId?: string;
  recipientId?: string;
  status?: string;
}

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

  /** Send a contract to a recipient. */
  async send(body: ContractSendRequest): Promise<Contract> {
    const raw: unknown = await this.#transport.post("v1/contracts", body);
    return parseResponse({ schema: ContractResponseSchema, data: raw, validate: this.#validate });
  }

  /** List contracts with optional filters. */
  async list(args: ListContractsArgs = {}): Promise<ContractsResponse> {
    const raw: unknown = await this.#transport.get("v1/contracts", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: ContractsResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single contract by ID. */
  async retrieve(id: string): Promise<Contract> {
    const raw: unknown = await this.#transport.get(`v1/contracts/${id}`);
    return parseResponse({ schema: ContractResponseSchema, data: raw, validate: this.#validate });
  }
}
