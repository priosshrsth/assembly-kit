// Base schemas
export { CompanySchema } from "src/schemas/base/company";
export type { Company } from "src/schemas/base/company";

export { ClientSchema } from "src/schemas/base/client";
export type { Client } from "src/schemas/base/client";

export { InternalUserSchema } from "src/schemas/base/internal-user";
export type { InternalUser } from "src/schemas/base/internal-user";

export { WorkspaceSchema } from "src/schemas/base/workspace";
export type { Workspace } from "src/schemas/base/workspace";

export {
  CustomFieldEntityTypeSchema,
  CustomFieldSchema,
  CustomFieldTypeSchema,
} from "src/schemas/base/custom-field";
export type {
  CustomField,
  CustomFieldEntityType,
  CustomFieldType,
} from "src/schemas/base/custom-field";

export { TokenPayloadSchema } from "src/schemas/base/token";
export type { TokenPayload } from "src/schemas/base/token";

export { HexColorSchema } from "src/schemas/base/hex-color";
export type { HexColor } from "src/schemas/base/hex-color";

// Response schemas
export {
  CompaniesResponseSchema,
  CompanyResponseSchema,
} from "src/schemas/responses/company";
export type {
  CompaniesResponse,
  CompanyResponse,
} from "src/schemas/responses/company";

export {
  ClientResponseSchema,
  ClientsResponseSchema,
} from "src/schemas/responses/client";
export type {
  ClientResponse,
  ClientsResponse,
} from "src/schemas/responses/client";

export {
  InternalUserResponseSchema,
  InternalUsersResponseSchema,
} from "src/schemas/responses/internal-user";
export type {
  InternalUserResponse,
  InternalUsersResponse,
} from "src/schemas/responses/internal-user";

export { WorkspaceResponseSchema } from "src/schemas/responses/workspace";
export type { WorkspaceResponse } from "src/schemas/responses/workspace";

export { NotificationsResponseSchema } from "src/schemas/responses/notification";
export type { NotificationsResponse } from "src/schemas/responses/notification";

export { ListCustomFieldResponseSchema } from "src/schemas/responses/custom-field";
export type { ListCustomFieldResponse } from "src/schemas/responses/custom-field";

export {
  TaskStatusSchema,
  TasksResponseSchema,
} from "src/schemas/responses/task";
export type { TaskStatus, TasksResponse } from "src/schemas/responses/task";

// Request schemas
export {
  CompanyCreateRequestSchema,
  CompanyUpdateRequestSchema,
} from "src/schemas/requests/company";
export type {
  CompanyCreateRequest,
  CompanyUpdateRequest,
} from "src/schemas/requests/company";

export {
  ClientCreateRequestSchema,
  ClientUpdateRequestSchema,
} from "src/schemas/requests/client";
export type {
  ClientCreateRequest,
  ClientUpdateRequest,
} from "src/schemas/requests/client";

export { NotificationRequestBodySchema } from "src/schemas/requests/notification";
export type { NotificationRequestBody } from "src/schemas/requests/notification";
