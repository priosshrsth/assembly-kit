import { z } from "zod";

export interface Subscription {
  clientId?: string;
  companyId?: string;
  createdAt: string;
  id: string;
  interval?: string;
  object: "subscription";
  /** @deprecated Use `clientId`/`companyId` instead. */
  recipientId?: string;
  status?: string;
  updatedAt: string;
}

export const SubscriptionSchema: z.ZodType<Subscription> = z.object({
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  interval: z.string().optional(),
  object: z.literal("subscription"),
  recipientId: z.string().optional(),
  status: z.string().optional(),
  updatedAt: z.iso.datetime(),
});
