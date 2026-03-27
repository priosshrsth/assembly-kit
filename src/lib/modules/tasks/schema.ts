import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export type TaskStatus = "done" | "inProgress" | "todo";

export const TaskStatusSchema: z.ZodType<TaskStatus> = z.enum(["todo", "inProgress", "done"]);

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
  updatedAt?: string;
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
  updatedAt: z.iso.datetime().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const TaskResponseSchema: z.ZodType<Task> = TaskSchema;
export type TaskResponse = Task;

export interface TasksResponse {
  data: Task[] | null;
  nextToken?: string;
}

export const TasksResponseSchema: z.ZodType<TasksResponse> = z.object({
  data: z.array(TaskSchema).nullable(),
  nextToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

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
