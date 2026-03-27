import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type EventActorType = "client" | "internalUser";

export const EventActorTypeSchema: z.ZodType<EventActorType> = z.enum(["client", "internalUser"]);

export type EventSource = "automation" | "platform" | "system" | "web";

export const EventSourceSchema: z.ZodType<EventSource> = z.enum([
  "automation",
  "platform",
  "system",
  "web",
]);

// ---------------------------------------------------------------------------
// Base types
// ---------------------------------------------------------------------------

export interface AuditLogEvent {
  actorId: string;
  actorType: EventActorType;
  automationId?: string | null;
  companyId?: string | null;
  context: Record<string, unknown>;
  createdAt: string;
  eventDescription: string;
  eventType: string;
  id: string;
  ip?: string | null;
  object: "auditLog";
  source: EventSource;
  updatedAt?: string;
  userAgent?: string | null;
}

export const AuditLogEventSchema: z.ZodType<AuditLogEvent> = z.object({
  actorId: z.string(),
  actorType: EventActorTypeSchema,
  automationId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
  context: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  eventDescription: z.string(),
  eventType: z.string(),
  id: z.string(),
  ip: z.string().nullable().optional(),
  object: z.literal("auditLog"),
  source: EventSourceSchema,
  updatedAt: z.string().optional(),
  userAgent: z.string().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export const AuditLogEventResponseSchema: z.ZodType<AuditLogEvent> = AuditLogEventSchema;
export type AuditLogEventResponse = AuditLogEvent;

export interface AuditLogEventsResponse {
  data: AuditLogEvent[] | null;
  nextToken?: string;
}

export const AuditLogEventsResponseSchema: z.ZodType<AuditLogEventsResponse> = z.object({
  data: z.array(AuditLogEventSchema).nullable(),
  nextToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface EventCreateRequest {
  actorId: string;
  companyId?: string;
  context: Record<string, unknown>;
  eventDescription: string;
  eventType: string;
}

export const EventCreateRequestSchema: z.ZodType<EventCreateRequest> = z.object({
  actorId: z.string(),
  companyId: z.string().optional(),
  context: z.record(z.string(), z.unknown()),
  eventDescription: z.string().max(500),
  eventType: z.string().max(100),
});
