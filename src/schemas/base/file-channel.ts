import { z } from "zod";

import type { MembershipType } from "./membership-type";
import { MembershipTypeSchema } from "./membership-type";

export interface FileChannel {
  clientId?: string | null;
  companyId?: string | null;
  createdAt: string;
  id: string;
  memberIds?: string[];
  /** @deprecated Use `clientId`/`companyId` instead. */
  membershipEntityId?: string;
  membershipType: MembershipType;
  object: "fileChannel";
  updatedAt: string;
}

export const FileChannelSchema: z.ZodType<FileChannel> = z.object({
  clientId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  memberIds: z.array(z.string()).optional(),
  membershipEntityId: z.string().optional(),
  membershipType: MembershipTypeSchema,
  object: z.literal("fileChannel"),
  updatedAt: z.iso.datetime(),
});
