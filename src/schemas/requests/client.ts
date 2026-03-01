import { z } from "zod";

export interface ClientCreateRequest {
  companyIds?: string[];
  customFields?: Record<string, unknown>;
  email: string;
  familyName: string;
  givenName: string;
}

export const ClientCreateRequestSchema: z.ZodType<ClientCreateRequest> =
  z.object({
    companyIds: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.unknown()).optional(),
    email: z.email(),
    familyName: z.string(),
    givenName: z.string(),
  });

export interface ClientUpdateRequest {
  companyIds?: string[];
  customFields?: Record<string, unknown>;
  email?: string;
  familyName?: string;
  givenName?: string;
}

export const ClientUpdateRequestSchema: z.ZodType<ClientUpdateRequest> =
  z.object({
    companyIds: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.unknown()).optional(),
    email: z.string().optional(),
    familyName: z.string().optional(),
    givenName: z.string().optional(),
  });
