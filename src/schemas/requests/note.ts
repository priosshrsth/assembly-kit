import { z } from "zod";

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
