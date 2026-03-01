import { NoteSchema } from "src/schemas/base/note";
import type { Note } from "src/schemas/base/note";
import { z } from "zod";

export { NoteSchema as NoteResponseSchema };
export type { Note as NoteResponse };

export interface NotesResponse {
  data: Note[] | null;
}

export const NotesResponseSchema: z.ZodType<NotesResponse> = z.object({
  data: z.array(NoteSchema).nullable(),
});
