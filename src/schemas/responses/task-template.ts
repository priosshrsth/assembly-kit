import { TaskTemplateSchema } from "src/schemas/base/task-template";
import type { TaskTemplate } from "src/schemas/base/task-template";
import { z } from "zod";

export { TaskTemplateSchema as TaskTemplateResponseSchema };
export type { TaskTemplate as TaskTemplateResponse };

export interface TaskTemplatesResponse {
  data: TaskTemplate[] | null;
}

export const TaskTemplatesResponseSchema: z.ZodType<TaskTemplatesResponse> =
  z.object({
    data: z.array(TaskTemplateSchema).nullable(),
  });
