import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { AuditLogEventResponseSchema, AuditLogEventsResponseSchema } from "./schema";
import type { AuditLogEvent, AuditLogEventsResponse, EventCreateRequest } from "./schema";

export interface ListEventsArgs extends ListArgs {
  actorId?: string;
  endDate?: string;
  eventType?: string;
  startDate?: string;
}

/** Audit log events resource. */
export class EventsResource {
  readonly #transport: Transport;
  readonly #validate: boolean;

  constructor({
    transport,
    validateResponses,
  }: {
    transport: Transport;
    validateResponses: boolean;
  }) {
    this.#transport = transport;
    this.#validate = validateResponses;
  }

  /** Create a new audit log event. */
  async create(body: EventCreateRequest): Promise<AuditLogEvent> {
    const raw: unknown = await this.#transport.post("v1/events", body);
    return parseResponse({
      schema: AuditLogEventResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** List audit log events with optional filters. */
  async list(args: ListEventsArgs = {}): Promise<AuditLogEventsResponse> {
    const raw: unknown = await this.#transport.get("v1/events", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({
      schema: AuditLogEventsResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Retrieve a single audit log event by ID. */
  async retrieve(id: string): Promise<AuditLogEvent> {
    const raw: unknown = await this.#transport.get(`v1/events/${id}`);
    return parseResponse({
      schema: AuditLogEventResponseSchema,
      data: raw,
      validate: this.#validate,
    });
  }

  /** Iterate over all audit log events, automatically paginating. Default limit per page: 100. */
  async listAll(args: Omit<ListEventsArgs, "nextToken"> = {}): Promise<AuditLogEvent[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 100,
    });
  }
}
