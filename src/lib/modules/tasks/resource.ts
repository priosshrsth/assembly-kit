import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { TaskResponseSchema, TasksResponseSchema } from "./schema";
import type { Task, TaskCreateRequest, TaskUpdateRequest, TasksResponse } from "./schema";

export interface ListTasksArgs extends ListArgs {
  clientId?: string;
  companyId?: string;
  status?: string;
}

export class TasksResource {
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

  /** Create a task. */
  async create(body: TaskCreateRequest): Promise<Task> {
    const raw: unknown = await this.#transport.post("v1/tasks", body);
    return parseResponse({ schema: TaskResponseSchema, data: raw, validate: this.#validate });
  }

  /** List tasks with optional filters. */
  async list(args: ListTasksArgs = {}): Promise<TasksResponse> {
    const raw: unknown = await this.#transport.get("v1/tasks", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: TasksResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single task by ID. */
  async retrieve(id: string): Promise<Task> {
    const raw: unknown = await this.#transport.get(`v1/tasks/${id}`);
    return parseResponse({ schema: TaskResponseSchema, data: raw, validate: this.#validate });
  }

  /** Update a task. */
  async update(args: { id: string; body: TaskUpdateRequest }): Promise<Task> {
    const raw: unknown = await this.#transport.patch(`v1/tasks/${args.id}`, args.body);
    return parseResponse({ schema: TaskResponseSchema, data: raw, validate: this.#validate });
  }

  /** Delete a task by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/tasks/${id}`);
  }

  /** Iterate over all tasks, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListTasksArgs, "nextToken"> = {}): Promise<Task[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
