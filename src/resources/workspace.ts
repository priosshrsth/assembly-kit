import { parseResponse } from "src/client/parse-response";
import type { WorkspaceResponse } from "src/schemas/responses/workspace";
import { WorkspaceResponseSchema } from "src/schemas/responses/workspace";
import type { Transport } from "src/transport/http";

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
