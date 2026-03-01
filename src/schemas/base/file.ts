import { z } from "zod";

export type FileType = "file" | "folder" | "link";

export const FileTypeSchema: z.ZodType<FileType> = z.enum([
  "file",
  "folder",
  "link",
]);

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
