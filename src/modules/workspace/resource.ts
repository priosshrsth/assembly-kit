import { BaseResource } from "src/assembly-kit/base-resource";

import { WorkspaceResponseSchema } from "./schema";
import type { Workspace } from "./schema";

export class WorkspaceResource extends BaseResource {
  /** Retrieve the current workspace. */
  async retrieve(): Promise<Workspace> {
    const raw = await this.sdk.retrieveWorkspace();
    return this.parse(WorkspaceResponseSchema, raw);
  }
}
