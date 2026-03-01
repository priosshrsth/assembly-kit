import { PaymentSchema } from "src/schemas/base/payment";
import type { Payment } from "src/schemas/base/payment";
import { z } from "zod";

export { PaymentSchema as PaymentResponseSchema };
export type { Payment as PaymentResponse };

export interface PaymentsResponse {
  data: Payment[] | null;
}

export const PaymentsResponseSchema: z.ZodType<PaymentsResponse> = z.object({
  data: z.array(PaymentSchema).nullable(),
});
