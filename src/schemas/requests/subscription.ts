import { z } from "zod";

export interface SubscriptionCreateRequest {
  clientId: string;
  companyId?: string;
}

export const SubscriptionCreateRequestSchema: z.ZodType<SubscriptionCreateRequest> =
  z.object({
    clientId: z.string(),
    companyId: z.string().optional(),
  });
