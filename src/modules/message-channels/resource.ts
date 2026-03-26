import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import {
  MessageChannelResponseSchema,
  MessageChannelsResponseSchema,
} from "./schema";
import type {
  MessageChannel,
  MessageChannelCreateRequest,
  MessageChannelsResponse,
} from "./schema";

export class MessageChannelsResource extends BaseResource {
  /** Create a message channel. */
  async create(body: MessageChannelCreateRequest): Promise<MessageChannel> {
    const raw = await this.sdk.createMessageChannel({ requestBody: body });
    return this.parse(MessageChannelResponseSchema, raw);
  }

  /** List message channels. */
  async list(args: ListArgs = {}): Promise<MessageChannelsResponse> {
    const raw = await this.sdk.listMessageChannels(args);
    return this.parse(MessageChannelsResponseSchema, raw);
  }

  /** Retrieve a single message channel by ID. */
  async retrieve(id: string): Promise<MessageChannel> {
    const raw = await this.sdk.retrieveMessageChannel({ id });
    return this.parse(MessageChannelResponseSchema, raw);
  }

  /** Iterate over all message channels, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListArgs, "nextToken"> = {}
  ): AsyncGenerator<MessageChannel> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
