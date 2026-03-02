import { ClientsResource } from "src/resources/clients";
import { CompaniesResource } from "src/resources/companies";
import { CustomFieldsResource } from "src/resources/custom-fields";
import { InternalUsersResource } from "src/resources/internal-users";
import { NotificationsResource } from "src/resources/notifications";
import { TasksResource } from "src/resources/tasks";
import { WorkspaceResource } from "src/resources/workspace";
import type { Transport } from "src/transport/http";

export interface ResourceContext {
  transport: Transport;
  validateResponses: boolean;
  token?: string;
}

export class AssemblyClient {
  readonly workspace: WorkspaceResource;
  readonly clients: ClientsResource;
  readonly companies: CompaniesResource;
  readonly internalUsers: InternalUsersResource;
  readonly notifications: NotificationsResource;
  readonly customFields: CustomFieldsResource;
  readonly tasks: TasksResource;

  constructor(context: ResourceContext) {
    const resourceOpts = {
      transport: context.transport,
      validateResponses: context.validateResponses,
    };

    this.workspace = new WorkspaceResource(resourceOpts);
    this.clients = new ClientsResource(resourceOpts);
    this.companies = new CompaniesResource(resourceOpts);
    this.internalUsers = new InternalUsersResource(resourceOpts);
    this.notifications = new NotificationsResource(resourceOpts);
    this.customFields = new CustomFieldsResource(resourceOpts);
    this.tasks = new TasksResource(resourceOpts);
  }
}
