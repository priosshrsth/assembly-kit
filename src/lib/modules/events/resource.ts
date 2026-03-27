import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

import { AuditLogEventResponseSchema, AuditLogEventsResponseSchema } from "./schema";
import type { AuditLogEvent, AuditLogEventsResponse, EventCreateRequest } from "./schema";

/**
 * Type override for the Events API methods missing from `@assembly-js/node-sdk`.
 * Remove once the SDK ships proper typings for events.
 */
interface EventsApi {
  createEvent(args: { requestBody: EventCreateRequest }): Promise<unknown>;
  listEvents(args: ListEventsArgs): Promise<unknown>;
  retrieveEvent(args: { id: string }): Promise<unknown>;
}

export interface ListEventsArgs extends ListArgs {
  actorId?: string;
  endDate?: string;
  eventType?: string;
  startDate?: string;
}

/** Audit log events resource. */
export class EventsResource extends BaseResource {
  private get api(): EventsApi {
    return this.sdk as unknown as EventsApi;
  }

  /** Create a new audit log event. */
  async create(body: EventCreateRequest): Promise<AuditLogEvent> {
    const raw: unknown = await this.api.createEvent({ requestBody: body });
    return this.parse(AuditLogEventResponseSchema, raw);
  }

  /** List audit log events with optional filters. */
  async list(args: ListEventsArgs = {}): Promise<AuditLogEventsResponse> {
    const raw: unknown = await this.api.listEvents(args);
    return this.parse(AuditLogEventsResponseSchema, raw);
  }

  /** Retrieve a single audit log event by ID. */
  async retrieve(id: string): Promise<AuditLogEvent> {
    const raw: unknown = await this.api.retrieveEvent({ id });
    return this.parse(AuditLogEventResponseSchema, raw);
  }

  /** Iterate over all audit log events, automatically paginating. Default limit per page: 100. */
  listAll(args: Omit<ListEventsArgs, "nextToken"> = {}): AsyncGenerator<AuditLogEvent> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 100,
    });
  }
}
