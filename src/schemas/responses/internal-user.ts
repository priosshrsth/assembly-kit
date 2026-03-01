import { InternalUserSchema } from "src/schemas/base/internal-user";
import type { InternalUser } from "src/schemas/base/internal-user";
import { z } from "zod";

export { InternalUserSchema as InternalUserResponseSchema };
export type { InternalUser as InternalUserResponse };

export interface InternalUsersResponse {
  data: InternalUser[];
}

export const InternalUsersResponseSchema: z.ZodType<InternalUsersResponse> =
  z.object({
    data: z.array(InternalUserSchema),
  });
