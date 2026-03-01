import { AppInstallSchema } from "src/schemas/base/app-install";
import type { AppInstall } from "src/schemas/base/app-install";
import { z } from "zod";

export { AppInstallSchema as AppInstallResponseSchema };
export type { AppInstall as AppInstallResponse };

export interface AppInstallsResponse {
  data: AppInstall[] | null;
}

export const AppInstallsResponseSchema: z.ZodType<AppInstallsResponse> =
  z.object({
    data: z.array(AppInstallSchema).nullable(),
  });
