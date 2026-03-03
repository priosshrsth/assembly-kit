import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const FORM_RESPONSE_FIXTURE = {
  createdAt: NOW,
  id: "fr-1",
  object: "formResponse" as const,
  updatedAt: NOW,
};

describe("FormResponsesResource", () => {
  it("list() sends GET to v1/form-responses", async () => {
    const body = { data: [FORM_RESPONSE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.formResponses.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/form-responses`);
  });

  it("request() sends POST to v1/form-responses with body", async () => {
    const { client, calls } = createTestClient([
      { body: FORM_RESPONSE_FIXTURE, status: 200 },
    ]);

    await client.formResponses.request({
      clientId: "client-1",
      formId: "form-1",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/form-responses`);
    expect(call.body).toContain('"formId"');
  });
});
