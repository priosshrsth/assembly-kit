import { z } from "zod";

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
