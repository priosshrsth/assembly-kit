import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { TaskTemplateResponseSchema, TaskTemplatesResponseSchema } from "./schema";
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
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<TaskTemplate[]> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
