import { AssemblyFileSchema } from "src/schemas/base/file";
import type { AssemblyFile } from "src/schemas/base/file";
import { z } from "zod";

export { AssemblyFileSchema as AssemblyFileResponseSchema };
export type { AssemblyFile as AssemblyFileResponse };

export interface AssemblyFilesResponse {
  data: AssemblyFile[] | null;
}

export const AssemblyFilesResponseSchema: z.ZodType<AssemblyFilesResponse> =
  z.object({
    data: z.array(AssemblyFileSchema).nullable(),
  });
