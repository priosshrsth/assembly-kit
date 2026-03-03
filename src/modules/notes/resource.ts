import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type {
  NoteCreateRequest,
  NoteResponse,
  NoteUpdateRequest,
  NotesResponse,
} from "./schema";
import { NoteResponseSchema, NotesResponseSchema } from "./schema";

export class NotesResource {
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

  /** List notes with optional filters. */
  async list(args?: {
    clientId?: string;
    companyId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<NotesResponse> {
    const raw = await this.#transport.get<unknown>("v1/notes", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: NotesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single note by ID. */
  async get(id: string): Promise<NoteResponse> {
    const raw = await this.#transport.get<unknown>(`v1/notes/${id}`);
    return parseResponse({
      data: raw,
      schema: NoteResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new note. */
  async create(body: NoteCreateRequest): Promise<NoteResponse> {
    const raw = await this.#transport.post<unknown>("v1/notes", body);
    return parseResponse({
      data: raw,
      schema: NoteResponseSchema,
      validate: this.#validate,
    });
  }

  /** Update an existing note. */
  async update({
    id,
    body,
  }: {
    id: string;
    body: NoteUpdateRequest;
  }): Promise<NoteResponse> {
    const raw = await this.#transport.patch<unknown>(`v1/notes/${id}`, body);
    return parseResponse({
      data: raw,
      schema: NoteResponseSchema,
      validate: this.#validate,
    });
  }

  /** Delete a note by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/notes/${id}`);
  }
}
