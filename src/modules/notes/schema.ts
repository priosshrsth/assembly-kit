import { z } from "zod";

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface Note {
  clientId?: string;
  companyId?: string;
  content?: string;
  createdAt: string;
  createdBy?: string;
  id: string;
  object: "note";
  updatedAt: string;
}

export const NoteSchema: z.ZodType<Note> = z.object({
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  content: z.string().optional(),
  createdAt: z.iso.datetime(),
  createdBy: z.string().optional(),
  id: z.string(),
  object: z.literal("note"),
  updatedAt: z.iso.datetime(),
});

// ─── Response ─────────────────────────────────────────────────────────────────

export const NoteResponseSchema: z.ZodType<Note> = NoteSchema;
export type NoteResponse = Note;

export interface NotesResponse {
  data: Note[] | null;
}

export const NotesResponseSchema: z.ZodType<NotesResponse> = z.object({
  data: z.array(NoteSchema).nullable(),
});

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface NoteCreateRequest {
  clientId: string;
  companyId?: string;
  content: string;
}

export const NoteCreateRequestSchema: z.ZodType<NoteCreateRequest> = z.object({
  clientId: z.string(),
  companyId: z.string().optional(),
  content: z.string(),
});

export interface NoteUpdateRequest {
  content?: string;
}

export const NoteUpdateRequestSchema: z.ZodType<NoteUpdateRequest> = z.object({
  content: z.string().optional(),
});
