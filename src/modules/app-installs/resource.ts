import { BaseResource } from "src/assembly-kit/base-resource";

import { AppInstallResponseSchema, AppInstallsResponseSchema } from "./schema";
import type { AppInstall, AppInstallsResponse } from "./schema";

export class AppInstallsResource extends BaseResource {
  /** List all app installs. SDK returns a flat array; we wrap it for consistency. */
  async list(): Promise<AppInstallsResponse> {
    const raw = await this.sdk.listAppInstalls();
    return this.parse(AppInstallsResponseSchema, { data: raw });
  }

  /** Retrieve a single app install by ID. */
  async retrieve(installId: string): Promise<AppInstall> {
    const raw = await this.sdk.retrieveAppInstall({ installId });
    return this.parse(AppInstallResponseSchema, raw);
  }
}
