import { z } from "zod";

export type ContractStatus = "pending" | "signed";

export const ContractStatusSchema: z.ZodType<ContractStatus> = z.enum([
  "pending",
  "signed",
]);

export type ContractFieldInputType =
  | "autoFill"
  | "client"
  | "fixed"
  | "variable";

export const ContractFieldInputTypeSchema: z.ZodType<ContractFieldInputType> =
  z.enum(["fixed", "autoFill", "client", "variable"]);

export interface ContractField {
  id?: string;
  inputType?: ContractFieldInputType;
  isOptional?: boolean;
  label?: string;
  page?: number;
  type?: string;
  value?: string;
}

export const ContractFieldSchema: z.ZodType<ContractField> = z.object({
  id: z.string().optional(),
  inputType: ContractFieldInputTypeSchema.optional(),
  isOptional: z.boolean().optional(),
  label: z.string().optional(),
  page: z.number().optional(),
  type: z.string().optional(),
  value: z.string().optional(),
});

export interface Contract {
  clientId?: string;
  companyId?: string;
  contractTemplateId?: string;
  createdAt: string;
  fields?: ContractField[];
  fileUrl?: string;
  id: string;
  name?: string;
  object: "contract";
  /** @deprecated Use `clientId`/`companyId` instead. */
  recipientId?: string;
  shareDate?: string;
  signedFileUrl?: string;
  status?: ContractStatus;
  updatedAt: string;
}

export const ContractSchema: z.ZodType<Contract> = z.object({
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  contractTemplateId: z.string().optional(),
  createdAt: z.iso.datetime(),
  fields: z.array(ContractFieldSchema).optional(),
  fileUrl: z.string().optional(),
  id: z.string(),
  name: z.string().optional(),
  object: z.literal("contract"),
  recipientId: z.string().optional(),
  shareDate: z.string().optional(),
  signedFileUrl: z.string().optional(),
  status: ContractStatusSchema.optional(),
  updatedAt: z.iso.datetime(),
});
