import { AppConnectionSchema } from "src/schemas/base/app-connection";
import type { AppConnection } from "src/schemas/base/app-connection";
import { z } from "zod";

export { AppConnectionSchema as AppConnectionResponseSchema };
export type { AppConnection as AppConnectionResponse };

export interface AppConnectionsResponse {
  data: AppConnection[] | null;
}

export const AppConnectionsResponseSchema: z.ZodType<AppConnectionsResponse> =
  z.object({
    data: z.array(AppConnectionSchema).nullable(),
  });
