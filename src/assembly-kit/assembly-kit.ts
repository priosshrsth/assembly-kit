import { AsyncLocalStorage } from "node:async_hooks";

import { assemblyApi } from "@assembly-js/node-sdk";
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

import { DEFAULT_RETRY } from "./options";
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

    const sdk = assemblyApi({ apiKey: options.apiKey, token: options.token });
    const validate = options.validateResponses ?? true;
    const retry =
      options.retry === false ? false : { ...DEFAULT_RETRY, ...options.retry };

    this.appConnections = new AppConnectionsResource(sdk, validate, retry);
    this.appInstalls = new AppInstallsResource(sdk, validate, retry);
    this.clients = new ClientsResource(sdk, validate, retry);
    this.companies = new CompaniesResource(sdk, validate, retry);
    this.contractTemplates = new ContractTemplatesResource(
      sdk,
      validate,
      retry
    );
    this.contracts = new ContractsResource(sdk, validate, retry);
    this.customFieldOptions = new CustomFieldOptionsResource(
      sdk,
      validate,
      retry
    );
    this.customFields = new CustomFieldsResource(sdk, validate, retry);
    this.fileChannels = new FileChannelsResource(sdk, validate, retry);
    this.files = new FilesResource(sdk, validate, retry);
    this.formResponses = new FormResponsesResource(sdk, validate, retry);
    this.forms = new FormsResource(sdk, validate, retry);
    this.internalUsers = new InternalUsersResource(sdk, validate, retry);
    this.invoiceTemplates = new InvoiceTemplatesResource(sdk, validate, retry);
    this.invoices = new InvoicesResource(sdk, validate, retry);
    this.messageChannels = new MessageChannelsResource(sdk, validate, retry);
    this.messages = new MessagesResource(sdk, validate, retry);
    this.notes = new NotesResource(sdk, validate, retry);
    this.notifications = new NotificationsResource(sdk, validate, retry);
    this.payments = new PaymentsResource(sdk, validate, retry);
    this.prices = new PricesResource(sdk, validate, retry);
    this.products = new ProductsResource(sdk, validate, retry);
    this.subscriptionTemplates = new SubscriptionTemplatesResource(
      sdk,
      validate,
      retry
    );
    this.subscriptions = new SubscriptionsResource(sdk, validate, retry);
    this.taskTemplates = new TaskTemplatesResource(sdk, validate, retry);
    this.tasks = new TasksResource(sdk, validate, retry);
    this.workspace = new WorkspaceResource(sdk, validate, retry);
  }
}
