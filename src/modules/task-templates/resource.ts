import { buildSearchParams } from "src/assembly-kit/build-search-params";
import { parseResponse } from "src/assembly-kit/parse-response";
import type { Transport } from "src/transport/http";

import type { TaskTemplateResponse, TaskTemplatesResponse } from "./schema";
import {
  TaskTemplateResponseSchema,
  TaskTemplatesResponseSchema,
} from "./schema";

export class TaskTemplatesResource {
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

  /** List task templates. */
  async list(args?: {
    nextToken?: string;
    limit?: number;
  }): Promise<TaskTemplatesResponse> {
    const raw = await this.#transport.get<unknown>("v1/task-templates", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: TaskTemplatesResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single task template by ID. */
  async get(id: string): Promise<TaskTemplateResponse> {
    const raw = await this.#transport.get<unknown>(`v1/task-templates/${id}`);
    return parseResponse({
      data: raw,
      schema: TaskTemplateResponseSchema,
      validate: this.#validate,
    });
  }
}
