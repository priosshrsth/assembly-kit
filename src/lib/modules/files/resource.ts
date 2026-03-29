import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { AssemblyFileResponseSchema, AssemblyFilesResponseSchema } from "./schema";
import type { AssemblyFile, AssemblyFilesResponse } from "./schema";

export interface ListFilesArgs extends ListArgs {
  channelId: string;
  path?: string;
}

export class FilesResource {
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

  /** Create a file, folder, or link. */
  async create(args: {
    fileType: string;
    body: {
      channelId: string;
      clientPermissions?: "read_write" | "read_only";
      linkUrl?: string;
      path: string;
    };
  }): Promise<AssemblyFile> {
    const raw: unknown = await this.#transport.post(`v1/files/${args.fileType}`, args.body);
    return parseResponse({
      schema: AssemblyFileResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** List files in a channel. */
  async list(args: ListFilesArgs): Promise<AssemblyFilesResponse> {
    const raw: unknown = await this.#transport.get("v1/files", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: AssemblyFilesResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single file by ID. */
  async retrieve(id: string): Promise<AssemblyFile> {
    const raw: unknown = await this.#transport.get(`v1/files/${id}`);
    return parseResponse({
      schema: AssemblyFileResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Delete a file by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/files/${id}`);
  }

  /** Iterate over all files in a channel, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListFilesArgs, "nextToken">): Promise<AssemblyFile[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
