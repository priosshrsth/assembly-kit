import { CustomFieldSchema } from "src/schemas/base/custom-field";
import type { CustomField } from "src/schemas/base/custom-field";
import { z } from "zod";

export interface ListCustomFieldResponse {
  data: CustomField[];
}

export const ListCustomFieldResponseSchema: z.ZodType<ListCustomFieldResponse> =
  z.object({
    data: z.array(CustomFieldSchema),
  });
