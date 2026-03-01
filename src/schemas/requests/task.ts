import type { TaskStatus } from "src/schemas/base/task";
import { TaskStatusSchema } from "src/schemas/base/task";
import { z } from "zod";

export interface TaskCreateRequest {
  assigneeId?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  title: string;
}

export const TaskCreateRequestSchema: z.ZodType<TaskCreateRequest> = z.object({
  assigneeId: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: TaskStatusSchema.optional(),
  title: z.string(),
});

export interface TaskUpdateRequest {
  assigneeId?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  title?: string;
}

export const TaskUpdateRequestSchema: z.ZodType<TaskUpdateRequest> = z.object({
  assigneeId: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: TaskStatusSchema.optional(),
  title: z.string().optional(),
});
