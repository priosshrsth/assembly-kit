import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const FORM_FIXTURE = {
  createdAt: NOW,
  id: "form-1",
  object: "form" as const,
  updatedAt: NOW,
};

describe("FormsResource", () => {
  it("list() sends GET to v1/forms", async () => {
    const body = { data: [FORM_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.forms.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/forms`);
  });

  it("get() sends GET to v1/forms/:id", async () => {
    const { client, calls } = createTestClient([
      { body: FORM_FIXTURE, status: 200 },
    ]);

    const result = await client.forms.get("form-1");
    expect(result.id).toBe("form-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/forms/form-1`);
  });
});
