import { HexColorSchema } from "src/schemas/base/hex-color";
import type { HexColor } from "src/schemas/base/hex-color";
import { z } from "zod";

export interface CompanyCreateRequest {
  customFields?: Record<string, unknown>;
  fallbackColor?: HexColor;
  iconImageUrl?: string;
  name: string;
}

export const CompanyCreateRequestSchema: z.ZodType<CompanyCreateRequest> =
  z.object({
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

export const CompanyUpdateRequestSchema: z.ZodType<CompanyUpdateRequest> =
  z.object({
    customFields: z.record(z.string(), z.unknown()).optional(),
    iconImageUrl: z.string().optional(),
    name: z.string().optional(),
  });
