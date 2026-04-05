## Overview

The Events API allows you to create and query **audit log events** for your workspace. These are immutable records that track system activity — both system-generated events and custom events you create via the API.

---

## Endpoints

### 1. Create an Event

```
POST /v1/events
```

Creates a new audit log event. The event is processed asynchronously (queued), but a response is returned immediately with the event data.

**Request Body**

| Field              | Type   | Required    | Description                                                                                                                                                                                                       |
| ------------------ | ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eventType`        | string | Yes         | Custom event type name (max 100 chars). Alphanumeric characters only — special characters and spaces are stripped. Stored with a `customEvent.` prefix (e.g., `"UserSignup"` becomes `"customEvent.UserSignup"`). |
| `actorId`          | string | Yes         | The ID of the user performing the action. Must be a valid, enabled user in your workspace.                                                                                                                        |
| `actorType`        | string | Yes         | `"clientUser"` or `"internalUser"`.                                                                                                                                                                               |
| `companyId`        | string | Conditional | Required if `actorType` is `"clientUser"`. The client must belong to this company.                                                                                                                                |
| `eventDescription` | string | Yes         | Human-readable description of the event (max 500 chars).                                                                                                                                                          |
| `context`          | object | Yes         | Arbitrary JSON object with additional event data.                                                                                                                                                                 |

**Example Request**

```bash
curl -X POST https://api.assembly.com/v1/events \
  -H "X-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "InvoiceApproved",
    "actorId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "actorType": "internalUser",
    "eventDescription": "Invoice #1042 was approved by the account manager",
    "context": {
      "invoiceId": "inv_1042",
      "amount": 5000,
      "currency": "USD",
      "approvedBy": "Account Manager"
    }
  }'
```

**Example Response (201 Created)**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "object": "auditLog",
  "actorId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "actorType": "internalUser",
  "companyId": null,
  "source": "platform",
  "eventType": "customEvent.InvoiceApproved",
  "eventDescription": "Invoice #1042 was approved by the account manager",
  "context": {
    "invoiceId": "inv_1042",
    "amount": 5000,
    "currency": "USD",
    "approvedBy": "Account Manager"
  },
  "userAgent": "curl/8.1.2",
  "ip": "203.0.113.42",
  "createdAt": "2026-03-26T14:30:00.000000000Z",
  "updatedAt": "2026-03-26T14:30:00.000000000Z"
}
```

**Example with a Client User Actor**

```bash
curl -X POST https://api.assembly.com/v1/events \
  -H "X-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "DocumentViewed",
    "actorId": "c3d4e5f6-a7b8-9012-cdef-345678901234",
    "actorType": "clientUser",
    "companyId": "d4e5f6a7-b890-1234-5678-abcdef012345",
    "eventDescription": "Client viewed the Q1 report",
    "context": {
      "documentName": "Q1 Report 2026",
      "documentId": "doc_991"
    }
  }'
```

---

### 2. List Events

```
GET /v1/events
```

Returns a paginated list of audit log events in reverse chronological order (newest first). This includes both system-generated events and custom events created via the API.

**Query Parameters**

| Parameter   | Type    | Required | Description                                                                                           |
| ----------- | ------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `startDate` | string  | No       | Inclusive start date filter. RFC 3339 format (e.g., `2026-03-01T00:00:00Z`).                          |
| `endDate`   | string  | No       | Inclusive end date filter. RFC 3339 format (e.g., `2026-03-26T23:59:59Z`).                            |
| `eventType` | string  | No       | Comma-separated list of event types to filter by (e.g., `customEvent.InvoiceApproved,clientCreated`). |
| `actorId`   | string  | No       | Comma-separated list of actor IDs to filter by.                                                       |
| `limit`     | integer | No       | Number of results per page (default: `100`).                                                          |
| `nextToken` | string  | No       | Pagination token from a previous response.                                                            |

**Example Request — Basic**

```bash
curl -X GET "https://api.assembly.com/v1/events?limit=10" \
  -H "X-API-KEY: your-api-key"
```

**Example Request — With Filters**

```bash
curl -X GET "https://api.assembly.com/v1/events?startDate=2026-03-01T00:00:00Z&endDate=2026-03-26T23:59:59Z&eventType=customEvent.InvoiceApproved,clientCreated&limit=25" \
  -H "X-API-KEY: your-api-key"
```

**Example Response (200 OK)**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "object": "auditLog",
      "actorId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "actorType": "internalUser",
      "source": "platform",
      "eventType": "customEvent.InvoiceApproved",
      "eventDescription": "Invoice #1042 was approved",
      "context": {
        "invoiceId": "inv_1042",
        "amount": 5000
      },
      "userAgent": "curl/8.1.2",
      "ip": "203.0.113.42",
      "createdAt": "2026-03-26T14:30:00.000000000Z",
      "updatedAt": "2026-03-26T14:30:00.000000000Z"
    },
    {
      "id": "f7e8d9c0-b1a2-3456-7890-abcdef123456",
      "object": "auditLog",
      "actorId": "e5f6a7b8-9012-3456-cdef-789012345678",
      "actorType": "internalUser",
      "source": "web",
      "eventType": "clientCreated",
      "eventDescription": "Client user was created",
      "context": {
        "clientEmail": "john@acme.com"
      },
      "ip": "198.51.100.10",
      "createdAt": "2026-03-25T10:15:00.000000000Z",
      "updatedAt": "2026-03-25T10:15:00.000000000Z"
    }
  ],
  "nextToken": "eyJsYXN0RXZhbHVhdGVkS2V5Ijp7ImlkIjp..."
}
```

**Pagination**

When more results are available, the response includes a `nextToken`. Pass it as a query parameter to get the next page:

```bash
curl -X GET "https://api.assembly.com/v1/events?limit=10&nextToken=eyJsYXN0RXZhbHVhdGVkS2V5Ijp7ImlkIjp..." \
  -H "X-API-KEY: your-api-key"
```

When there are no more results, `nextToken` is omitted from the response.

---

### 3. Get a Single Event

```
GET /v1/events/:id
```

Retrieve a specific audit log event by its ID.

**Example Request**

```bash
curl -X GET "https://api.assembly.com/v1/events/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "X-API-KEY: your-api-key"
```

**Example Response (200 OK)**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "object": "auditLog",
  "actorId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "actorType": "internalUser",
  "companyId": null,
  "source": "platform",
  "eventType": "customEvent.InvoiceApproved",
  "eventDescription": "Invoice #1042 was approved by the account manager",
  "context": {
    "invoiceId": "inv_1042",
    "amount": 5000
  },
  "userAgent": "curl/8.1.2",
  "ip": "203.0.113.42",
  "createdAt": "2026-03-26T14:30:00.000000000Z",
  "updatedAt": "2026-03-26T14:30:00.000000000Z"
}
```

---

## Response Object Fields

| Field              | Type           | Description                                                                                                                                           |
| ------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | string         | Unique event ID (UUID).                                                                                                                               |
| `object`           | string         | Always `"auditLog"`.                                                                                                                                  |
| `actorId`          | string         | ID of the user who performed the action.                                                                                                              |
| `actorType`        | string         | `"internalUser"` or `"clientUser"`.                                                                                                                   |
| `companyId`        | string or null | Company ID if the actor is a client user.                                                                                                             |
| `source`           | string         | Where the event originated: `"platform"` (API-created), `"web"` (dashboard), `"automation"`, or `"system"`.                                           |
| `eventType`        | string         | The event type. Custom events are prefixed with `customEvent.` (e.g., `customEvent.InvoiceApproved`). System events use predefined types (see below). |
| `eventDescription` | string         | Human-readable description.                                                                                                                           |
| `context`          | object         | Arbitrary metadata attached to the event.                                                                                                             |
| `userAgent`        | string or null | User-Agent header from the request that created the event.                                                                                            |
| `ip`               | string or null | IP address of the request that created the event.                                                                                                     |
| `automationId`     | string or null | Present if the event was triggered by an automation.                                                                                                  |
| `createdAt`        | string         | ISO 8601 / RFC 3339 timestamp.                                                                                                                        |
| `updatedAt`        | string         | ISO 8601 / RFC 3339 timestamp (same as `createdAt` — events are immutable).                                                                           |

**Note on PII:** The `userAgent` and `ip` fields are exposed in API responses. You are responsible for handling these in compliance with GDPR/CCPA.

---

## System Event Types

In addition to your custom events, the list endpoint returns system-generated events. These are the predefined event types you can filter on:

| Event Type              | Description                  |
| ----------------------- | ---------------------------- |
| `userLoggedIn`          | User logged into the portal  |
| `userLoggedOut`         | User logged out              |
| `clientCreated`         | A client user was created    |
| `clientUpdated`         | A client user was updated    |
| `clientDeleted`         | A client user was deleted    |
| `clientInvited`         | A client was invited         |
| `fileUploaded`          | A file was uploaded          |
| `fileDeleted`           | A file was deleted           |
| `fileDownloaded`        | A file was downloaded        |
| `messageSent`           | A message was sent           |
| `messageDeleted`        | A message was deleted        |
| `taskCreated`           | A task was created           |
| `taskUpdated`           | A task was updated           |
| `taskDeleted`           | A task was deleted           |
| `subscriptionCreated`   | A subscription was created   |
| `subscriptionCancelled` | A subscription was cancelled |
| `contractSent`          | A contract was sent          |
| `contractCompleted`     | A contract was completed     |
| `contractDownloaded`    | A contract was downloaded    |
| `invoiceCreated`        | An invoice was created       |
| `invoicePaid`           | An invoice was paid          |

---

## Error Responses

| Status | Error                      | Description                                                                                    |
| ------ | -------------------------- | ---------------------------------------------------------------------------------------------- |
| `400`  | `actorId is required`      | The `actorId` field was not provided.                                                          |
| `400`  | Validation error           | A required field is missing or exceeds max length.                                             |
| `400`  | `Invalid request`          | The `actorId` doesn’t exist, is disabled, or `companyId` is invalid for the given client user. |
| `401`  | `Not authorized`           | API key doesn’t have Internal Admin or Internal Staff privileges.                              |
| `401`  | `Enterprise plan required` | Your workspace must be on an Enterprise plan to create events.                                 |
| `404`  | `Not found`                | Event with the given ID doesn’t exist in your workspace.                                       |
| `500`  | `Request failed`           | Internal error creating or listing events.                                                     |

---

## Webhooks

When a new audit log event is persisted, an `event.created` webhook event is fired. Subscribe to it via your webhook endpoint configuration to get real-time notifications of all audit log activity.

---

## Important Notes

1. **Immutable** — Events cannot be updated or deleted once created.
2. **Async processing** — Events are queued and persisted asynchronously. The `POST` response is returned immediately, but there may be a brief delay before the event appears in `GET /v1/events` list results.
3. **Event type sanitization** — Custom event types are stripped of all non-alphanumeric characters and prefixed with `customEvent.`. For example, `"My Event!!"` becomes `customEvent.MyEvent`.
4. **Portal isolation** — Events are strictly scoped to your workspace. You can only read events from your own workspace.
