import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { MessageResponseSchema, MessagesResponseSchema } from "./schema";
import type { Message, MessagesResponse, SendMessageRequest } from "./schema";

export interface ListMessagesArgs extends ListArgs {
  channelId: string;
}

export class MessagesResource {
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

  /** Send a message. */
  async send(body: SendMessageRequest): Promise<Message> {
    const raw: unknown = await this.#transport.post("v1/messages", body);
    return parseResponse({ schema: MessageResponseSchema, data: raw, validate: this.#validate });
  }

  /** List messages in a channel. */
  async list(args: ListMessagesArgs): Promise<MessagesResponse> {
    const raw: unknown = await this.#transport.get("v1/messages", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: MessagesResponseSchema, data: raw, validate: this.#validate });
  }

  /** Iterate over all messages in a channel, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListMessagesArgs, "nextToken">): Promise<Message[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
