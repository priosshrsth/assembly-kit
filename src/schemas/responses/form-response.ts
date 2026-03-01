import { FormResponseSchema } from "src/schemas/base/form-response";
import type { FormResponse } from "src/schemas/base/form-response";
import { z } from "zod";

export { FormResponseSchema as FormResponseItemResponseSchema };
export type { FormResponse as FormResponseItemResponse };

export interface FormResponsesResponse {
  data: FormResponse[] | null;
}

export const FormResponsesResponseSchema: z.ZodType<FormResponsesResponse> =
  z.object({
    data: z.array(FormResponseSchema).nullable(),
  });
