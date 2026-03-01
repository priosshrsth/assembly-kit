import { ClientSchema } from "src/schemas/base/client";
import type { Client } from "src/schemas/base/client";
import { z } from "zod";

export { ClientSchema as ClientResponseSchema };
export type { Client as ClientResponse };

export interface ClientsResponse {
  data: Client[] | null;
}

export const ClientsResponseSchema: z.ZodType<ClientsResponse> = z.object({
  data: z.array(ClientSchema).nullable(),
});
