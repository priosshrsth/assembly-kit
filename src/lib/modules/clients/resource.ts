import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { ClientResponseSchema, ClientsResponseSchema } from "./schema";
import type { Client, ClientCreateRequest, ClientUpdateRequest, ClientsResponse } from "./schema";

export interface ListClientsArgs extends ListArgs {
  companyId?: string;
  email?: string;
  familyName?: string;
  givenName?: string;
}

export class ClientsResource {
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

  /** Create a new client. */
  async create(args: { body: ClientCreateRequest; sendInvite?: boolean }): Promise<Client> {
    const searchParams =
      args.sendInvite !== undefined
        ? buildSearchParams({ sendInvite: args.sendInvite })
        : undefined;
    const raw: unknown = await this.#transport.post("v1/clients", args.body, { searchParams });
    return parseResponse({ schema: ClientResponseSchema, data: raw, validate: this.#validate });
  }

  /** List clients with optional filters. */
  async list(args: ListClientsArgs = {}): Promise<ClientsResponse> {
    const raw: unknown = await this.#transport.get("v1/clients", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: ClientsResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single client by ID. */
  async retrieve(id: string): Promise<Client> {
    const raw: unknown = await this.#transport.get(`v1/clients/${id}`);
    return parseResponse({ schema: ClientResponseSchema, data: raw, validate: this.#validate });
  }

  /** Update a client (PATCH — partial update). */
  async update(args: {
    id: string;
    body: ClientUpdateRequest;
    sendInvite?: boolean;
  }): Promise<Client> {
    const searchParams =
      args.sendInvite !== undefined
        ? buildSearchParams({ sendInvite: args.sendInvite })
        : undefined;
    const raw: unknown = await this.#transport.patch(`v1/clients/${args.id}`, args.body, {
      searchParams,
    });
    return parseResponse({ schema: ClientResponseSchema, data: raw, validate: this.#validate });
  }

  /** Delete a client by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/clients/${id}`);
  }

  /** Iterate over all clients, automatically paginating. Default limit per page: 50000. */
  async listAll(args: Omit<ListClientsArgs, "nextToken"> = {}): Promise<Client[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 50_000,
    });
  }
}
