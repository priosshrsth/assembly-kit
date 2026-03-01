import { SubscriptionSchema } from "src/schemas/base/subscription";
import type { Subscription } from "src/schemas/base/subscription";
import { z } from "zod";

export { SubscriptionSchema as SubscriptionResponseSchema };
export type { Subscription as SubscriptionResponse };

export interface SubscriptionsResponse {
  data: Subscription[] | null;
}

export const SubscriptionsResponseSchema: z.ZodType<SubscriptionsResponse> =
  z.object({
    data: z.array(SubscriptionSchema).nullable(),
  });
