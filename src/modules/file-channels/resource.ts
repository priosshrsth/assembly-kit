import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  FileChannelCreateRequest,
  FileChannelResponse,
  FileChannelsResponse,
} from "./schema";
import {
  FileChannelResponseSchema,
  FileChannelsResponseSchema,
} from "./schema";

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

  /** List file channels with optional filters. */
  async list(args?: {
    clientId?: string;
    companyId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<FileChannelsResponse> {
    const raw = await this.#transport.get<unknown>("v1/file-channels", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: FileChannelsResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single file channel by ID. */
  async get(id: string): Promise<FileChannelResponse> {
    const raw = await this.#transport.get<unknown>(`v1/file-channels/${id}`);
    return parseResponse({
      data: raw,
      schema: FileChannelResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new file channel. */
  async create(body: FileChannelCreateRequest): Promise<FileChannelResponse> {
    const raw = await this.#transport.post<unknown>("v1/file-channels", body);
    return parseResponse({
      data: raw,
      schema: FileChannelResponseSchema,
      validate: this.#validate,
    });
  }
}
