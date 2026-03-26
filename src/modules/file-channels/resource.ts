import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import {
  FileChannelResponseSchema,
  FileChannelsResponseSchema,
} from "./schema";
import type {
  FileChannel,
  FileChannelCreateRequest,
  FileChannelsResponse,
} from "./schema";

export class FileChannelsResource extends BaseResource {
  /** Create a file channel. */
  async create(body: FileChannelCreateRequest): Promise<FileChannel> {
    const raw = await this.sdk.createFileChannel({ requestBody: body });
    return this.parse(FileChannelResponseSchema, raw);
  }

  /** List file channels. */
  async list(args: ListArgs = {}): Promise<FileChannelsResponse> {
    const raw = await this.sdk.listFileChannels(args);
    return this.parse(FileChannelsResponseSchema, raw);
  }

  /** Retrieve a single file channel by ID. */
  async retrieve(id: string): Promise<FileChannel> {
    const raw = await this.sdk.retrieveFileChannel({ id });
    return this.parse(FileChannelResponseSchema, raw);
  }

  /** Iterate over all file channels, automatically paginating. Default limit per page: 500. */
  listAll(args: Omit<ListArgs, "nextToken"> = {}): AsyncGenerator<FileChannel> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
