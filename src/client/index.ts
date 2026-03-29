import { AssemblyNoTokenError } from "src/errors/no-token";
import { initSdk } from "src/sdk-init";
import type { TokenPayload } from "src/schemas/shared/token";
import { AssemblyToken } from "src/token/assembly-token";
import type { ClientTokenPayload, InternalUserTokenPayload } from "src/token/assembly-token";
import { AppConnectionsResource } from "src/lib/modules/app-connections/resource";
import { AppInstallsResource } from "src/lib/modules/app-installs/resource";
import { ClientsResource } from "src/lib/modules/clients/resource";
import { CompaniesResource } from "src/lib/modules/companies/resource";
import { ContractTemplatesResource } from "src/lib/modules/contract-templates/resource";
import { EventsResource } from "src/lib/modules/events/resource";
import { ContractsResource } from "src/lib/modules/contracts/resource";
import { CustomFieldOptionsResource } from "src/lib/modules/custom-field-options/resource";
import { CustomFieldsResource } from "src/lib/modules/custom-fields/resource";
import { FileChannelsResource } from "src/lib/modules/file-channels/resource";
import { FilesResource } from "src/lib/modules/files/resource";
import { FormResponsesResource } from "src/lib/modules/form-responses/resource";
import { FormsResource } from "src/lib/modules/forms/resource";
import { InternalUsersResource } from "src/lib/modules/internal-users/resource";
import { InvoiceTemplatesResource } from "src/lib/modules/invoice-templates/resource";
import { InvoicesResource } from "src/lib/modules/invoices/resource";
import { MessageChannelsResource } from "src/lib/modules/message-channels/resource";
import { MessagesResource } from "src/lib/modules/messages/resource";
import { NotesResource } from "src/lib/modules/notes/resource";
import { NotificationsResource } from "src/lib/modules/notifications/resource";
import { PaymentsResource } from "src/lib/modules/payments/resource";
import { PricesResource } from "src/lib/modules/prices/resource";
import { ProductsResource } from "src/lib/modules/products/resource";
import { SubscriptionTemplatesResource } from "src/lib/modules/subscription-templates/resource";
import { SubscriptionsResource } from "src/lib/modules/subscriptions/resource";
import { TaskTemplatesResource } from "src/lib/modules/task-templates/resource";
import { TasksResource } from "src/lib/modules/tasks/resource";
import { WorkspaceResource } from "src/lib/modules/workspace/resource";

import { DEFAULT_RETRY } from "./options";
import type { AssemblyKitOptions } from "./options";

/**
 * Create a new `AssemblyKit` instance. Each call produces an independent client
 * with its own credentials — safe for multi-workspace and serverless usage.
 *
 * @example
 * ```ts
 * const kit = createAssemblyKit({ apiKey: "your-key", token: encryptedToken });
 * const workspace = await kit.workspace.retrieve();
 * ```
 */
export function createAssemblyKit(options: AssemblyKitOptions): AssemblyKit {
  return new AssemblyKit(options);
}

/**
 * Assembly SDK client with typed resource namespaces and Zod response validation.
 *
 * Wraps `@assembly-js/node-sdk` and organizes its flat methods into resource
 * namespaces. Each method optionally validates the response through a Zod schema.
 *
 * **Multi-workspace:** Each instance is fully independent — create one per
 * API key / workspace pair. Manage your own singletons as needed (e.g. a `Map`).
 *
 * @example
 * ```ts
 * const kit = createAssemblyKit({ apiKey: "your-key", token: "encrypted-token" });
 * ```
 */
export class AssemblyKit {
  readonly currentToken: string | undefined;
  /** The decrypted AssemblyToken instance, or undefined when no token was provided. */
  readonly token: AssemblyToken | undefined;
  /** The decrypted token payload, or undefined when no token was provided. */
  readonly payload: TokenPayload | undefined;
  readonly appConnections: AppConnectionsResource;
  readonly appInstalls: AppInstallsResource;
  readonly clients: ClientsResource;
  readonly companies: CompaniesResource;
  readonly contractTemplates: ContractTemplatesResource;
  readonly contracts: ContractsResource;
  readonly customFieldOptions: CustomFieldOptionsResource;
  readonly customFields: CustomFieldsResource;
  readonly events: EventsResource;
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
    const isMarketplace: boolean = options.isMarketplaceApp ?? false;

    if (isMarketplace && !options.token) {
      throw new AssemblyNoTokenError({
        message: "Marketplace apps require a `token`. Provide an encrypted token from Assembly.",
      });
    }
    if (!isMarketplace && !options.token && !options.workspaceId) {
      throw new AssemblyNoTokenError({
        message: "`workspaceId` is required when `token` is not provided.",
      });
    }

    this.currentToken = options.token;

    if (options.token) {
      this.token = new AssemblyToken({ token: options.token, apiKey: options.apiKey });
      this.payload = this.token.payload;
    } else {
      this.token = undefined;
      this.payload = undefined;
    }

    // Build compound key ourselves — no ASSEMBLY_ENV hack, no upstream init.js.
    const compoundKey: string = this.token
      ? this.token.buildCompoundKey({ apiKey: options.apiKey })
      : `${options.workspaceId}/${options.apiKey}`;

    const sdk = initSdk({ compoundKey });
    const validate = options.validateResponses ?? true;
    const retry = options.retry === false ? false : { ...DEFAULT_RETRY, ...options.retry };

    this.appConnections = new AppConnectionsResource(sdk, validate, retry);
    this.appInstalls = new AppInstallsResource(sdk, validate, retry);
    this.clients = new ClientsResource(sdk, validate, retry);
    this.companies = new CompaniesResource(sdk, validate, retry);
    this.contractTemplates = new ContractTemplatesResource(sdk, validate, retry);
    this.contracts = new ContractsResource(sdk, validate, retry);
    this.customFieldOptions = new CustomFieldOptionsResource(sdk, validate, retry);
    this.customFields = new CustomFieldsResource(sdk, validate, retry);
    this.events = new EventsResource(sdk, validate, retry);
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
    this.subscriptionTemplates = new SubscriptionTemplatesResource(sdk, validate, retry);
    this.subscriptions = new SubscriptionsResource(sdk, validate, retry);
    this.taskTemplates = new TaskTemplatesResource(sdk, validate, retry);
    this.tasks = new TasksResource(sdk, validate, retry);
    this.workspace = new WorkspaceResource(sdk, validate, retry);
  }

  /**
   * Assert that a token was provided and belongs to a client user.
   * @throws {AssemblyNoTokenError} If no token was provided.
   * @throws {AssemblyUnauthorizedError} If the token is not a client token.
   */
  ensureIsClient(): ClientTokenPayload {
    if (!this.token) {
      throw new AssemblyNoTokenError();
    }
    return this.token.ensureIsClient();
  }

  /**
   * Assert that a token was provided and belongs to an internal user.
   * @throws {AssemblyNoTokenError} If no token was provided.
   * @throws {AssemblyUnauthorizedError} If the token is not an internal user token.
   */
  ensureIsInternalUser(): InternalUserTokenPayload {
    if (!this.token) {
      throw new AssemblyNoTokenError();
    }
    return this.token.ensureIsInternalUser();
  }
}
