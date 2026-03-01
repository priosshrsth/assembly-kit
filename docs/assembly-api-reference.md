# Assembly API — Complete Endpoints & Schemas Reference

> **Base URL:** `https://api.assembly.com/v1`  
> **Auth:** `X-API-KEY` header  
> **Format:** JSON request/response, RESTful  
> **Rate Limits:** 20 req/sec; daily limits by plan (Starter: 2K, Professional: 10K, Advanced: 50K, Enterprise: Unlimited)

---

## 1. Getting Started

| Page         | Path                                      |
| ------------ | ----------------------------------------- |
| Introduction | `/reference/getting-started-introduction` |
| Pagination   | `/reference/getting-started-pagination`   |
| Errors       | `/reference/getting-started-errors`       |

---

## 2. Webhooks

| Page     | Path                           |
| -------- | ------------------------------ |
| Overview | `/reference/webhooks-overview` |
| Events   | `/reference/webhooks-events`   |

### Webhook Payload (Event Object)

| Property             | Type   | Description                                                 |
| -------------------- | ------ | ----------------------------------------------------------- |
| `eventType`          | string | The event type that triggered this webhook                  |
| `data`               | map    | A resource object associated with this webhook event        |
| `previousAttributes` | map    | For `*.updated` events, shows what changed about a resource |

---

## 3. Core Resources

### 3.1 Clients

**Object:** `client`

| Property         | Type           | Description                                     |
| ---------------- | -------------- | ----------------------------------------------- |
| `id`             | string         | Unique identifier                               |
| `object`         | string         | `"client"`                                      |
| `createdAt`      | string         | RFC3339 date created                            |
| `updatedAt`      | string         | RFC3339 date updated                            |
| `givenName`      | string         | First name                                      |
| `familyName`     | string         | Last name                                       |
| `email`          | string         | Client email                                    |
| `companyIds`     | array(string)  | IDs of companies the client belongs to          |
| ~~`companyId`~~  | string         | **Deprecated** — use `companyIds`               |
| `status`         | string         | `notInvited` \| `invited` \| `active`           |
| `inviteUrl`      | string         | Link to invite client to portal                 |
| `avatarImageUrl` | string \| null | Avatar image URL                                |
| `firstLoginDate` | string \| null | First login timestamp                           |
| `lastLoginDate`  | string \| null | Last login timestamp (explicit login flow only) |
| `fallbackColor`  | string         | Hex fallback color (no avatar)                  |
| `creationMethod` | string         | `internalUser` \| `client` \| `directSignUp`    |
| `customFields`   | map \| null    | Custom field key→value pairs                    |

**Example:**

```json
{
  "id": "1fe85b46-6a3d-4dcc-abbc-b76ac720784e",
  "object": "client",
  "createdAt": "2024-02-02T21:30:28.929541031Z",
  "updatedAt": "2024-02-02T21:30:28.929541031Z",
  "givenName": "John",
  "familyName": "Doe",
  "email": "john.doe@example.com",
  "companyIds": ["bca425ea-daf0-4fb1-add1-c010a95de999"],
  "status": "active",
  "inviteUrl": "https://productiondemo.myassembly.com",
  "avatarImageUrl": null,
  "firstLoginDate": null,
  "lastLoginDate": "2024-02-02T21:30:30.200075382Z",
  "fallbackColor": "#938EAB",
  "customFields": {
    "phoneNumber": "+18185552345",
    "tags": ["sampleTag"],
    "address": {
      "country": "US",
      "region": "New York",
      "postalCode": "10001",
      "addressLine1": "1201 Broadway",
      "addressLine2": "704",
      "city": "New York",
      "fullAddress": "1201 Broadway\n704\nNew York, New York, 10001\nUnited States"
    }
  },
  "creationMethod": "internalUser"
}
```

**Endpoints:**

| Method   | Path               | Description     |
| -------- | ------------------ | --------------- |
| `POST`   | `/v1/clients`      | Create Client   |
| `GET`    | `/v1/clients/{id}` | Retrieve Client |
| `PATCH`  | `/v1/clients/{id}` | Update Client   |
| `DELETE` | `/v1/clients/{id}` | Delete Client   |
| `GET`    | `/v1/clients`      | List Clients    |

**Create/Update Client Request Body:**

| Field          | Type          | Required     | Description              |
| -------------- | ------------- | ------------ | ------------------------ |
| `givenName`    | string        | Yes (create) | First name               |
| `familyName`   | string        | Yes (create) | Last name                |
| `email`        | string        | Yes (create) | Email address            |
| `companyIds`   | array(string) | No           | Company IDs to associate |
| `customFields` | map           | No           | Custom field values      |

**Custom Field Notes:** Phone numbers: `+{countryCode}{areaCode}{number}`. Address fields: structured object with `country`, `region`, `postalCode`, `addressLine1`, `addressLine2`, `city`, `fullAddress`. Multi-select fields: arrays of option keys.

---

### 3.2 Companies

**Object:** `company`

Placeholder companies (`name = ""`, `isPlaceholder = true`) are auto-created when a client is created without a named company.

| Property        | Type        | Description                                   |
| --------------- | ----------- | --------------------------------------------- |
| `id`            | string      | Unique identifier                             |
| `object`        | string      | `"company"`                                   |
| `createdAt`     | string      | RFC3339 date created                          |
| `updatedAt`     | string      | RFC3339 date updated                          |
| `name`          | string      | Company name (empty for placeholders)         |
| `iconImageUrl`  | string      | URL to company icon (empty string if not set) |
| `fallbackColor` | string      | Hex fallback color                            |
| `isPlaceholder` | boolean     | Whether this is a placeholder company         |
| `customFields`  | map \| null | Custom field key→value pairs                  |

**Example:**

```json
{
  "id": "b3be03e0-4e92-4483-997e-f6c351bfbd34",
  "object": "company",
  "createdAt": "2024-02-14T22:41:58.09460254Z",
  "updatedAt": "2024-02-14T22:41:58.09460254Z",
  "name": "Rocket Rides",
  "fallbackColor": "#7CAE7A",
  "iconImageUrl": "",
  "isPlaceholder": false,
  "customFields": null
}
```

**Endpoints:**

| Method   | Path                 | Description      |
| -------- | -------------------- | ---------------- |
| `POST`   | `/v1/companies`      | Create Company   |
| `GET`    | `/v1/companies/{id}` | Retrieve Company |
| `PATCH`  | `/v1/companies/{id}` | Update Company   |
| `DELETE` | `/v1/companies/{id}` | Delete Company   |
| `GET`    | `/v1/companies`      | List Companies   |

**Create/Update Company Request Body:**

| Field          | Type   | Required     | Description         |
| -------------- | ------ | ------------ | ------------------- |
| `name`         | string | Yes (create) | Company name        |
| `iconImageUrl` | string | No           | Icon image URL      |
| `customFields` | map    | No           | Custom field values |

---

### 3.3 Internal Users

**Object:** `internalUser`

Internal users are employees of the service business who manage clients and content.

| Property                | Type          | Description                                                 |
| ----------------------- | ------------- | ----------------------------------------------------------- |
| `id`                    | string        | Unique identifier                                           |
| `object`                | string        | `"internalUser"`                                            |
| `createdAt`             | string        | RFC3339 date created                                        |
| `givenName`             | string        | First name                                                  |
| `familyName`            | string        | Last name                                                   |
| `email`                 | string        | Email address                                               |
| `role`                  | string        | User role (e.g. `"admin"`)                                  |
| `fallbackColor`         | string        | Hex fallback color                                          |
| `isClientAccessLimited` | boolean       | Whether access is limited to specific companies             |
| `companyAccessList`     | array(string) | Company IDs this user has access to (includes placeholders) |
| `avatarImageUrl`        | string        | Avatar image URL (empty string if not set)                  |

**Example:**

```json
{
  "id": "a34b3206-c567-4185-aad5-124ef6ea2b0b",
  "object": "internalUser",
  "createdAt": "2023-06-23T14:40:29.632217267Z",
  "givenName": "Ari",
  "familyName": "Quinones",
  "email": "ari@company.com",
  "role": "admin",
  "fallbackColor": "#3294AE",
  "isClientAccessLimited": true,
  "companyAccessList": [
    "00d31640-a863-44a1-a844-5b3a16f72bb0",
    "1ad25040-c5dc-4c98-a182-c6610d1a799c",
    "c7a8cdd0-7260-459c-9c13-77af594005b6"
  ],
  "avatarImageUrl": "https://lightout-portal.s3-accelerate.amazonaws.com/public/..."
}
```

**Endpoints:**

| Method | Path                      | Description            |
| ------ | ------------------------- | ---------------------- |
| `GET`  | `/v1/internal-users/{id}` | Retrieve Internal User |
| `GET`  | `/v1/internal-users`      | List Internal Users    |

---

### 3.4 Workspaces

**Object:** `workspace`

A workspace includes the Assembly Dashboard (internal users) and portal (clients).

| Property   | Type   | Description                                |
| ---------- | ------ | ------------------------------------------ |
| `id`       | string | Workspace ID                               |
| `object`   | string | `"workspace"`                              |
| `industry` | string | Industry (selected during workspace setup) |

**Endpoints:**

| Method | Path             | Description        |
| ------ | ---------------- | ------------------ |
| `GET`  | `/v1/workspaces` | Retrieve Workspace |

---

## 4. CRM

### 4.1 Custom Fields

**Object:** `customField`

Represents a custom field definition in the workspace. Custom fields can only be created via the UI, not via API.

| Property | Type   | Description                                                                           |
| -------- | ------ | ------------------------------------------------------------------------------------- |
| `id`     | string | Unique identifier                                                                     |
| `object` | string | `"customField"`                                                                       |
| `key`    | string | The key used in API requests/responses                                                |
| `name`   | string | Display name of the field                                                             |
| `type`   | string | Field type: `text` \| `number` \| `multiSelect` \| `phoneNumber` \| `address` \| etc. |

**Endpoints:**

| Method | Path                | Description        |
| ------ | ------------------- | ------------------ |
| `GET`  | `/v1/custom-fields` | List Custom Fields |

### 4.2 Custom Field Options

**Object:** `customFieldOption`

Options for multi-select custom fields.

| Property | Type   | Description               |
| -------- | ------ | ------------------------- |
| `id`     | string | Unique identifier         |
| `object` | string | `"customFieldOption"`     |
| `key`    | string | The key value used in API |
| `label`  | string | Display label             |

**Endpoints:**

| Method | Path                       | Description               |
| ------ | -------------------------- | ------------------------- |
| `GET`  | `/v1/custom-field-options` | List Custom Field Options |

### 4.3 Notes

**Object:** `note`

| Property    | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `id`        | string | Unique identifier               |
| `object`    | string | `"note"`                        |
| `createdAt` | string | RFC3339 date created            |
| `updatedAt` | string | RFC3339 date updated            |
| `content`   | string | Note content                    |
| `clientId`  | string | Associated client ID            |
| `companyId` | string | Associated company ID           |
| `createdBy` | string | ID of user who created the note |

**Endpoints:**

| Method   | Path             | Description   |
| -------- | ---------------- | ------------- |
| `POST`   | `/v1/notes`      | Create Note   |
| `PATCH`  | `/v1/notes/{id}` | Update Note   |
| `GET`    | `/v1/notes/{id}` | Retrieve Note |
| `GET`    | `/v1/notes`      | List Notes    |
| `DELETE` | `/v1/notes/{id}` | Delete Note   |

**Create Note Request Body:**

| Field       | Type   | Required | Description              |
| ----------- | ------ | -------- | ------------------------ |
| `content`   | string | Yes      | Note content             |
| `clientId`  | string | Yes      | Client to attach note to |
| `companyId` | string | No       | Company context          |

---

## 5. Messaging

### 5.1 Message Channels

**Object:** `messageChannel`

Channels where messages are exchanged. Membership types: `individual` (single client), `company` (all clients in company), `group` (fluid list of clients).

| Property                 | Type           | Description                                     |
| ------------------------ | -------------- | ----------------------------------------------- |
| `id`                     | string         | Unique identifier (not always UUID format)      |
| `object`                 | string         | `"messageChannel"`                              |
| `createdAt`              | string         | RFC3339 date created                            |
| `updatedAt`              | string         | RFC3339 date updated                            |
| `membershipType`         | string         | `individual` \| `group` \| `company`            |
| ~~`membershipEntityId`~~ | string         | **Deprecated** — use `clientId`/`companyId`     |
| `clientId`               | string \| null | Client ID (set when `individual`)               |
| `companyId`              | string \| null | Company ID                                      |
| `memberIds`              | array(string)  | UUIDs of all members (clients + internal users) |
| `lastMessageDate`        | string \| null | Timestamp of last message (null if none)        |

**Example:**

```json
{
  "id": "s6v9eziejrrmad40vf3vgp",
  "object": "messageChannel",
  "createdAt": "2022-08-07T15:04:23.024217Z",
  "updatedAt": "2022-08-07T15:12:05.024217Z",
  "membershipType": "company",
  "membershipEntityId": "a6fcd58b-fc40-46e1-ab49-219ec8162a6b",
  "companyId": "a6fcd58b-fc40-46e1-ab49-219ec8162a6b",
  "memberIds": [
    "b22a34db-f6ba-40cb-a415-c112d4c853d8",
    "1dbb3e36-af70-4f41-89e6-6ddf9e2c62b5",
    "5c65898e-ce60-4668-b7c8-901a124d046b"
  ],
  "lastMessageDate": "2023-06-26T20:13:53.700046Z"
}
```

**Endpoints:**

| Method | Path                        | Description              |
| ------ | --------------------------- | ------------------------ |
| `POST` | `/v1/message-channels`      | Create Message Channel   |
| `GET`  | `/v1/message-channels/{id}` | Retrieve Message Channel |
| `GET`  | `/v1/message-channels`      | List Message Channels    |

**Create Message Channel Request Body:**

| Field            | Type          | Required    | Description                          |
| ---------------- | ------------- | ----------- | ------------------------------------ |
| `membershipType` | string        | Yes         | `individual` \| `group` \| `company` |
| `clientId`       | string        | Conditional | Required for `individual`            |
| `companyId`      | string        | Conditional | Required for `company`/`group`       |
| `memberIds`      | array(string) | No          | Member UUIDs (for `group`)           |

### 5.2 Messages

**Object:** `message`

A message sent by an Internal User or Client inside a Message Channel. Supports basic markdown-style formatting.

| Property               | Type    | Description                                |
| ---------------------- | ------- | ------------------------------------------ |
| `id`                   | string  | Unique identifier                          |
| `object`               | string  | `"message"`                                |
| `senderId`             | string  | ID of the user who sent the message        |
| `createdAt`            | string  | RFC3339 date created                       |
| `updatedAt`            | string  | RFC3339 date updated                       |
| `channelId`            | string  | ID of the message channel                  |
| `text`                 | string  | Message text content (supports markdown)   |
| `isAttachmentIncluded` | boolean | Whether the message includes an attachment |

**Example:**

```json
{
  "id": "fbd5a90b-5216-4230-bcd2-0d6a746aeb65",
  "object": "message",
  "senderId": "1dbb3e36-af70-4f41-89e6-6ddf9e2c62b5",
  "createdAt": "2023-08-07T15:11:13.549092588Z",
  "updatedAt": "2023-08-07T15:11:13.549092588Z",
  "channelId": "602f5afd-2a42-47a4-a5e0-c3db0adf966a",
  "isAttachmentIncluded": true,
  "text": "**Urgent**!\n My favorite portal is [Assembly](https://assembly.com)."
}
```

**Endpoints:**

| Method | Path           | Description   |
| ------ | -------------- | ------------- |
| `POST` | `/v1/messages` | Send Message  |
| `GET`  | `/v1/messages` | List Messages |

**Send Message Request Body:**

| Field       | Type   | Required | Description                      |
| ----------- | ------ | -------- | -------------------------------- |
| `channelId` | string | Yes      | Message channel ID               |
| `senderId`  | string | Yes      | Sender user ID                   |
| `text`      | string | Yes      | Message text (supports markdown) |

---

## 6. Billing

### 6.1 Products

**Object:** `product`

| Property      | Type   | Description          |
| ------------- | ------ | -------------------- |
| `id`          | string | Unique identifier    |
| `object`      | string | `"product"`          |
| `createdAt`   | string | RFC3339 date created |
| `updatedAt`   | string | RFC3339 date updated |
| `name`        | string | Product name         |
| `description` | string | Product description  |

**Endpoints:**

| Method | Path                | Description      |
| ------ | ------------------- | ---------------- |
| `GET`  | `/v1/products`      | List Products    |
| `GET`  | `/v1/products/{id}` | Retrieve Product |

### 6.2 Prices

**Object:** `price`

| Property    | Type   | Description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| `id`        | string | Unique identifier                                    |
| `object`    | string | `"price"`                                            |
| `productId` | string | Associated product ID                                |
| `amount`    | number | Price amount (in smallest currency unit, e.g. cents) |
| `currency`  | string | Currency code (e.g. `"usd"`)                         |
| `interval`  | string | Billing interval for recurring prices                |

**Endpoints:**

| Method | Path              | Description    |
| ------ | ----------------- | -------------- |
| `GET`  | `/v1/prices`      | List Prices    |
| `GET`  | `/v1/prices/{id}` | Retrieve Price |

### 6.3 Invoice Templates

**Endpoints:**

| Method | Path                    | Description            |
| ------ | ----------------------- | ---------------------- |
| `GET`  | `/v1/invoice-templates` | List Invoice Templates |

### 6.4 Invoices

**Object:** `invoice`

| Property                   | Type           | Description                                 |
| -------------------------- | -------------- | ------------------------------------------- |
| `id`                       | string         | Unique identifier                           |
| `object`                   | string         | `"invoice"`                                 |
| `createdAt`                | string         | RFC3339 date created                        |
| `updatedAt`                | string         | RFC3339 date updated                        |
| `clientId`                 | string         | Client ID                                   |
| `companyId`                | string         | Company ID                                  |
| ~~`recipientId`~~          | string         | **Deprecated** — use `clientId`/`companyId` |
| `sentDate`                 | string         | RFC3339 date sent                           |
| `paymentSuccessDate`       | string \| null | RFC3339 date paid (null if manual/unpaid)   |
| `status`                   | string         | `draft` \| `open` \| `paid` \| `void`       |
| `currency`                 | string         | Currency code (e.g. `"usd"`)                |
| `dueDate`                  | string         | RFC3339 due date                            |
| `total`                    | number         | Total amount (smallest currency unit)       |
| `taxPercentage`            | number         | Tax percentage                              |
| `taxAmount`                | number         | Computed tax amount                         |
| `lineItems`                | array(object)  | Line items (see below)                      |
| `memo`                     | string         | Invoice memo                                |
| `number`                   | string         | Invoice number                              |
| `collectionMethod`         | string         | e.g. `"sendInvoice"`                        |
| `billingReason`            | string         | e.g. `"manual"`                             |
| `receiptNumber`            | string         | Receipt number                              |
| `receiptUrl`               | string         | Receipt URL                                 |
| `fileUrl`                  | string         | Download file URL                           |
| `paymentMethodPreferences` | array(object)  | Payment method configs (see below)          |

**Line Item:**

| Field         | Type   | Description      |
| ------------- | ------ | ---------------- |
| `amount`      | number | Amount           |
| `description` | string | Item description |
| `priceId`     | string | Price ID         |
| `productId`   | string | Product ID       |
| `quantity`    | number | Quantity         |

**Payment Method Preference:**

| Field             | Type    | Description                             |
| ----------------- | ------- | --------------------------------------- |
| `type`            | string  | `"creditCard"` \| `"bankAccount"`       |
| `feePaidByClient` | boolean | Whether client pays the transaction fee |

**Example:**

```json
{
  "id": "in_1POkjGFdviIHOKAncZ4XrBe0",
  "object": "invoice",
  "collectionMethod": "sendInvoice",
  "createdAt": "2024-06-06T18:08:05.618445Z",
  "updatedAt": "2024-06-06T18:08:05.618445Z",
  "currency": "usd",
  "dueDate": "2024-06-14T18:08:01.292Z",
  "clientId": "d0000000-d7a5-473d-a75b-9821a8f4e180",
  "companyId": "04a818c2-d035-495c-9cc2-06a11a8b91f6",
  "sentDate": "2024-06-06T14:08:05.618421-04:00",
  "status": "draft",
  "taxAmount": 0,
  "taxPercentage": 0,
  "total": 10000,
  "lineItems": [
    {
      "amount": 10000,
      "description": "Product A",
      "priceId": "F0tsrfYSg",
      "productId": "aae1c02f-c524-4601-bbcb-34d6379e76e3",
      "quantity": 1
    }
  ],
  "memo": "Invoice amount",
  "billingReason": "manual",
  "paymentMethodPreferences": [
    { "type": "creditCard", "feePaidByClient": false },
    { "type": "bankAccount", "feesPaidByClient": true }
  ]
}
```

**Endpoints:**

| Method | Path                | Description      |
| ------ | ------------------- | ---------------- |
| `GET`  | `/v1/invoices/{id}` | Retrieve Invoice |
| `GET`  | `/v1/invoices`      | List Invoices    |
| `POST` | `/v1/invoices`      | Create Invoice   |

**Create Invoice Request Body:**

| Field                      | Type          | Required | Description                                                                 |
| -------------------------- | ------------- | -------- | --------------------------------------------------------------------------- |
| `clientId`                 | string        | Yes      | Client ID                                                                   |
| `companyId`                | string        | No       | Company ID                                                                  |
| `lineItems`                | array(object) | Yes      | Line items with `amount`, `description`, `priceId`, `productId`, `quantity` |
| `currency`                 | string        | No       | Currency code                                                               |
| `dueDate`                  | string        | No       | Due date                                                                    |
| `memo`                     | string        | No       | Invoice memo                                                                |
| `paymentMethodPreferences` | array(object) | No       | Payment method configs                                                      |

### 6.5 Subscription Templates

**Endpoints:**

| Method | Path                         | Description                 |
| ------ | ---------------------------- | --------------------------- |
| `GET`  | `/v1/subscription-templates` | List Subscription Templates |

### 6.6 Subscriptions

**Object:** `subscription`

| Property          | Type   | Description                                 |
| ----------------- | ------ | ------------------------------------------- |
| `id`              | string | Unique identifier                           |
| `object`          | string | `"subscription"`                            |
| `createdAt`       | string | RFC3339 date created                        |
| `updatedAt`       | string | RFC3339 date updated                        |
| `clientId`        | string | Client ID                                   |
| `companyId`       | string | Company ID                                  |
| ~~`recipientId`~~ | string | **Deprecated** — use `clientId`/`companyId` |
| `status`          | string | Subscription status                         |
| `interval`        | string | Billing interval                            |

**Endpoints:**

| Method | Path                            | Description           |
| ------ | ------------------------------- | --------------------- |
| `POST` | `/v1/subscriptions`             | Create Subscription   |
| `GET`  | `/v1/subscriptions/{id}`        | Retrieve Subscription |
| `POST` | `/v1/subscriptions/{id}/cancel` | Cancel Subscription   |
| `GET`  | `/v1/subscriptions`             | List Subscriptions    |

**Create Subscription Request Body:**

| Field       | Type   | Required | Description |
| ----------- | ------ | -------- | ----------- |
| `clientId`  | string | Yes      | Client ID   |
| `companyId` | string | No       | Company ID  |

### 6.7 Payments

**Object:** `payment`

| Property    | Type   | Description           |
| ----------- | ------ | --------------------- |
| `id`        | string | Unique identifier     |
| `object`    | string | `"payment"`           |
| `createdAt` | string | RFC3339 date created  |
| `amount`    | number | Payment amount        |
| `currency`  | string | Currency code         |
| `invoiceId` | string | Associated invoice ID |
| `status`    | string | Payment status        |

**Endpoints:**

| Method | Path           | Description   |
| ------ | -------------- | ------------- |
| `GET`  | `/v1/payments` | List Payments |

---

## 7. Files

### 7.1 File Channels

**Object:** `fileChannel`

Channels for sharing files. Membership types: `individual` (single client), `company` (all clients in company), `group` (fluid list of clients).

| Property                 | Type           | Description                                 |
| ------------------------ | -------------- | ------------------------------------------- |
| `id`                     | string         | Unique identifier (not always UUID format)  |
| `object`                 | string         | `"fileChannel"`                             |
| `createdAt`              | string         | RFC3339 date created                        |
| `updatedAt`              | string         | RFC3339 date updated                        |
| `clientId`               | string \| null | Client ID (set when `individual`)           |
| `companyId`              | string \| null | Company ID                                  |
| `membershipType`         | string         | `individual` \| `group` \| `company`        |
| ~~`membershipEntityId`~~ | string         | **Deprecated** — use `clientId`/`companyId` |
| `memberIds`              | array(string)  | UUIDs of all channel members                |

**Example:**

```json
{
  "id": "us-east-1_JDwzcwQiA/339b6252-d773-4c58-a5ef-236ac3edc566",
  "object": "fileChannel",
  "createdAt": "2022-08-07T15:04:23Z",
  "updatedAt": "2022-08-07T15:12:05Z",
  "membershipType": "individual",
  "membershipEntityId": "a6fcd58b-fc40-46e1-ab49-219ec8162a6b",
  "clientId": "a6fcd58b-fc40-46e1-ab49-219ec8162a6b",
  "memberIds": ["a6fcd58b-fc40-46e1-ab49-219ec8162a6b"]
}
```

**Endpoints:**

| Method | Path                     | Description           |
| ------ | ------------------------ | --------------------- |
| `POST` | `/v1/file-channels`      | Create File Channel   |
| `GET`  | `/v1/file-channels/{id}` | Retrieve File Channel |
| `GET`  | `/v1/file-channels`      | List File Channels    |

**Create File Channel Request Body:**

| Field            | Type   | Required    | Description                          |
| ---------------- | ------ | ----------- | ------------------------------------ |
| `membershipType` | string | Yes         | `individual` \| `group` \| `company` |
| `clientId`       | string | Conditional | Required for `individual`            |
| `companyId`      | string | Conditional | Required for `company`/`group`       |

### 7.2 Files

**Object:** `file`

File objects represent files, folders, or links in a file channel.

| Property    | Type   | Description                   |
| ----------- | ------ | ----------------------------- |
| `id`        | string | Unique identifier             |
| `object`    | string | `"file"`                      |
| `createdAt` | string | RFC3339 date created          |
| `updatedAt` | string | RFC3339 date updated          |
| `channelId` | string | File channel ID               |
| `fileType`  | string | `file` \| `folder` \| `link`  |
| `name`      | string | File/folder/link name         |
| `path`      | string | Path in the file hierarchy    |
| `url`       | string | File download URL or link URL |

**Endpoints:**

| Method   | Path                         | Description                                                        |
| -------- | ---------------------------- | ------------------------------------------------------------------ |
| `POST`   | `/v1/files/{fileType}`       | Create File (`file` \| `folder` \| `link`)                         |
| `GET`    | `/v1/files/{id}`             | Retrieve File                                                      |
| `GET`    | `/v1/files`                  | List Files (supports `path` param for folder filtering, recursive) |
| `DELETE` | `/v1/files/{id}`             | Delete File                                                        |
| `PUT`    | `/v1/files/{id}/permissions` | Update Folder Client Permissions                                   |

---

## 8. Contracts

### 8.1 Contract Templates

**Object:** `contractTemplate`

| Property    | Type   | Description          |
| ----------- | ------ | -------------------- |
| `id`        | string | Unique identifier    |
| `object`    | string | `"contractTemplate"` |
| `createdAt` | string | RFC3339 date created |
| `updatedAt` | string | RFC3339 date updated |
| `name`      | string | Template name        |

**Endpoints:**

| Method | Path                          | Description                |
| ------ | ----------------------------- | -------------------------- |
| `GET`  | `/v1/contract-templates/{id}` | Retrieve Contract Template |
| `GET`  | `/v1/contract-templates`      | List Contract Templates    |

### 8.2 Contracts

**Object:** `contract`

| Property             | Type          | Description                                 |
| -------------------- | ------------- | ------------------------------------------- |
| `id`                 | string        | Unique identifier                           |
| `object`             | string        | `"contract"`                                |
| `createdAt`          | string        | RFC3339 date created                        |
| `updatedAt`          | string        | RFC3339 date updated                        |
| `contractTemplateId` | string        | Parent template ID                          |
| `clientId`           | string        | Client ID                                   |
| `companyId`          | string        | Company ID                                  |
| ~~`recipientId`~~    | string        | **Deprecated** — use `clientId`/`companyId` |
| `name`               | string        | Contract name (from template)               |
| `shareDate`          | string        | Date sent to recipient                      |
| `status`             | string        | `pending` \| `signed`                       |
| `fileUrl`            | string        | Contract file URL                           |
| `signedFileUrl`      | string        | Signed file URL                             |
| `fields`             | array(object) | Contract fields (see below)                 |

**Contract Field:**

| Property     | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| `id`         | string  | Field identifier                                |
| `inputType`  | string  | `fixed` \| `autoFill` \| `client` \| `variable` |
| `isOptional` | boolean | Whether field was optional                      |
| `label`      | string  | Field label                                     |
| `page`       | number  | Page number                                     |
| `type`       | string  | Field type (e.g. `"signature"`)                 |
| `value`      | string  | Submitted value                                 |

**Example:**

```json
{
  "id": "5IlqGIdSg",
  "object": "contract",
  "contractTemplateId": "1b458c73-a354-43b6-8628-a4c3ed8aee18",
  "createdAt": "2023-12-20T19:54:32.044269079Z",
  "updatedAt": "2023-12-20T19:54:32.044269079Z",
  "clientId": "9d69828c-5806-4f5a-b75b-60513d86676b",
  "companyId": "04a818c2-d035-495c-9cc2-06a11a8b91f6",
  "name": "Old signed file",
  "shareDate": "2023-12-20T19:54:32.036655259Z",
  "status": "signed",
  "fields": [
    {
      "id": "0fda76f5-...",
      "inputType": "client",
      "isOptional": false,
      "label": "signature_1",
      "page": 1,
      "type": "signature",
      "value": "John Client"
    }
  ]
}
```

**Endpoints:**

| Method | Path                 | Description       |
| ------ | -------------------- | ----------------- |
| `POST` | `/v1/contracts`      | Send Contract     |
| `GET`  | `/v1/contracts/{id}` | Retrieve Contract |
| `GET`  | `/v1/contracts`      | List Contracts    |

**Send Contract Request Body:**

| Field                | Type   | Required | Description       |
| -------------------- | ------ | -------- | ----------------- |
| `contractTemplateId` | string | Yes      | Template to use   |
| `clientId`           | string | Yes      | Client to send to |
| `companyId`          | string | No       | Company context   |

---

## 9. Forms

### 9.1 Forms

**Object:** `form`

Represents the questions and configuration of a form. Responses are stored as Form Response entities.

| Property               | Type           | Description                         |
| ---------------------- | -------------- | ----------------------------------- |
| `id`                   | string         | Unique identifier                   |
| `object`               | string         | `"form"`                            |
| `createdAt`            | string         | RFC3339 date created                |
| `updatedAt`            | string         | RFC3339 date updated                |
| `name`                 | string         | Form name                           |
| `latestSubmissionDate` | string \| null | Timestamp of most recent submission |

> **Note:** Nested `fields` object is deprecated; properties are now top-level.

**Endpoints:**

| Method | Path             | Description   |
| ------ | ---------------- | ------------- |
| `GET`  | `/v1/forms/{id}` | Retrieve Form |
| `GET`  | `/v1/forms`      | List Forms    |

### 9.2 Form Responses

**Object:** `formResponse`

| Property    | Type   | Description          |
| ----------- | ------ | -------------------- |
| `id`        | string | Unique identifier    |
| `object`    | string | `"formResponse"`     |
| `createdAt` | string | RFC3339 date created |
| `updatedAt` | string | RFC3339 date updated |
| `formId`    | string | Associated form ID   |
| `clientId`  | string | Client ID            |
| `companyId` | string | Company ID           |
| `status`    | string | Response status      |

**Endpoints:**

| Method | Path                 | Description           |
| ------ | -------------------- | --------------------- |
| `POST` | `/v1/form-responses` | Request Form Response |
| `GET`  | `/v1/form-responses` | List Form Responses   |

**Request Form Response Body:**

| Field       | Type   | Required | Description            |
| ----------- | ------ | -------- | ---------------------- |
| `formId`    | string | Yes      | Form to send           |
| `clientId`  | string | Yes      | Client to request from |
| `companyId` | string | No       | Company context        |

---

## 10. Tasks

### 10.1 Task Templates

**Object:** `taskTemplate`

| Property      | Type   | Description          |
| ------------- | ------ | -------------------- |
| `id`          | string | Unique identifier    |
| `object`      | string | `"taskTemplate"`     |
| `createdAt`   | string | RFC3339 date created |
| `updatedAt`   | string | RFC3339 date updated |
| `title`       | string | Template title       |
| `description` | string | Template description |

**Endpoints:**

| Method | Path                      | Description            |
| ------ | ------------------------- | ---------------------- |
| `GET`  | `/v1/task-templates`      | List Task Templates    |
| `GET`  | `/v1/task-templates/{id}` | Retrieve Task Template |

### 10.2 Tasks

**Object:** `task`

Tasks can be assigned to internal users, clients, or companies.

| Property       | Type           | Description                                          |
| -------------- | -------------- | ---------------------------------------------------- |
| `id`           | string         | Unique identifier                                    |
| `object`       | string         | `"task"`                                             |
| `createdAt`    | string         | RFC3339 date created                                 |
| `updatedAt`    | string         | RFC3339 date updated                                 |
| `title`        | string         | Task title                                           |
| `description`  | string         | Task description (supports rich text/attachments)    |
| `status`       | string         | `todo` \| `inProgress` \| `done`                     |
| `assigneeId`   | string         | Assigned user ID (internal user, client, or company) |
| `assigneeType` | string         | Type of assignee                                     |
| `dueDate`      | string \| null | Due date                                             |
| `createdBy`    | string         | Creator user ID                                      |

**Endpoints:**

| Method   | Path             | Description   |
| -------- | ---------------- | ------------- |
| `GET`    | `/v1/tasks`      | List Tasks    |
| `GET`    | `/v1/tasks/{id}` | Retrieve Task |
| `POST`   | `/v1/tasks`      | Create Task   |
| `PATCH`  | `/v1/tasks/{id}` | Update Task   |
| `DELETE` | `/v1/tasks/{id}` | Delete Task   |

**Create Task Request Body:**

| Field         | Type   | Required | Description                      |
| ------------- | ------ | -------- | -------------------------------- |
| `title`       | string | Yes      | Task title                       |
| `description` | string | No       | Task description                 |
| `status`      | string | No       | `todo` \| `inProgress` \| `done` |
| `assigneeId`  | string | No       | User/client/company to assign to |
| `dueDate`     | string | No       | Due date                         |

---

## 11. Other

### 11.1 App Connections

**Object:** `appConnection`

A connection between a manual-type App Install and a Client/Company/group.

| Property         | Type                  | Description                              |
| ---------------- | --------------------- | ---------------------------------------- |
| `id`             | string                | Unique identifier                        |
| `object`         | string                | `"appConnection"`                        |
| `createdAt`      | string                | RFC3339 date created                     |
| `updatedAt`      | string                | RFC3339 date updated                     |
| `installId`      | string                | Parent app install ID                    |
| `type`           | string                | `"embed"` \| `"link"`                    |
| `content`        | string                | URL or iframe content                    |
| `clientIds`      | array(string) \| null | Shared client IDs (for individual/group) |
| `companyId`      | string \| null        | Company ID (for company membership)      |
| `membershipType` | string                | `individual` \| `group` \| `company`     |

**Example:**

```json
{
  "id": "498249d7-a26a-40cc-83a8-2fa9c5cbee26",
  "object": "appConnection",
  "type": "link",
  "content": "https://specific-link.com",
  "clientIds": null,
  "companyId": "48828ede-1d82-4012-9544-5f1b028f1654",
  "membershipType": "company",
  "installId": "21e21a4e-6bbb-47d0-a9bd-c4e99a3ca9a2",
  "createdAt": "2024-03-29T16:42:31.267076692Z",
  "updatedAt": "2024-03-29T16:42:31.267076692Z"
}
```

**Endpoints:**

| Method | Path                  | Description           |
| ------ | --------------------- | --------------------- |
| `GET`  | `/v1/app-connections` | List App Connections  |
| `POST` | `/v1/app-connections` | Create App Connection |

**Create App Connection Request Body:**

| Field            | Type          | Required    | Description                          |
| ---------------- | ------------- | ----------- | ------------------------------------ |
| `installId`      | string        | Yes         | App install ID                       |
| `type`           | string        | Yes         | `"embed"` \| `"link"`                |
| `content`        | string        | Yes         | URL or iframe content                |
| `membershipType` | string        | Yes         | `individual` \| `group` \| `company` |
| `clientIds`      | array(string) | Conditional | For individual/group                 |
| `companyId`      | string        | Conditional | For company                          |

### 11.2 App Installs

**Object:** `appInstall`

Represents an installed app in a workspace.

| Property      | Type   | Description                                                           |
| ------------- | ------ | --------------------------------------------------------------------- |
| `id`          | string | Unique identifier                                                     |
| `object`      | string | `"appInstall"`                                                        |
| `appId`       | string | Source app ID (for core/marketplace installs; empty for links/embeds) |
| `displayName` | string | Label shown in workspace sidebar                                      |
| `type`        | string | `core` \| `custom` \| `marketplace` \| `embed` \| `link` \| `manual`  |

**Examples:**

```json
{ "appId": "38323633-6465-6132-3730-383065323230", "displayName": "Messages", "id": "62346132-6462-3736-3733-366430333631", "type": "core", "object": "appInstall" }
{ "appId": "a6e3a6f3-2f2a-4c79-b77c-9508da6e80dc", "displayName": "Home", "id": "15dadd33-1e63-4e59-9752-d5e916cfae59", "type": "marketplace", "object": "appInstall" }
{ "appId": "", "displayName": "Schedule with me", "id": "45729d42-f825-491e-aec4-a58a5a4f74fe", "type": "link", "object": "appInstall" }
```

**Endpoints:**

| Method | Path               | Description       |
| ------ | ------------------ | ----------------- |
| `GET`  | `/v1/app-installs` | List App Installs |

### 11.3 Notifications

**Object:** `notification`

Notifications can target internal users (notification center) and clients (badge count on sidebar). Supports `inProduct` and `email` delivery targets.

| Property          | Type    | Description                        |
| ----------------- | ------- | ---------------------------------- |
| `id`              | string  | Unique identifier                  |
| `object`          | string  | `"notification"`                   |
| `createdAt`       | string  | RFC3339 date created               |
| `senderId`        | string  | Sender user ID                     |
| `recipientId`     | string  | Recipient user ID                  |
| `isRead`          | boolean | Read status                        |
| `deliveryTargets` | object  | Delivery configuration (see below) |

**Delivery Targets:**

```json
{
  "inProduct": {
    "title": "Action completed",
    "body": "An action was completed in your workspace."
  },
  "email": {
    "subject": "Email subject line",
    "body": "This is the body of the email notification"
  }
}
```

**Endpoints:**

| Method   | Path                            | Description              |
| -------- | ------------------------------- | ------------------------ |
| `GET`    | `/v1/notifications`             | List Notifications       |
| `POST`   | `/v1/notifications`             | Create Notification      |
| `DELETE` | `/v1/notifications/{id}`        | Delete Notification      |
| `POST`   | `/v1/notifications/{id}/read`   | Mark Notification Read   |
| `POST`   | `/v1/notifications/{id}/unread` | Mark Notification Unread |

**Create Notification Request Body:**

| Field                             | Type   | Required | Description                        |
| --------------------------------- | ------ | -------- | ---------------------------------- |
| `senderId`                        | string | Yes      | Sender user ID                     |
| `recipientId`                     | string | Yes      | Recipient user ID                  |
| `deliveryTargets`                 | object | Yes      | `inProduct` and/or `email` targets |
| `deliveryTargets.inProduct.title` | string | Yes      | In-product notification title      |
| `deliveryTargets.inProduct.body`  | string | Yes      | In-product notification body       |
| `deliveryTargets.email.subject`   | string | No       | Email subject                      |
| `deliveryTargets.email.body`      | string | No       | Email body                         |

---

## Endpoint Summary (All 71 Endpoints)

| #   | Method | Resource               | Endpoint                        |
| --- | ------ | ---------------------- | ------------------------------- |
| 1   | POST   | Clients                | `/v1/clients`                   |
| 2   | GET    | Clients                | `/v1/clients/{id}`              |
| 3   | PATCH  | Clients                | `/v1/clients/{id}`              |
| 4   | DELETE | Clients                | `/v1/clients/{id}`              |
| 5   | GET    | Clients                | `/v1/clients`                   |
| 6   | POST   | Companies              | `/v1/companies`                 |
| 7   | GET    | Companies              | `/v1/companies/{id}`            |
| 8   | PATCH  | Companies              | `/v1/companies/{id}`            |
| 9   | DELETE | Companies              | `/v1/companies/{id}`            |
| 10  | GET    | Companies              | `/v1/companies`                 |
| 11  | GET    | Internal Users         | `/v1/internal-users/{id}`       |
| 12  | GET    | Internal Users         | `/v1/internal-users`            |
| 13  | GET    | Workspaces             | `/v1/workspaces`                |
| 14  | GET    | Custom Fields          | `/v1/custom-fields`             |
| 15  | GET    | Custom Field Options   | `/v1/custom-field-options`      |
| 16  | POST   | Notes                  | `/v1/notes`                     |
| 17  | PATCH  | Notes                  | `/v1/notes/{id}`                |
| 18  | GET    | Notes                  | `/v1/notes/{id}`                |
| 19  | GET    | Notes                  | `/v1/notes`                     |
| 20  | DELETE | Notes                  | `/v1/notes/{id}`                |
| 21  | POST   | Message Channels       | `/v1/message-channels`          |
| 22  | GET    | Message Channels       | `/v1/message-channels/{id}`     |
| 23  | GET    | Message Channels       | `/v1/message-channels`          |
| 24  | POST   | Messages               | `/v1/messages`                  |
| 25  | GET    | Messages               | `/v1/messages`                  |
| 26  | GET    | Products               | `/v1/products`                  |
| 27  | GET    | Products               | `/v1/products/{id}`             |
| 28  | GET    | Prices                 | `/v1/prices`                    |
| 29  | GET    | Prices                 | `/v1/prices/{id}`               |
| 30  | GET    | Invoice Templates      | `/v1/invoice-templates`         |
| 31  | GET    | Invoices               | `/v1/invoices/{id}`             |
| 32  | GET    | Invoices               | `/v1/invoices`                  |
| 33  | POST   | Invoices               | `/v1/invoices`                  |
| 34  | GET    | Subscription Templates | `/v1/subscription-templates`    |
| 35  | POST   | Subscriptions          | `/v1/subscriptions`             |
| 36  | GET    | Subscriptions          | `/v1/subscriptions/{id}`        |
| 37  | POST   | Subscriptions          | `/v1/subscriptions/{id}/cancel` |
| 38  | GET    | Subscriptions          | `/v1/subscriptions`             |
| 39  | GET    | Payments               | `/v1/payments`                  |
| 40  | POST   | File Channels          | `/v1/file-channels`             |
| 41  | GET    | File Channels          | `/v1/file-channels/{id}`        |
| 42  | GET    | File Channels          | `/v1/file-channels`             |
| 43  | POST   | Files                  | `/v1/files/{fileType}`          |
| 44  | GET    | Files                  | `/v1/files/{id}`                |
| 45  | GET    | Files                  | `/v1/files`                     |
| 46  | DELETE | Files                  | `/v1/files/{id}`                |
| 47  | PUT    | Files                  | `/v1/files/{id}/permissions`    |
| 48  | GET    | Contract Templates     | `/v1/contract-templates/{id}`   |
| 49  | GET    | Contract Templates     | `/v1/contract-templates`        |
| 50  | POST   | Contracts              | `/v1/contracts`                 |
| 51  | GET    | Contracts              | `/v1/contracts/{id}`            |
| 52  | GET    | Contracts              | `/v1/contracts`                 |
| 53  | GET    | Forms                  | `/v1/forms/{id}`                |
| 54  | GET    | Forms                  | `/v1/forms`                     |
| 55  | POST   | Form Responses         | `/v1/form-responses`            |
| 56  | GET    | Form Responses         | `/v1/form-responses`            |
| 57  | GET    | Task Templates         | `/v1/task-templates`            |
| 58  | GET    | Task Templates         | `/v1/task-templates/{id}`       |
| 59  | GET    | Tasks                  | `/v1/tasks`                     |
| 60  | GET    | Tasks                  | `/v1/tasks/{id}`                |
| 61  | POST   | Tasks                  | `/v1/tasks`                     |
| 62  | PATCH  | Tasks                  | `/v1/tasks/{id}`                |
| 63  | DELETE | Tasks                  | `/v1/tasks/{id}`                |
| 64  | GET    | App Connections        | `/v1/app-connections`           |
| 65  | POST   | App Connections        | `/v1/app-connections`           |
| 66  | GET    | App Installs           | `/v1/app-installs`              |
| 67  | GET    | Notifications          | `/v1/notifications`             |
| 68  | POST   | Notifications          | `/v1/notifications`             |
| 69  | DELETE | Notifications          | `/v1/notifications/{id}`        |
| 70  | POST   | Notifications          | `/v1/notifications/{id}/read`   |
| 71  | POST   | Notifications          | `/v1/notifications/{id}/unread` |

---

_Source: [Assembly API Reference](https://docs.assembly.com/reference/getting-started-introduction)_
