import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { TaskResponseSchema, TasksResponseSchema } from "./schema";
import type { Task, TaskCreateRequest, TaskUpdateRequest, TasksResponse } from "./schema";

export interface ListTasksArgs extends ListArgs {
  clientId?: string;
  companyId?: string;
  status?: string;
}

export class TasksResource extends BaseResource {
  /** Create a task. */
  async create(body: TaskCreateRequest): Promise<Task> {
    const raw = await this.sdk.createTask({ requestBody: body });
    return this.parse(TaskResponseSchema, raw);
  }

  /** List tasks with optional filters. Note: SDK method is named `retrieveTasks`. */
  async list(args: ListTasksArgs = {}): Promise<TasksResponse> {
    const raw = await this.sdk.retrieveTasks(args);
    return this.parse(TasksResponseSchema, raw);
  }

  /** Retrieve a single task by ID. */
  async retrieve(id: string): Promise<Task> {
    const raw = await this.sdk.retrieveTask({ id });
    return this.parse(TaskResponseSchema, raw);
  }

  /** Update a task. */
  async update(args: { id: string; body: TaskUpdateRequest }): Promise<Task> {
    const raw = await this.sdk.updateTask({
      id: args.id,
      requestBody: args.body,
    });
    return this.parse(TaskResponseSchema, raw);
  }

  /** Delete a task by ID. */
  async delete(id: string): Promise<void> {
    await this.sdk.deleteTask({ id });
  }

  /** Iterate over all tasks, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListTasksArgs, "nextToken"> = {}): Promise<Task[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
