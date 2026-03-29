import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { MessageChannelResponseSchema, MessageChannelsResponseSchema } from "./schema";
import type {
  MessageChannel,
  MessageChannelCreateRequest,
  MessageChannelsResponse,
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

  /** Create a message channel. */
  async create(body: MessageChannelCreateRequest): Promise<MessageChannel> {
    const raw: unknown = await this.#transport.post("v1/message-channels", body);
    return parseResponse({
      schema: MessageChannelResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** List message channels. */
  async list(args: ListArgs = {}): Promise<MessageChannelsResponse> {
    const raw: unknown = await this.#transport.get("v1/message-channels", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: MessageChannelsResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single message channel by ID. */
  async retrieve(id: string): Promise<MessageChannel> {
    const raw: unknown = await this.#transport.get(`v1/message-channels/${id}`);
    return parseResponse({
      schema: MessageChannelResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all message channels, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<MessageChannel[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
