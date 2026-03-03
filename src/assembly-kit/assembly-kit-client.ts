import { AppConnectionsResource } from "src/modules/app-connections/resource";
import { AppInstallsResource } from "src/modules/app-installs/resource";
import { ClientsResource } from "src/modules/clients/resource";
import { CompaniesResource } from "src/modules/companies/resource";
import { ContractTemplatesResource } from "src/modules/contract-templates/resource";
import { ContractsResource } from "src/modules/contracts/resource";
import { CustomFieldOptionsResource } from "src/modules/custom-field-options/resource";
import { CustomFieldsResource } from "src/modules/custom-fields/resource";
import { FileChannelsResource } from "src/modules/file-channels/resource";
import { FilesResource } from "src/modules/files/resource";
import { FormResponsesResource } from "src/modules/form-responses/resource";
import { FormsResource } from "src/modules/forms/resource";
import { InternalUsersResource } from "src/modules/internal-users/resource";
import { InvoiceTemplatesResource } from "src/modules/invoice-templates/resource";
import { InvoicesResource } from "src/modules/invoices/resource";
import { MessageChannelsResource } from "src/modules/message-channels/resource";
import { MessagesResource } from "src/modules/messages/resource";
import { NotesResource } from "src/modules/notes/resource";
import { NotificationsResource } from "src/modules/notifications/resource";
import { PaymentsResource } from "src/modules/payments/resource";
import { PricesResource } from "src/modules/prices/resource";
import { ProductsResource } from "src/modules/products/resource";
import { SubscriptionTemplatesResource } from "src/modules/subscription-templates/resource";
import { SubscriptionsResource } from "src/modules/subscriptions/resource";
import { TaskTemplatesResource } from "src/modules/task-templates/resource";
import { TasksResource } from "src/modules/tasks/resource";
import { WorkspaceResource } from "src/modules/workspace/resource";
import type { Transport } from "src/transport/http";

export interface ResourceContext {
  transport: Transport;
  validateResponses: boolean;
  token?: string;
}

interface ResourceOpts {
  transport: Transport;
  validateResponses: boolean;
}

const createCoreResources = (opts: ResourceOpts) => ({
  clients: new ClientsResource(opts),
  companies: new CompaniesResource(opts),
  internalUsers: new InternalUsersResource(opts),
  workspace: new WorkspaceResource(opts),
});

const createCrmResources = (opts: ResourceOpts) => ({
  customFieldOptions: new CustomFieldOptionsResource(opts),
  customFields: new CustomFieldsResource(opts),
  notes: new NotesResource(opts),
  notifications: new NotificationsResource(opts),
});

const createMessagingResources = (opts: ResourceOpts) => ({
  messageChannels: new MessageChannelsResource(opts),
  messages: new MessagesResource(opts),
});

const createBillingResources = (opts: ResourceOpts) => ({
  invoiceTemplates: new InvoiceTemplatesResource(opts),
  invoices: new InvoicesResource(opts),
  payments: new PaymentsResource(opts),
  prices: new PricesResource(opts),
  products: new ProductsResource(opts),
  subscriptionTemplates: new SubscriptionTemplatesResource(opts),
  subscriptions: new SubscriptionsResource(opts),
});

const createContentResources = (opts: ResourceOpts) => ({
  contractTemplates: new ContractTemplatesResource(opts),
  contracts: new ContractsResource(opts),
  fileChannels: new FileChannelsResource(opts),
  files: new FilesResource(opts),
  formResponses: new FormResponsesResource(opts),
  forms: new FormsResource(opts),
});

const createTaskAndAppResources = (opts: ResourceOpts) => ({
  appConnections: new AppConnectionsResource(opts),
  appInstalls: new AppInstallsResource(opts),
  taskTemplates: new TaskTemplatesResource(opts),
  tasks: new TasksResource(opts),
});

export class AssemblyKitClient {
  readonly workspace!: WorkspaceResource;
  readonly clients!: ClientsResource;
  readonly companies!: CompaniesResource;
  readonly internalUsers!: InternalUsersResource;
  readonly customFields!: CustomFieldsResource;
  readonly customFieldOptions!: CustomFieldOptionsResource;
  readonly notes!: NotesResource;
  readonly messageChannels!: MessageChannelsResource;
  readonly messages!: MessagesResource;
  readonly products!: ProductsResource;
  readonly prices!: PricesResource;
  readonly invoiceTemplates!: InvoiceTemplatesResource;
  readonly invoices!: InvoicesResource;
  readonly subscriptionTemplates!: SubscriptionTemplatesResource;
  readonly subscriptions!: SubscriptionsResource;
  readonly payments!: PaymentsResource;
  readonly fileChannels!: FileChannelsResource;
  readonly files!: FilesResource;
  readonly contractTemplates!: ContractTemplatesResource;
  readonly contracts!: ContractsResource;
  readonly forms!: FormsResource;
  readonly formResponses!: FormResponsesResource;
  readonly tasks!: TasksResource;
  readonly taskTemplates!: TaskTemplatesResource;
  readonly notifications!: NotificationsResource;
  readonly appConnections!: AppConnectionsResource;
  readonly appInstalls!: AppInstallsResource;

  constructor(context: ResourceContext) {
    const opts = {
      transport: context.transport,
      validateResponses: context.validateResponses,
    };

    Object.assign(this, createCoreResources(opts));
    Object.assign(this, createCrmResources(opts));
    Object.assign(this, createMessagingResources(opts));
    Object.assign(this, createBillingResources(opts));
    Object.assign(this, createContentResources(opts));
    Object.assign(this, createTaskAndAppResources(opts));
  }
}
