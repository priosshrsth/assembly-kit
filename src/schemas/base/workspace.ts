import { z } from "zod";

export interface Workspace {
  brandName?: string;
  font?: string;
  id: string;
  industry?: string;
  labels?: {
    groupTerm?: string;
    groupTermPlural?: string;
    individualTerm?: string;
    individualTermPlural?: string;
  };
  portalUrl: string;
}

export const WorkspaceSchema: z.ZodType<Workspace> = z.object({
  brandName: z.string().optional(),
  font: z.string().optional(),
  id: z.string(),
  industry: z.string().optional(),
  labels: z
    .object({
      groupTerm: z.string().optional(),
      groupTermPlural: z.string().optional(),
      individualTerm: z.string().optional(),
      individualTermPlural: z.string().optional(),
    })
    .optional(),
  portalUrl: z.string(),
});
