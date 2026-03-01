import { z } from "zod";

import type { MembershipType } from "./membership-type";
import { MembershipTypeSchema } from "./membership-type";

export type AppConnectionType = "embed" | "link";

export const AppConnectionTypeSchema: z.ZodType<AppConnectionType> = z.enum([
  "embed",
  "link",
]);

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
  updatedAt: string;
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
  updatedAt: z.iso.datetime(),
});
