import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { AssemblyFileResponse, AssemblyFilesResponse } from "./schema";
import {
  AssemblyFileResponseSchema,
  AssemblyFilesResponseSchema,
} from "./schema";

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

  /** List files with optional filters. */
  async list(args?: {
    channelId?: string;
    path?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<AssemblyFilesResponse> {
    const raw = await this.#transport.get<unknown>("v1/files", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: AssemblyFilesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single file by ID. */
  async get(id: string): Promise<AssemblyFileResponse> {
    const raw = await this.#transport.get<unknown>(`v1/files/${id}`);
    return parseResponse({
      data: raw,
      schema: AssemblyFileResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a file, folder, or link. */
  async create({
    fileType,
    body,
  }: {
    fileType: "file" | "folder" | "link";
    body: unknown;
  }): Promise<AssemblyFileResponse> {
    const raw = await this.#transport.post<unknown>(
      `v1/files/${fileType}`,
      body
    );
    return parseResponse({
      data: raw,
      schema: AssemblyFileResponseSchema,
      validate: this.#validate,
    });
  }

  /** Delete a file by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/files/${id}`);
  }

  /** Update folder client permissions. */
  async updatePermissions({
    id,
    body,
  }: {
    id: string;
    body: unknown;
  }): Promise<AssemblyFileResponse> {
    const raw = await this.#transport.put<unknown>(
      `v1/files/${id}/permissions`,
      body
    );
    return parseResponse({
      data: raw,
      schema: AssemblyFileResponseSchema,
      validate: this.#validate,
    });
  }
}
