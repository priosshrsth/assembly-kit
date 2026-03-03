import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export type AppInstallType =
  | "core"
  | "custom"
  | "embed"
  | "link"
  | "manual"
  | "marketplace";

export const AppInstallTypeSchema: z.ZodType<AppInstallType> = z.enum([
  "core",
  "custom",
  "embed",
  "link",
  "manual",
  "marketplace",
]);

export interface AppInstall {
  appId?: string;
  displayName?: string;
  id: string;
  object: "appInstall";
  type?: AppInstallType;
}

export const AppInstallSchema: z.ZodType<AppInstall> = z.object({
  appId: z.string().optional(),
  displayName: z.string().optional(),
  id: z.string(),
  object: z.literal("appInstall"),
  type: AppInstallTypeSchema.optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const AppInstallResponseSchema: z.ZodType<AppInstall> = AppInstallSchema;
export type AppInstallResponse = AppInstall;

export interface AppInstallsResponse {
  data: AppInstall[] | null;
}

export const AppInstallsResponseSchema: z.ZodType<AppInstallsResponse> =
  z.object({
    data: z.array(AppInstallSchema).nullable(),
  });
