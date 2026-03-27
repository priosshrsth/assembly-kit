import { MembershipTypeSchema } from "src/schemas/shared/membership-type";
import type { MembershipType } from "src/schemas/shared/membership-type";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const FileChannelResponseSchema: z.ZodType<FileChannel> = FileChannelSchema;
export type FileChannelResponse = FileChannel;

export interface FileChannelsResponse {
  data: FileChannel[] | null;
  nextToken?: string;
}

export const FileChannelsResponseSchema: z.ZodType<FileChannelsResponse> = z.object({
  data: z.array(FileChannelSchema).nullable(),
  nextToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface FileChannelCreateRequest {
  clientId?: string;
  companyId?: string;
  membershipType: MembershipType;
}

export const FileChannelCreateRequestSchema: z.ZodType<FileChannelCreateRequest> = z.object({
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  membershipType: MembershipTypeSchema,
});
