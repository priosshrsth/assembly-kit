import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  MessageChannelCreateRequest,
  MessageChannelResponse,
  MessageChannelsResponse,
} from "./schema";
import {
  MessageChannelResponseSchema,
  MessageChannelsResponseSchema,
} from "./schema";

export class MessageChannelsResource {
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

  /** List message channels with optional filters. */
  async list(args?: {
    clientId?: string;
    companyId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<MessageChannelsResponse> {
    const raw = await this.#transport.get<unknown>("v1/message-channels", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: MessageChannelsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single message channel by ID. */
  async get(id: string): Promise<MessageChannelResponse> {
    const raw = await this.#transport.get<unknown>(`v1/message-channels/${id}`);
    return parseResponse({
      data: raw,
      schema: MessageChannelResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new message channel. */
  async create(
    body: MessageChannelCreateRequest
  ): Promise<MessageChannelResponse> {
    const raw = await this.#transport.post<unknown>(
      "v1/message-channels",
      body
    );
    return parseResponse({
      data: raw,
      schema: MessageChannelResponseSchema,
      validate: this.#validate,
    });
  }
}
