import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const SubscriptionResponseSchema: z.ZodType<Subscription> = SubscriptionSchema;
export type SubscriptionResponse = Subscription;

export interface SubscriptionsResponse {
  data: Subscription[] | null;
  nextToken?: string;
}

export const SubscriptionsResponseSchema: z.ZodType<SubscriptionsResponse> = z.object({
  data: z.array(SubscriptionSchema).nullable(),
  nextToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface SubscriptionCreateRequest {
  clientId: string;
  companyId?: string;
}

export const SubscriptionCreateRequestSchema: z.ZodType<SubscriptionCreateRequest> = z.object({
  clientId: z.string(),
  companyId: z.string().optional(),
});
