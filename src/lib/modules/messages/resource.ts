import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { MessageResponseSchema, MessagesResponseSchema } from "./schema";
import type { Message, MessagesResponse, SendMessageRequest } from "./schema";

export interface ListMessagesArgs extends ListArgs {
  channelId: string;
}

export class MessagesResource extends BaseResource {
  /** Send a message. */
  async send(body: SendMessageRequest): Promise<Message> {
    const raw = await this.sdk.sendMessage({ requestBody: body });
    return this.parse(MessageResponseSchema, raw);
  }

  /** List messages in a channel. */
  async list(args: ListMessagesArgs): Promise<MessagesResponse> {
    const raw = await this.sdk.listMessages(args);
    return this.parse(MessagesResponseSchema, raw);
  }

  /** Iterate over all messages in a channel, automatically paginating. Default limit per page: 500. */
  listAll(args: Omit<ListMessagesArgs, "nextToken">): AsyncGenerator<Message> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
