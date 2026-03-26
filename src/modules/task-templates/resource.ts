import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import {
  TaskTemplateResponseSchema,
  TaskTemplatesResponseSchema,
} from "./schema";
import type { TaskTemplate, TaskTemplatesResponse } from "./schema";

export class TaskTemplatesResource extends BaseResource {
  /** List task templates. */
  async list(args: ListArgs = {}): Promise<TaskTemplatesResponse> {
    const raw = await this.sdk.listTaskTemplates(args);
    return this.parse(TaskTemplatesResponseSchema, raw);
  }

  /** Retrieve a single task template by ID. */
  async retrieve(id: string): Promise<TaskTemplate> {
    const raw = await this.sdk.retrieveTaskTemplate({ id });
    return this.parse(TaskTemplateResponseSchema, raw);
  }

  /** Iterate over all task templates, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListArgs, "nextToken"> = {}
  ): AsyncGenerator<TaskTemplate> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
