import { HexColorSchema } from "src/schemas/shared/hex-color";
import type { HexColor } from "src/schemas/shared/hex-color";
import { z } from "zod";

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface Company<TCustomFields extends Record<string, unknown> = Record<string, unknown>> {
  createdAt: string;
  customFields?: TCustomFields | null;
  fallbackColor?: string | null;
  iconImageUrl?: string | null;
  id: string;
  isPlaceholder: boolean;
  name: string;
  object: "company";
  updatedAt?: string;
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
  updatedAt: z.iso.datetime().optional(),
});

// ─── Response ─────────────────────────────────────────────────────────────────

export const CompanyResponseSchema: z.ZodType<Company> = CompanySchema;
export type CompanyResponse = Company;

export interface CompaniesResponse {
  data: Company[] | null;
  nextToken?: string;
}

export const CompaniesResponseSchema: z.ZodType<CompaniesResponse> = z.object({
  data: z.array(CompanySchema).nullable(),
  nextToken: z.string().optional(),
});

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface CompanyCreateRequest {
  customFields?: Record<string, unknown>;
  fallbackColor?: HexColor;
  iconImageUrl?: string;
  name: string;
}

export const CompanyCreateRequestSchema: z.ZodType<CompanyCreateRequest> = z.object({
  customFields: z.record(z.string(), z.unknown()).optional(),
  fallbackColor: HexColorSchema.optional(),
  iconImageUrl: z.string().optional(),
  name: z.string(),
});

export interface CompanyUpdateRequest {
  customFields?: Record<string, unknown>;
  iconImageUrl?: string;
  name?: string;
}

export const CompanyUpdateRequestSchema: z.ZodType<CompanyUpdateRequest> = z.object({
  customFields: z.record(z.string(), z.unknown()).optional(),
  iconImageUrl: z.string().optional(),
  name: z.string().optional(),
});
