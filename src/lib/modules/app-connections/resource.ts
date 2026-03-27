import { BaseResource } from "src/client/base-resource";

import { AppConnectionResponseSchema, AppConnectionsResponseSchema } from "./schema";
import type { AppConnection, AppConnectionCreateRequest, AppConnectionsResponse } from "./schema";

export class AppConnectionsResource extends BaseResource {
  /** Create an app connection for a manual app install. */
  async create(args: {
    installId: string;
    body: AppConnectionCreateRequest;
  }): Promise<AppConnection> {
    const raw = await this.sdk.createAppConnection({
      installId: args.installId,
      requestBody: args.body,
    });
    return this.parse(AppConnectionResponseSchema, raw);
  }

  /** List app connections for an install. */
  async list(args: {
    installId: string;
    clientId?: string;
    companyId?: string;
  }): Promise<AppConnectionsResponse> {
    const raw = await this.sdk.listAppConnections(args);
    return this.parse(AppConnectionsResponseSchema, { data: raw });
  }
}
