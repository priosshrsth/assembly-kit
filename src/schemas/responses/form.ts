import { FormSchema } from "src/schemas/base/form";
import type { Form } from "src/schemas/base/form";
import { z } from "zod";

export { FormSchema as FormDataResponseSchema };
export type { Form as FormDataResponse };

export interface FormsDataResponse {
  data: Form[] | null;
}

export const FormsDataResponseSchema: z.ZodType<FormsDataResponse> = z.object({
  data: z.array(FormSchema).nullable(),
});
