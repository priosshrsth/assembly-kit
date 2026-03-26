import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import {
  AssemblyFileResponseSchema,
  AssemblyFilesResponseSchema,
} from "./schema";
import type { AssemblyFile, AssemblyFilesResponse } from "./schema";

export interface ListFilesArgs extends ListArgs {
  channelId: string;
  path?: string;
}

export class FilesResource extends BaseResource {
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
    const raw = await this.sdk.createFile({
      fileType: args.fileType,
      requestBody: args.body,
    });
    return this.parse(AssemblyFileResponseSchema, raw);
  }

  /** List files in a channel. */
  async list(args: ListFilesArgs): Promise<AssemblyFilesResponse> {
    const raw = await this.sdk.listFiles(args);
    return this.parse(AssemblyFilesResponseSchema, raw);
  }

  /** Retrieve a single file by ID. */
  async retrieve(id: string): Promise<AssemblyFile> {
    const raw = await this.sdk.retrieveFile({ id });
    return this.parse(AssemblyFileResponseSchema, raw);
  }

  /** Delete a file by ID. */
  async delete(id: string): Promise<void> {
    await this.sdk.deleteFile({ id });
  }

  /** Iterate over all files in a channel, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListFilesArgs, "nextToken">
  ): AsyncGenerator<AssemblyFile> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
