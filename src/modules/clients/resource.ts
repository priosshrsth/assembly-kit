import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  ClientCreateRequest,
  ClientResponse,
  ClientUpdateRequest,
  ClientsResponse,
} from "./schema";
import { ClientResponseSchema, ClientsResponseSchema } from "./schema";

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

  /** List clients with optional filters. */
  async list(args?: {
    companyId?: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<ClientsResponse> {
    const raw = await this.#transport.get<unknown>("v1/clients", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: ClientsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single client by ID. */
  async get(id: string): Promise<ClientResponse> {
    const raw = await this.#transport.get<unknown>(`v1/clients/${id}`);
    return parseResponse({
      data: raw,
      schema: ClientResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new client. */
  async create({
    body,
    sendInvite,
  }: {
    body: ClientCreateRequest;
    sendInvite?: boolean;
  }): Promise<ClientResponse> {
    const raw = await this.#transport.post<unknown>("v1/clients", body, {
      searchParams: buildSearchParams({ sendInvite }),
    });
    return parseResponse({
      data: raw,
      schema: ClientResponseSchema,
      validate: this.#validate,
    });
  }

  /** Update an existing client. */
  async update({
    id,
    body,
  }: {
    id: string;
    body: ClientUpdateRequest;
  }): Promise<ClientResponse> {
    const raw = await this.#transport.patch<unknown>(`v1/clients/${id}`, body);
    return parseResponse({
      data: raw,
      schema: ClientResponseSchema,
      validate: this.#validate,
    });
  }

  /** Delete a client by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/clients/${id}`);
  }
}
