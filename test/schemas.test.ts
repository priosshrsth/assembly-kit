import { describe, expect, it } from "bun:test";

import {
  ClientCreateRequestSchema,
  ClientSchema,
  CompaniesResponseSchema,
  CompanyCreateRequestSchema,
  CompanySchema,
  CustomFieldEntityTypeSchema,
  CustomFieldSchema,
  CustomFieldTypeSchema,
  HexColorSchema,
  InternalUserSchema,
  ListCustomFieldResponseSchema,
  NotificationCreateRequestSchema,
  NotificationsResponseSchema,
  TaskStatusSchema,
  TasksResponseSchema,
  TokenPayloadSchema,
  WorkspaceSchema,
} from "src/schemas";
import type { z } from "zod";

// ─── HexColorSchema ───────────────────────────────────────────────────────────

describe("HexColorSchema", () => {
  it("accepts 3-digit hex", () => {
    expect(HexColorSchema.safeParse("#abc").success).toBe(true);
  });

  it("accepts 6-digit hex", () => {
    expect(HexColorSchema.safeParse("#1A2B3C").success).toBe(true);
  });

  it("rejects hex without #", () => {
    expect(HexColorSchema.safeParse("1A2B3C").success).toBe(false);
  });

  it("rejects invalid hex characters", () => {
    expect(HexColorSchema.safeParse("#GGGGGG").success).toBe(false);
  });

  it("rejects 4-digit hex", () => {
    expect(HexColorSchema.safeParse("#1234").success).toBe(false);
  });
});

// ─── TokenPayloadSchema ───────────────────────────────────────────────────────

describe("TokenPayloadSchema", () => {
  it("accepts a client token (clientId + companyId)", () => {
    const result = TokenPayloadSchema.safeParse({
      clientId: "c1",
      companyId: "co1",
      workspaceId: "ws1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an internal user token (internalUserId)", () => {
    const result = TokenPayloadSchema.safeParse({
      internalUserId: "u1",
      workspaceId: "ws1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields tokenId, notificationId, baseUrl", () => {
    const result = TokenPayloadSchema.safeParse({
      baseUrl: "https://api.example.com",
      internalUserId: "u1",
      notificationId: "n1",
      tokenId: "t1",
      workspaceId: "ws1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects token missing both internalUserId and clientId+companyId", () => {
    const result = TokenPayloadSchema.safeParse({ workspaceId: "ws1" });
    expect(result.success).toBe(false);
  });

  it("rejects clientId without companyId", () => {
    const result = TokenPayloadSchema.safeParse({
      clientId: "c1",
      workspaceId: "ws1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing workspaceId", () => {
    const result = TokenPayloadSchema.safeParse({ internalUserId: "u1" });
    expect(result.success).toBe(false);
  });

  it("strips unknown fields", () => {
    const data = TokenPayloadSchema.parse({
      internalUserId: "u1",
      unknownFutureField: "should be stripped",
      workspaceId: "ws1",
    });
    expect(data).not.toHaveProperty("unknownFutureField");
  });
});

// ─── CompanySchema ────────────────────────────────────────────────────────────

describe("CompanySchema", () => {
  const valid = {
    createdAt: "2024-01-01T00:00:00.000Z",
    fallbackColor: "#FF0000",
    iconImageUrl: null,
    id: "co1",
    isPlaceholder: false,
    name: "Acme",
    object: "company" as const,
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("accepts a valid company", () => {
    expect(CompanySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable iconImageUrl and fallbackColor", () => {
    const result = CompanySchema.safeParse({ ...valid, fallbackColor: null });
    expect(result.success).toBe(true);
  });

  it("rejects missing required field name", () => {
    const { name: _, ...noName } = valid;
    expect(CompanySchema.safeParse(noName).success).toBe(false);
  });
});

// ─── ClientSchema ─────────────────────────────────────────────────────────────

describe("ClientSchema", () => {
  const valid = {
    avatarImageUrl: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    creationMethod: "internalUser" as const,
    email: "jane@example.com",
    fallbackColor: null,
    familyName: "Doe",
    firstLoginDate: null,
    givenName: "Jane",
    id: "cl1",
    lastLoginDate: null,
    object: "client" as const,
    status: "active" as const,
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("accepts a valid client", () => {
    expect(ClientSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional companyIds and customFields", () => {
    const result = ClientSchema.safeParse({
      ...valid,
      companyIds: ["550e8400-e29b-41d4-a716-446655440000"],
      customFields: { tier: "gold" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required field email", () => {
    const { email: _, ...noEmail } = valid;
    expect(ClientSchema.safeParse(noEmail).success).toBe(false);
  });
});

// ─── InternalUserSchema ───────────────────────────────────────────────────────

describe("InternalUserSchema", () => {
  const valid = {
    companyAccessList: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    email: "alice@example.com",
    familyName: "Smith",
    givenName: "Alice",
    id: "550e8400-e29b-41d4-a716-446655440000",
    isClientAccessLimited: false,
    object: "internalUser" as const,
  };

  it("accepts a valid internal user", () => {
    expect(InternalUserSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty string email (deleted user)", () => {
    const result = InternalUserSchema.safeParse({ ...valid, email: "" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid (non-empty) email format", () => {
    const result = InternalUserSchema.safeParse({
      ...valid,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("defaults isClientAccessLimited to false when absent", () => {
    const { isClientAccessLimited: _, ...noFlag } = valid;
    const data = InternalUserSchema.parse(noFlag);
    expect(data.isClientAccessLimited).toBe(false);
  });
});

// ─── WorkspaceSchema ──────────────────────────────────────────────────────────

describe("WorkspaceSchema", () => {
  it("accepts a minimal workspace", () => {
    const result = WorkspaceSchema.safeParse({
      id: "ws1",
      object: "workspace",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = WorkspaceSchema.safeParse({
      brandName: "Acme",
      font: "Inter",
      id: "ws1",
      industry: "technology",
      labels: { individualTerm: "Member" },
      object: "workspace",
      portalUrl: "https://portal.example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing object literal", () => {
    expect(WorkspaceSchema.safeParse({ id: "ws1" }).success).toBe(false);
  });
});

// ─── CustomField schemas ──────────────────────────────────────────────────────

describe("CustomFieldTypeSchema", () => {
  it("accepts all valid types", () => {
    const types = [
      "address",
      "email",
      "phoneNumber",
      "text",
      "number",
      "url",
      "multiSelect",
    ];
    for (const type of types) {
      expect(CustomFieldTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it("rejects unknown type", () => {
    expect(CustomFieldTypeSchema.safeParse("unknown").success).toBe(false);
  });
});

describe("CustomFieldEntityTypeSchema", () => {
  it("accepts client and company", () => {
    expect(CustomFieldEntityTypeSchema.safeParse("client").success).toBe(true);
    expect(CustomFieldEntityTypeSchema.safeParse("company").success).toBe(true);
  });

  it("rejects unknown entity type", () => {
    expect(CustomFieldEntityTypeSchema.safeParse("workspace").success).toBe(
      false
    );
  });
});

describe("CustomFieldSchema", () => {
  const valid = {
    entityType: "client",
    id: "cf1",
    key: "tier",
    name: "Tier",
    object: "customField",
    order: 1,
    type: "text",
  };

  it("accepts a valid custom field", () => {
    expect(CustomFieldSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid object literal", () => {
    const result = CustomFieldSchema.safeParse({
      ...valid,
      object: "notCustomField",
    });
    expect(result.success).toBe(false);
  });
});

// ─── TaskStatusSchema ─────────────────────────────────────────────────────────

describe("TaskStatusSchema", () => {
  it("accepts todo, inProgress, done", () => {
    expect(TaskStatusSchema.safeParse("todo").success).toBe(true);
    expect(TaskStatusSchema.safeParse("inProgress").success).toBe(true);
    expect(TaskStatusSchema.safeParse("done").success).toBe(true);
  });

  it("rejects unknown status", () => {
    expect(TaskStatusSchema.safeParse("completed").success).toBe(false);
  });
});

// ─── Response schemas ─────────────────────────────────────────────────────────

describe("CompaniesResponseSchema", () => {
  it("accepts data array", () => {
    const result = CompaniesResponseSchema.safeParse({
      data: [
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          fallbackColor: null,
          iconImageUrl: null,
          id: "co1",
          isPlaceholder: false,
          name: "Acme",
          object: "company" as const,
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts null data", () => {
    expect(CompaniesResponseSchema.safeParse({ data: null }).success).toBe(
      true
    );
  });
});

describe("NotificationsResponseSchema", () => {
  it("accepts a notification list", () => {
    const result = NotificationsResponseSchema.safeParse({
      data: [
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          id: "n1",
          isRead: false,
          object: "notification" as const,
          recipientId: "550e8400-e29b-41d4-a716-446655440000",
          senderId: "u1",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts null data", () => {
    expect(NotificationsResponseSchema.safeParse({ data: null }).success).toBe(
      true
    );
  });
});

describe("ListCustomFieldResponseSchema", () => {
  it("accepts a custom field list", () => {
    const result = ListCustomFieldResponseSchema.safeParse({
      data: [
        {
          entityType: "client",
          id: "cf1",
          key: "tier",
          name: "Tier",
          object: "customField",
          order: 1,
          type: "text",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("TasksResponseSchema", () => {
  it("accepts a task list", () => {
    const result = TasksResponseSchema.safeParse({
      data: [
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          id: "t1",
          object: "task" as const,
          status: "todo",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          id: "t2",
          object: "task" as const,
          status: "done",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

// ─── Request schemas ──────────────────────────────────────────────────────────

describe("ClientCreateRequestSchema", () => {
  it("accepts a valid create request", () => {
    const result = ClientCreateRequestSchema.safeParse({
      email: "jane@example.com",
      familyName: "Doe",
      givenName: "Jane",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = ClientCreateRequestSchema.safeParse({
      email: "not-an-email",
      familyName: "Doe",
      givenName: "Jane",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(
      ClientCreateRequestSchema.safeParse({ email: "jane@example.com" }).success
    ).toBe(false);
  });
});

describe("CompanyCreateRequestSchema", () => {
  it("accepts a valid create request", () => {
    expect(CompanyCreateRequestSchema.safeParse({ name: "Acme" }).success).toBe(
      true
    );
  });

  it("rejects invalid fallbackColor", () => {
    const result = CompanyCreateRequestSchema.safeParse({
      fallbackColor: "red",
      name: "Acme",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid hex fallbackColor", () => {
    const result = CompanyCreateRequestSchema.safeParse({
      fallbackColor: "#FF5733",
      name: "Acme",
    });
    expect(result.success).toBe(true);
  });
});

describe("NotificationCreateRequestSchema", () => {
  it("accepts a valid notification create request", () => {
    const result = NotificationCreateRequestSchema.safeParse({
      deliveryTargets: {
        inProduct: {
          body: "An action was completed.",
          title: "Action completed",
        },
      },
      recipientId: "c1",
      senderId: "u1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing deliveryTargets", () => {
    const result = NotificationCreateRequestSchema.safeParse({
      recipientId: "c1",
      senderId: "u1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts deliveryTargets with email target", () => {
    const result = NotificationCreateRequestSchema.safeParse({
      deliveryTargets: {
        email: { body: "Email body", subject: "Subject" },
        inProduct: { body: "World", title: "Hello" },
      },
      recipientId: "c1",
      senderId: "u1",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Type inference compile-time checks ──────────────────────────────────────

describe("TypeScript type inference", () => {
  it("inferred types satisfy expected shape", () => {
    const company = {
      createdAt: "2024-01-01T00:00:00.000Z",
      fallbackColor: null,
      iconImageUrl: null,
      id: "co1",
      isPlaceholder: false,
      name: "Acme",
      object: "company" as const,
      updatedAt: "2024-01-01T00:00:00.000Z",
    } satisfies z.infer<typeof CompanySchema>;

    expect(company.id).toBe("co1");
  });
});
