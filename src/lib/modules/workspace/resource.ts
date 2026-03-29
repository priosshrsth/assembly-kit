import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { WorkspaceResponseSchema } from "./schema";
import type { Workspace } from "./schema";

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
  async retrieve(): Promise<Workspace> {
    const raw: unknown = await this.#transport.get("v1/workspaces");
    return parseResponse({ schema: WorkspaceResponseSchema, data: raw, validate: this.#validate });
  }
}
