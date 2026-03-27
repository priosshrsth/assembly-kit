import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export type FileType = "file" | "folder" | "link";

export const FileTypeSchema: z.ZodType<FileType> = z.enum(["file", "folder", "link"]);

export interface AssemblyFile {
  channelId?: string;
  createdAt: string;
  fileType?: FileType;
  id: string;
  name?: string;
  object: "file";
  path?: string;
  updatedAt: string;
  url?: string;
}

export const AssemblyFileSchema: z.ZodType<AssemblyFile> = z.object({
  channelId: z.string().optional(),
  createdAt: z.iso.datetime(),
  fileType: FileTypeSchema.optional(),
  id: z.string(),
  name: z.string().optional(),
  object: z.literal("file"),
  path: z.string().optional(),
  updatedAt: z.iso.datetime(),
  url: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const AssemblyFileResponseSchema: z.ZodType<AssemblyFile> = AssemblyFileSchema;
export type AssemblyFileResponse = AssemblyFile;

export interface AssemblyFilesResponse {
  data: AssemblyFile[] | null;
  nextToken?: string;
}

export const AssemblyFilesResponseSchema: z.ZodType<AssemblyFilesResponse> = z.object({
  data: z.array(AssemblyFileSchema).nullable(),
  nextToken: z.string().optional(),
});
