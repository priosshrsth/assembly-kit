import { describe, expect, it } from "bun:test";

import { callAt, createTestClient } from "./_helpers";

const CUSTOM_FIELD_FIXTURE = {
  entityType: "client" as const,
  id: "cf-1",
  key: "myField",
  name: "My Field",
  object: "customField" as const,
  type: "text" as const,
};

describe("CustomFieldsResource", () => {
  it("list() sends GET to v1/custom-fields with entityType=client", async () => {
    const body = { data: [CUSTOM_FIELD_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.customFields.list("client");
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    const url = new URL(call.url);
    expect(url.pathname).toBe("/api/v1/custom-fields");
    expect(url.searchParams.get("entityType")).toBe("client");
  });

  it("list() sends GET to v1/custom-fields with entityType=company", async () => {
    const fixture = { ...CUSTOM_FIELD_FIXTURE, entityType: "company" as const };
    const body = { data: [fixture] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.customFields.list("company");
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    const url = new URL(call.url);
    expect(url.searchParams.get("entityType")).toBe("company");
  });
});
