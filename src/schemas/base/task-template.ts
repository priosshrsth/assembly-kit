import { z } from "zod";

export interface TaskTemplate {
  createdAt: string;
  description?: string;
  id: string;
  object: "taskTemplate";
  title?: string;
  updatedAt: string;
}

export const TaskTemplateSchema: z.ZodType<TaskTemplate> = z.object({
  createdAt: z.iso.datetime(),
  description: z.string().optional(),
  id: z.string(),
  object: z.literal("taskTemplate"),
  title: z.string().optional(),
  updatedAt: z.iso.datetime(),
});
