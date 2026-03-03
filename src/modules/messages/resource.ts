import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  MessageResponse,
  MessagesResponse,
  SendMessageRequest,
} from "./schema";
import { MessageResponseSchema, MessagesResponseSchema } from "./schema";

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

  /** List messages with optional filters. */
  async list(args?: {
    channelId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<MessagesResponse> {
    const raw = await this.#transport.get<unknown>("v1/messages", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: MessagesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Send a message to a channel. */
  async send(body: SendMessageRequest): Promise<MessageResponse> {
    const raw = await this.#transport.post<unknown>("v1/messages", body);
    return parseResponse({
      data: raw,
      schema: MessageResponseSchema,
      validate: this.#validate,
    });
  }
}
