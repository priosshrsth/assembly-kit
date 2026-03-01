import { FileChannelSchema } from "src/schemas/base/file-channel";
import type { FileChannel } from "src/schemas/base/file-channel";
import { z } from "zod";

export { FileChannelSchema as FileChannelResponseSchema };
export type { FileChannel as FileChannelResponse };

export interface FileChannelsResponse {
  data: FileChannel[] | null;
}

export const FileChannelsResponseSchema: z.ZodType<FileChannelsResponse> =
  z.object({
    data: z.array(FileChannelSchema).nullable(),
  });
