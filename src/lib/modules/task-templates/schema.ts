import { z } from "zod";

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface TaskTemplate {
  createdAt: string;
  description?: string;
  id: string;
  object: "taskTemplate";
  title?: string;
  updatedAt?: string;
}

export const TaskTemplateSchema: z.ZodType<TaskTemplate> = z.object({
  createdAt: z.iso.datetime(),
  description: z.string().optional(),
  id: z.string(),
  object: z.literal("taskTemplate"),
  title: z.string().optional(),
  updatedAt: z.iso.datetime().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const TaskTemplateResponseSchema: z.ZodType<TaskTemplate> = TaskTemplateSchema;
export type TaskTemplateResponse = TaskTemplate;

export interface TaskTemplatesResponse {
  data: TaskTemplate[] | null;
  nextToken?: string;
}

export const TaskTemplatesResponseSchema: z.ZodType<TaskTemplatesResponse> = z.object({
  data: z.array(TaskTemplateSchema).nullable(),
  nextToken: z.string().optional(),
});
