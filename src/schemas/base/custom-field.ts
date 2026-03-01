import { z } from "zod";

export type CustomFieldType =
  | "address"
  | "email"
  | "multiSelect"
  | "number"
  | "phoneNumber"
  | "text"
  | "url";

export const CustomFieldTypeSchema: z.ZodType<CustomFieldType> = z.enum([
  "address",
  "email",
  "phoneNumber",
  "text",
  "number",
  "url",
  "multiSelect",
]);

export type CustomFieldEntityType = "client" | "company";

export const CustomFieldEntityTypeSchema: z.ZodType<CustomFieldEntityType> =
  z.enum(["client", "company"]);

export interface CustomField {
  entityType: CustomFieldEntityType;
  id: string;
  key: string;
  name: string;
  object: "customField";
  order?: number;
  type: CustomFieldType;
}

export const CustomFieldSchema: z.ZodType<CustomField> = z.object({
  entityType: CustomFieldEntityTypeSchema,
  id: z.string(),
  key: z.string(),
  name: z.string(),
  object: z.literal("customField"),
  order: z.number().optional(),
  type: CustomFieldTypeSchema,
});

// ─── Custom field value types ─────────────────────────────────────────────────

export interface AddressValue {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country: string;
  fullAddress: string;
  postalCode?: string;
  region?: string;
}

export const AddressValueSchema: z.ZodType<AddressValue> = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  country: z.string(),
  fullAddress: z.string(),
  postalCode: z.string().optional(),
  region: z.string().optional(),
});

/**
 * Union of all possible custom field values.
 * Order matters: number and string[] are tried before string to avoid
 * early matching on a less-specific branch.
 */
export type CustomFieldValue = AddressValue | number | string | string[];

export const CustomFieldValueSchema: z.ZodType<CustomFieldValue> = z.union([
  z.number(),
  z.array(z.string()),
  AddressValueSchema,
  z.string(),
]);
