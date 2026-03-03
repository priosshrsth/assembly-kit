import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface SubscriptionTemplate {
  createdAt: string;
  id: string;
  name?: string;
  object: "subscriptionTemplate";
  updatedAt: string;
}

export const SubscriptionTemplateSchema: z.ZodType<SubscriptionTemplate> =
  z.object({
    createdAt: z.iso.datetime(),
    id: z.string(),
    name: z.string().optional(),
    object: z.literal("subscriptionTemplate"),
    updatedAt: z.iso.datetime(),
  });

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const SubscriptionTemplateResponseSchema: z.ZodType<SubscriptionTemplate> =
  SubscriptionTemplateSchema;
export type SubscriptionTemplateResponse = SubscriptionTemplate;

export interface SubscriptionTemplatesResponse {
  data: SubscriptionTemplate[] | null;
}

export const SubscriptionTemplatesResponseSchema: z.ZodType<SubscriptionTemplatesResponse> =
  z.object({
    data: z.array(SubscriptionTemplateSchema).nullable(),
  });
