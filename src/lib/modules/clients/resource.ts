import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { ClientResponseSchema, ClientsResponseSchema } from "./schema";
import type { Client, ClientCreateRequest, ClientUpdateRequest, ClientsResponse } from "./schema";

export interface ListClientsArgs extends ListArgs {
  companyId?: string;
  email?: string;
  familyName?: string;
  givenName?: string;
}

export class ClientsResource extends BaseResource {
  /** Create a new client. */
  async create(args: { body: ClientCreateRequest; sendInvite?: boolean }): Promise<Client> {
    const raw = await this.sdk.createClient({
      requestBody: args.body as never,
      sendInvite: args.sendInvite,
    });
    return this.parse(ClientResponseSchema, raw);
  }

  /** List clients with optional filters. */
  async list(args: ListClientsArgs = {}): Promise<ClientsResponse> {
    const raw = await this.sdk.listClients(args);
    return this.parse(ClientsResponseSchema, raw);
  }

  /** Retrieve a single client by ID. */
  async retrieve(id: string): Promise<Client> {
    const raw = await this.sdk.retrieveClient({ id });
    return this.parse(ClientResponseSchema, raw);
  }

  /** Update a client (PATCH — partial update). */
  async update(args: {
    id: string;
    body: ClientUpdateRequest;
    sendInvite?: boolean;
  }): Promise<Client> {
    const raw = await this.sdk.updateClient({
      id: args.id,
      requestBody: args.body as never,
      sendInvite: args.sendInvite,
    });
    return this.parse(ClientResponseSchema, raw);
  }

  /** Delete a client by ID. */
  async delete(id: string): Promise<void> {
    await this.sdk.deleteClient({ id });
  }

  /** Iterate over all clients, automatically paginating. Default limit per page: 50000. */
  async listAll(args: Omit<ListClientsArgs, "nextToken"> = {}): Promise<Client[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 50_000,
    });
  }
}
