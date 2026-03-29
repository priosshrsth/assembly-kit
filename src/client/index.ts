import { AssemblyNoTokenError } from "src/errors/no-token";
import { AppConnectionsResource } from "src/lib/modules/app-connections/resource";
import { AppInstallsResource } from "src/lib/modules/app-installs/resource";
import { ClientsResource } from "src/lib/modules/clients/resource";
import { CompaniesResource } from "src/lib/modules/companies/resource";
import { ContractTemplatesResource } from "src/lib/modules/contract-templates/resource";
import { ContractsResource } from "src/lib/modules/contracts/resource";
import { CustomFieldOptionsResource } from "src/lib/modules/custom-field-options/resource";
import { CustomFieldsResource } from "src/lib/modules/custom-fields/resource";
import { EventsResource } from "src/lib/modules/events/resource";
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
import {
  AssemblyToken,
  type ClientTokenPayload,
  type InternalUserTokenPayload,
} from "src/token/assembly-token";
import { createTransport } from "src/transport/http";
import { SDK_VERSION } from "src/version";

import { KitMode } from "src/constants/kit-mode";

import type { AssemblyKitOptions } from "./options";

export type { AssemblyKitOptions } from "./options";

/**
 * Create a new `AssemblyKit` instance. Each call produces an independent client
 * with its own HTTP transport, rate limiter, and credentials — safe for
 * multi-workspace and serverless usage.
 *
 * @example
 * ```ts
 * const kit = createAssemblyKit({ apiKey: "your-key", workspaceId: "ws-123" });
 * const workspace = await kit.workspace.retrieve();
 * ```
 */
export function createAssemblyKit(options: AssemblyKitOptions): AssemblyKit {
  return new AssemblyKit(options);
}

/**
 * Assembly SDK client with typed resource namespaces and Zod response validation.
 *
 * Each instance has its own `ky`-based HTTP transport with independent
 * rate limiting, retry, and auth headers. No shared singletons.
 */
export class AssemblyKit {
  /** The decrypted AssemblyToken instance, or undefined when no token was provided. */
  readonly token: AssemblyToken | undefined;
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
    const mode: KitMode = options.kitMode ?? KitMode.Local;

    if (mode === KitMode.Marketplace && !options.token && !options.workspaceId) {
      throw new AssemblyNoTokenError({
        message: "Marketplace mode requires either `token` or `workspaceId`.",
      });
    }

    this.token = options.token
      ? new AssemblyToken({ token: options.token, apiKey: options.apiKey })
      : undefined;

    let compoundKey: string;
    if (this.token) {
      compoundKey = this.token.buildCompoundKey({ apiKey: options.apiKey });
    } else if (options.workspaceId) {
      compoundKey = `${options.workspaceId}/${options.apiKey}`;
    } else {
      compoundKey = options.apiKey;
    }

    const transport = createTransport({
      baseUrl: options.baseUrl,
      compoundKey,
      fetch: options.fetch,
      requestsPerSecond: options.requestsPerSecond,
      retryCount: options.retryCount,
      sdkVersion: SDK_VERSION,
    });

    const validate: boolean = options.validateResponses ?? true;
    const ctx = { transport, validateResponses: validate };

    this.appConnections = new AppConnectionsResource(ctx);
    this.appInstalls = new AppInstallsResource(ctx);
    this.clients = new ClientsResource(ctx);
    this.companies = new CompaniesResource(ctx);
    this.contractTemplates = new ContractTemplatesResource(ctx);
    this.contracts = new ContractsResource(ctx);
    this.customFieldOptions = new CustomFieldOptionsResource(ctx);
    this.customFields = new CustomFieldsResource(ctx);
    this.events = new EventsResource(ctx);
    this.fileChannels = new FileChannelsResource(ctx);
    this.files = new FilesResource(ctx);
    this.formResponses = new FormResponsesResource(ctx);
    this.forms = new FormsResource(ctx);
    this.internalUsers = new InternalUsersResource(ctx);
    this.invoiceTemplates = new InvoiceTemplatesResource(ctx);
    this.invoices = new InvoicesResource(ctx);
    this.messageChannels = new MessageChannelsResource(ctx);
    this.messages = new MessagesResource(ctx);
    this.notes = new NotesResource(ctx);
    this.notifications = new NotificationsResource(ctx);
    this.payments = new PaymentsResource(ctx);
    this.prices = new PricesResource(ctx);
    this.products = new ProductsResource(ctx);
    this.subscriptionTemplates = new SubscriptionTemplatesResource(ctx);
    this.subscriptions = new SubscriptionsResource(ctx);
    this.taskTemplates = new TaskTemplatesResource(ctx);
    this.tasks = new TasksResource(ctx);
    this.workspace = new WorkspaceResource(ctx);
  }

  /** Assert that a token was provided and belongs to a client user. */
  ensureIsClient(): ClientTokenPayload {
    if (!this.token) throw new AssemblyNoTokenError();
    return this.token.ensureIsClient();
  }

  /** Assert that a token was provided and belongs to an internal user. */
  ensureIsInternalUser(): InternalUserTokenPayload {
    if (!this.token) throw new AssemblyNoTokenError();
    return this.token.ensureIsInternalUser();
  }
}
