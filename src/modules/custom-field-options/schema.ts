import { z } from "zod";

// ─── Base ─────────────────────────────────────────────────────────────────────

/** A selectable option for multi-select custom fields. */
export interface CustomFieldOption {
  id: string;
  key: string;
  label: string;
  color: string;
}

export const CustomFieldOptionSchema: z.ZodType<CustomFieldOption> = z.object({
  color: z.string(),
  id: z.string(),
  key: z.string(),
  label: z.string(),
});

// ─── Response ─────────────────────────────────────────────────────────────────

export interface ListCustomFieldOptionResponse {
  data: CustomFieldOption[];
}

export const ListCustomFieldOptionResponseSchema: z.ZodType<ListCustomFieldOptionResponse> =
  z.object({
    data: z.array(CustomFieldOptionSchema),
  });
