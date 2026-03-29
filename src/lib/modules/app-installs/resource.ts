import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { AppInstallResponseSchema, AppInstallsResponseSchema } from "./schema";
import type { AppInstall, AppInstallsResponse } from "./schema";

export class AppInstallsResource {
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

  /** List all app installs. */
  async list(): Promise<AppInstallsResponse> {
    const raw: unknown = await this.#transport.get("v1/installs");
    return parseResponse({
      schema: AppInstallsResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single app install by ID. */
  async retrieve(installId: string): Promise<AppInstall> {
    const raw: unknown = await this.#transport.get(`v1/installs/${installId}`);
    return parseResponse({ schema: AppInstallResponseSchema, data: raw, validate: this.#validate });
  }
}
