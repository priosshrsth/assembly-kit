import { CustomFieldOptionSchema } from "src/schemas/base/custom-field-option";
import type { CustomFieldOption } from "src/schemas/base/custom-field-option";
import { z } from "zod";

export interface ListCustomFieldOptionResponse {
  data: CustomFieldOption[];
}

export const ListCustomFieldOptionResponseSchema: z.ZodType<ListCustomFieldOptionResponse> =
  z.object({
    data: z.array(CustomFieldOptionSchema),
  });
