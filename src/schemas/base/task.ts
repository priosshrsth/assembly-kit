import { z } from "zod";

export type TaskStatus = "done" | "inProgress" | "todo";

export const TaskStatusSchema: z.ZodType<TaskStatus> = z.enum([
  "todo",
  "inProgress",
  "done",
]);

export interface Task {
  assigneeId?: string;
  assigneeType?: string;
  createdAt: string;
  createdBy?: string;
  description?: string;
  dueDate?: string | null;
  id: string;
  object: "task";
  status?: TaskStatus;
  title?: string;
  updatedAt: string;
}

export const TaskSchema: z.ZodType<Task> = z.object({
  assigneeId: z.string().optional(),
  assigneeType: z.string().optional(),
  createdAt: z.iso.datetime(),
  createdBy: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  id: z.string(),
  object: z.literal("task"),
  status: TaskStatusSchema.optional(),
  title: z.string().optional(),
  updatedAt: z.iso.datetime(),
});
