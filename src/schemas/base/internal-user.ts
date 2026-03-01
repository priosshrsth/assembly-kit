import { z } from "zod";

export interface InternalUser {
  avatarImageUrl?: string;
  companyAccessList: string[] | null;
  createdAt?: string;
  email: string;
  fallbackColor?: string | null;
  familyName: string;
  givenName: string;
  id: string;
  isClientAccessLimited: boolean;
  object: "internalUser";
  role?: string;
}

export const InternalUserSchema: z.ZodType<InternalUser> = z.object({
  avatarImageUrl: z.string().optional(),
  companyAccessList: z.array(z.string()).nullable(),
  createdAt: z.iso.datetime().optional(),
  // Deleted internal users can still be queried but have an empty email
  email: z.union([z.email(), z.literal("")]),
  fallbackColor: z.string().nullish(),
  familyName: z.string(),
  givenName: z.string(),
  id: z.string(),
  isClientAccessLimited: z.boolean().default(false),
  object: z.literal("internalUser"),
  role: z.string().optional(),
});
