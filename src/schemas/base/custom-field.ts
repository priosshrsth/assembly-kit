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
  order: number;
  type: CustomFieldType;
}

export const CustomFieldSchema: z.ZodType<CustomField> = z.object({
  entityType: CustomFieldEntityTypeSchema,
  id: z.string(),
  key: z.string(),
  name: z.string(),
  object: z.literal("customField"),
  order: z.number(),
  type: CustomFieldTypeSchema,
});
