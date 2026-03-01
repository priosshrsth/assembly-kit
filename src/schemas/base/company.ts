import { z } from "zod";

export interface Company {
  createdAt: string;
  customFields?: Record<string, unknown> | null;
  fallbackColor?: string | null;
  iconImageUrl?: string | null;
  id: string;
  isPlaceholder: boolean;
  name: string;
  object: "company";
  updatedAt: string;
}

export const CompanySchema: z.ZodType<Company> = z.object({
  createdAt: z.iso.datetime(),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
  fallbackColor: z.string().nullable().optional(),
  iconImageUrl: z.string().nullable().optional(),
  id: z.string(),
  isPlaceholder: z.boolean(),
  name: z.string(),
  object: z.literal("company"),
  updatedAt: z.iso.datetime(),
});
