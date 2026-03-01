import { TaskSchema } from "src/schemas/base/task";
import type { Task } from "src/schemas/base/task";
import { z } from "zod";

export { TaskSchema as TaskResponseSchema };
export type { Task as TaskResponse };

export interface TasksResponse {
  data: Task[] | null;
}

export const TasksResponseSchema: z.ZodType<TasksResponse> = z.object({
  data: z.array(TaskSchema).nullable(),
});
