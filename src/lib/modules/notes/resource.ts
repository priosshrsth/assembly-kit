import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { NoteResponseSchema, NotesResponseSchema } from "./schema";
import type { Note, NoteCreateRequest, NoteUpdateRequest, NotesResponse } from "./schema";

export interface ListNotesArgs extends ListArgs {
  clientId?: string;
  companyId?: string;
}

export class NotesResource extends BaseResource {
  /** Create a new note. */
  async create(body: NoteCreateRequest): Promise<Note> {
    const raw = await this.sdk.createNote({ requestBody: body as never });
    return this.parse(NoteResponseSchema, raw);
  }

  /** List notes with optional filters. */
  async list(args: ListNotesArgs = {}): Promise<NotesResponse> {
    const raw = await this.sdk.listNotes(args);
    return this.parse(NotesResponseSchema, raw);
  }

  /** Retrieve a single note by ID. */
  async retrieve(id: string): Promise<Note> {
    const raw = await this.sdk.retrieveNote({ id });
    return this.parse(NoteResponseSchema, raw);
  }

  /** Update a note. */
  async update(args: { id: string; body: NoteUpdateRequest }): Promise<Note> {
    const raw = await this.sdk.updateNote({
      id: args.id,
      requestBody: args.body,
    });
    return this.parse(NoteResponseSchema, raw);
  }

  /** Delete a note by ID. */
  async delete(id: string): Promise<void> {
    await this.sdk.deleteNote({ id });
  }

  /** Iterate over all notes, automatically paginating. Default limit per page: 500. */
  listAll(args: Omit<ListNotesArgs, "nextToken"> = {}): AsyncGenerator<Note> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
