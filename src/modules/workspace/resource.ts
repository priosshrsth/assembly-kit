import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { WorkspaceResponse } from "./schema";
import { WorkspaceResponseSchema } from "./schema";

export class WorkspaceResource {
  readonly #transport: Transport;
  readonly #validate: boolean;

  constructor({
    transport,
    validateResponses,
  }: {
    transport: Transport;
    validateResponses: boolean;
  }) {
    this.#transport = transport;
    this.#validate = validateResponses;
  }

  /** Retrieve the current workspace. */
  async get(): Promise<WorkspaceResponse> {
    const raw = await this.#transport.get<unknown>("v1/workspaces");
    return parseResponse({
      data: raw,
      schema: WorkspaceResponseSchema,
      validate: this.#validate,
    });
  }
}
