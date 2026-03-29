import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { FileChannelResponseSchema, FileChannelsResponseSchema } from "./schema";
import type { FileChannel, FileChannelCreateRequest, FileChannelsResponse } from "./schema";

export class FileChannelsResource {
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

  /** Create a file channel. */
  async create(body: FileChannelCreateRequest): Promise<FileChannel> {
    const raw: unknown = await this.#transport.post("v1/channels/files", body);
    return parseResponse({
      schema: FileChannelResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** List file channels. */
  async list(args: ListArgs = {}): Promise<FileChannelsResponse> {
    const raw: unknown = await this.#transport.get("v1/channels/files", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: FileChannelsResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single file channel by ID. */
  async retrieve(id: string): Promise<FileChannel> {
    const raw: unknown = await this.#transport.get(`v1/channels/files/${id}`);
    return parseResponse({
      schema: FileChannelResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all file channels, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<FileChannel[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
