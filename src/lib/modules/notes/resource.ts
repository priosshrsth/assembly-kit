import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { NoteResponseSchema, NotesResponseSchema } from "./schema";
import type { Note, NoteCreateRequest, NoteUpdateRequest, NotesResponse } from "./schema";

export interface ListNotesArgs extends ListArgs {
  clientId?: string;
  companyId?: string;
}

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

  /** Create a new note. */
  async create(body: NoteCreateRequest): Promise<Note> {
    const raw: unknown = await this.#transport.post("v1/notes", body);
    return parseResponse({ schema: NoteResponseSchema, data: raw, validate: this.#validate });
  }

  /** List notes with optional filters. */
  async list(args: ListNotesArgs = {}): Promise<NotesResponse> {
    const raw: unknown = await this.#transport.get("v1/notes", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: NotesResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single note by ID. */
  async retrieve(id: string): Promise<Note> {
    const raw: unknown = await this.#transport.get(`v1/notes/${id}`);
    return parseResponse({ schema: NoteResponseSchema, data: raw, validate: this.#validate });
  }

  /** Update a note. */
  async update(args: { id: string; body: NoteUpdateRequest }): Promise<Note> {
    const raw: unknown = await this.#transport.patch(`v1/notes/${args.id}`, args.body);
    return parseResponse({ schema: NoteResponseSchema, data: raw, validate: this.#validate });
  }

  /** Delete a note by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/notes/${id}`);
  }

  /** Iterate over all notes, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListNotesArgs, "nextToken"> = {}): Promise<Note[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
