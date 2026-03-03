import { z } from "zod";

export interface TokenPayload {
  baseUrl?: string;
  clientId?: string;
  companyId?: string;
  internalUserId?: string;
  notificationId?: string;
  tokenId?: string;
  workspaceId: string;
}

/**
 * Schema for a decrypted Assembly token payload.
 * Unknown fields are silently stripped for forward compatibility.
 * Requires either `internalUserId` (team member) or both `clientId` + `companyId` (portal user).
 */
export const TokenPayloadSchema: z.ZodType<TokenPayload> = z
  .object({
    baseUrl: z.string().optional(),
    clientId: z.string().optional(),
    companyId: z.string().optional(),
    internalUserId: z.string().optional(),
    notificationId: z.string().optional(),
    tokenId: z.string().optional(),
    workspaceId: z.string().min(1),
  })
  .refine(
    (val) =>
      val.internalUserId !== undefined ||
      (val.clientId !== undefined && val.companyId !== undefined),
    {
      message:
        "Token must contain either internalUserId, or clientId and companyId",
    }
  );
