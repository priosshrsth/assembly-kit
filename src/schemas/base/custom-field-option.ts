import { z } from "zod";

/** A selectable option for multi-select custom fields. */
export interface CustomFieldOption {
  id: string;
  key: string;
  label: string;
  object: "customFieldOption";
}

export const CustomFieldOptionSchema: z.ZodType<CustomFieldOption> = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  object: z.literal("customFieldOption"),
});
