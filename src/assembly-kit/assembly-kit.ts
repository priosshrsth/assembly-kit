import { AsyncLocalStorage } from "node:async_hooks";

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

import { createAssemblyClient } from "./create-assembly-client";
import type { AssemblyKitOptions } from "./options";

/**
 * Assembly SDK client with typed resource namespaces and Zod response validation.
 *
 * Wraps `@assembly-js/node-sdk` and organizes its flat methods into resource
 * namespaces. Each method optionally validates the response through a Zod schema.
 *
 * **Global singleton caveat:** The underlying SDK mutates a global `OpenAPI` config
 * object, so multiple `AssemblyKit` instances with different credentials will
 * interfere with each other. Use a single instance per credential set.
 *
 * @example
 * ```ts
 * // Request-scoped singleton (recommended for serverless / Vercel fluid compute)
 * const kit = AssemblyKit.new({ apiKey, token });
 * const same = AssemblyKit.new({ apiKey, token }); // returns the same instance
 *
 * // Direct instantiation (always creates a new instance)
 * const kit = new AssemblyKit({ apiKey: "your-key", token: "encrypted-token" });
 * ```
 */
export class AssemblyKit {
  static readonly #store: AsyncLocalStorage<AssemblyKit> =
    new AsyncLocalStorage<AssemblyKit>();

  /**
   * Get or create a request-scoped `AssemblyKit` instance via `AsyncLocalStorage`.
   * Returns the existing instance if one exists with the same token. If the token
   * differs, a new instance is created and replaces the previous one.
   * Safe for Vercel fluid compute — no shared state across requests.
   *
   * @returns The `AssemblyKit` instance for the current async context.
   */
  static new(options: AssemblyKitOptions): AssemblyKit {
    const existing = AssemblyKit.#store.getStore();
    if (existing && existing.currentToken === options.token) {
      return existing;
    }
    const instance = new AssemblyKit(options);
    AssemblyKit.#store.enterWith(instance);
    return instance;
  }

  readonly currentToken: string | undefined;
  readonly appConnections: AppConnectionsResource;
  readonly appInstalls: AppInstallsResource;
  readonly clients: ClientsResource;
  readonly companies: CompaniesResource;
  readonly contractTemplates: ContractTemplatesResource;
  readonly contracts: ContractsResource;
  readonly customFieldOptions: CustomFieldOptionsResource;
  readonly customFields: CustomFieldsResource;
  readonly fileChannels: FileChannelsResource;
  readonly files: FilesResource;
  readonly formResponses: FormResponsesResource;
  readonly forms: FormsResource;
  readonly internalUsers: InternalUsersResource;
  readonly invoiceTemplates: InvoiceTemplatesResource;
  readonly invoices: InvoicesResource;
  readonly messageChannels: MessageChannelsResource;
  readonly messages: MessagesResource;
  readonly notes: NotesResource;
  readonly notifications: NotificationsResource;
  readonly payments: PaymentsResource;
  readonly prices: PricesResource;
  readonly products: ProductsResource;
  readonly subscriptionTemplates: SubscriptionTemplatesResource;
  readonly subscriptions: SubscriptionsResource;
  readonly taskTemplates: TaskTemplatesResource;
  readonly tasks: TasksResource;
  readonly workspace: WorkspaceResource;

  constructor(options: AssemblyKitOptions) {
    this.currentToken = options.token;

    const sdk = createAssemblyClient({
      apiKey: options.apiKey,
      retry: options.retry,
      token: options.token,
    });

    const validate = options.validateResponses ?? true;

    this.appConnections = new AppConnectionsResource(sdk, validate);
    this.appInstalls = new AppInstallsResource(sdk, validate);
    this.clients = new ClientsResource(sdk, validate);
    this.companies = new CompaniesResource(sdk, validate);
    this.contractTemplates = new ContractTemplatesResource(sdk, validate);
    this.contracts = new ContractsResource(sdk, validate);
    this.customFieldOptions = new CustomFieldOptionsResource(sdk, validate);
    this.customFields = new CustomFieldsResource(sdk, validate);
    this.fileChannels = new FileChannelsResource(sdk, validate);
    this.files = new FilesResource(sdk, validate);
    this.formResponses = new FormResponsesResource(sdk, validate);
    this.forms = new FormsResource(sdk, validate);
    this.internalUsers = new InternalUsersResource(sdk, validate);
    this.invoiceTemplates = new InvoiceTemplatesResource(sdk, validate);
    this.invoices = new InvoicesResource(sdk, validate);
    this.messageChannels = new MessageChannelsResource(sdk, validate);
    this.messages = new MessagesResource(sdk, validate);
    this.notes = new NotesResource(sdk, validate);
    this.notifications = new NotificationsResource(sdk, validate);
    this.payments = new PaymentsResource(sdk, validate);
    this.prices = new PricesResource(sdk, validate);
    this.products = new ProductsResource(sdk, validate);
    this.subscriptionTemplates = new SubscriptionTemplatesResource(
      sdk,
      validate
    );
    this.subscriptions = new SubscriptionsResource(sdk, validate);
    this.taskTemplates = new TaskTemplatesResource(sdk, validate);
    this.tasks = new TasksResource(sdk, validate);
    this.workspace = new WorkspaceResource(sdk, validate);
  }
}
