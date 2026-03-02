import { buildSearchParams } from "src/client/build-search-params";
import { parseResponse } from "src/client/parse-response";
import type {
  TaskCreateRequest,
  TaskUpdateRequest,
} from "src/schemas/requests/task";
import type { TaskResponse, TasksResponse } from "src/schemas/responses/task";
import {
  TaskResponseSchema,
  TasksResponseSchema,
} from "src/schemas/responses/task";
import type { Transport } from "src/transport/http";

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

  /** List tasks with optional filters. */
  async list(args?: {
    createdBy?: string;
    parentTaskId?: string;
    status?: string;
    clientId?: string;
    internalUserId?: string;
    companyId?: string;
    nextToken?: string;
    limit?: number;
  }): Promise<TasksResponse> {
    const raw = await this.#transport.get<unknown>("v1/tasks", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      data: raw,
      schema: TasksResponseSchema,
      validate: this.#validate,
    });
  }

  /** Get a single task by ID. */
  async get(id: string): Promise<TaskResponse> {
    const raw = await this.#transport.get<unknown>(`v1/tasks/${id}`);
    return parseResponse({
      data: raw,
      schema: TaskResponseSchema,
      validate: this.#validate,
    });
  }

  /** Create a new task. */
  async create(body: TaskCreateRequest): Promise<TaskResponse> {
    const raw = await this.#transport.post<unknown>("v1/tasks", body);
    return parseResponse({
      data: raw,
      schema: TaskResponseSchema,
      validate: this.#validate,
    });
  }

  /** Update an existing task. */
  async update({
    id,
    body,
  }: {
    id: string;
    body: TaskUpdateRequest;
  }): Promise<TaskResponse> {
    const raw = await this.#transport.patch<unknown>(`v1/tasks/${id}`, body);
    return parseResponse({
      data: raw,
      schema: TaskResponseSchema,
      validate: this.#validate,
    });
  }

  /** Delete a task by ID. */
  async delete(id: string): Promise<void> {
    await this.#transport.delete(`v1/tasks/${id}`);
  }
}
