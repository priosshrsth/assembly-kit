import { z } from "zod";

export type TaskStatus = "completed" | "inProgress" | "todo";

export const TaskStatusSchema: z.ZodType<TaskStatus> = z.enum([
  "todo",
  "inProgress",
  "completed",
]);

export interface TasksResponse {
  data: { status: TaskStatus }[];
}

export const TasksResponseSchema: z.ZodType<TasksResponse> = z.object({
  data: z
    .object({
      status: TaskStatusSchema,
    })
    .array(),
});
