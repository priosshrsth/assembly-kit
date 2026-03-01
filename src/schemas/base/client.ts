import { z } from "zod";

export interface Client {
  avatarImageUrl: string | null;
  companyIds?: string[];
  createdAt: string;
  creationMethod: "client" | "directSignUp" | "internalUser";
  customFields?: Record<string, unknown> | null;
  email: string;
  fallbackColor: string | null;
  familyName: string;
  firstLoginDate: string | null;
  givenName: string;
  id: string;
  inviteUrl?: string;
  lastLoginDate: string | null;
  object: "client";
  status: "active" | "invited" | "notInvited";
  updatedAt: string;
}

export const ClientSchema: z.ZodType<Client> = z.object({
  avatarImageUrl: z.string().nullable(),
  companyIds: z.array(z.string()).optional(),
  createdAt: z.iso.datetime(),
  creationMethod: z.enum(["client", "directSignUp", "internalUser"]),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
  email: z.string(),
  fallbackColor: z.string().nullable(),
  familyName: z.string(),
  firstLoginDate: z.string().nullable(),
  givenName: z.string(),
  id: z.string(),
  inviteUrl: z.string().optional(),
  lastLoginDate: z.string().nullable(),
  object: z.literal("client"),
  status: z.enum(["active", "invited", "notInvited"]),
  updatedAt: z.iso.datetime(),
});
