import type { MembershipType } from "src/schemas/shared/membership-type";
import { MembershipTypeSchema } from "src/schemas/shared/membership-type";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export type AppConnectionType = "embed" | "link";

export const AppConnectionTypeSchema: z.ZodType<AppConnectionType> = z.enum(["embed", "link"]);

export interface AppConnection {
  clientIds?: string[] | null;
  companyId?: string | null;
  content?: string;
  createdAt: string;
  id: string;
  installId?: string;
  membershipType?: MembershipType;
  object: "appConnection";
  type?: AppConnectionType;
  updatedAt?: string;
}

export const AppConnectionSchema: z.ZodType<AppConnection> = z.object({
  clientIds: z.array(z.string()).nullable().optional(),
  companyId: z.string().nullable().optional(),
  content: z.string().optional(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  installId: z.string().optional(),
  membershipType: MembershipTypeSchema.optional(),
  object: z.literal("appConnection"),
  type: AppConnectionTypeSchema.optional(),
  updatedAt: z.iso.datetime().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const AppConnectionResponseSchema: z.ZodType<AppConnection> = AppConnectionSchema;
export type AppConnectionResponse = AppConnection;

export interface AppConnectionsResponse {
  data: AppConnection[] | null;
}

export const AppConnectionsResponseSchema: z.ZodType<AppConnectionsResponse> = z.object({
  data: z.array(AppConnectionSchema).nullable(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface AppConnectionCreateRequest {
  clientIds?: string[];
  companyId?: string;
  content: string;
  installId: string;
  membershipType: MembershipType;
  type: AppConnectionType;
}

export const AppConnectionCreateRequestSchema: z.ZodType<AppConnectionCreateRequest> = z.object({
  clientIds: z.array(z.string()).optional(),
  companyId: z.string().optional(),
  content: z.string(),
  installId: z.string(),
  membershipType: MembershipTypeSchema,
  type: AppConnectionTypeSchema,
});
