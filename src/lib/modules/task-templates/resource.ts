import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { TaskTemplateResponseSchema, TaskTemplatesResponseSchema } from "./schema";
import type { TaskTemplate, TaskTemplatesResponse } from "./schema";

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
  async list(args: ListArgs = {}): Promise<TaskTemplatesResponse> {
    const raw: unknown = await this.#transport.get("v1/task-templates", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: TaskTemplatesResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single task template by ID. */
  async retrieve(id: string): Promise<TaskTemplate> {
    const raw: unknown = await this.#transport.get(`v1/task-templates/${id}`);
    return parseResponse({
      schema: TaskTemplateResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all task templates, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<TaskTemplate[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
