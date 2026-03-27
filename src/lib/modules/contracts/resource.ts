import { BaseResource } from "src/client/base-resource";

import { ContractResponseSchema, ContractsResponseSchema } from "./schema";
import type { Contract, ContractSendRequest, ContractsResponse } from "./schema";

export class ContractsResource extends BaseResource {
  /** Send a contract to a recipient. */
  async send(body: ContractSendRequest): Promise<Contract> {
    const raw = await this.sdk.sendContract({ requestBody: body });
    return this.parse(ContractResponseSchema, raw);
  }

  /** List contracts with optional filters. */
  async list(
    args: {
      clientId?: string;
      contractTemplateId?: string;
      recipientId?: string;
      status?: string;
    } = {},
  ): Promise<ContractsResponse> {
    const raw = await this.sdk.listContracts(args);
    return this.parse(ContractsResponseSchema, raw);
  }

  /** Retrieve a single contract by ID. */
  async retrieve(id: string): Promise<Contract> {
    const raw = await this.sdk.retrieveContract({ id });
    return this.parse(ContractResponseSchema, raw);
  }
}
