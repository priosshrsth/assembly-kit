import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const CONTRACT_TEMPLATE_FIXTURE = {
  createdAt: NOW,
  id: "ct-1",
  object: "contractTemplate" as const,
  updatedAt: NOW,
};

describe("ContractTemplatesResource", () => {
  it("list() sends GET to v1/contract-templates", async () => {
    const body = { data: [CONTRACT_TEMPLATE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.contractTemplates.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/contract-templates`);
  });

  it("get() sends GET to v1/contract-templates/:id", async () => {
    const { client, calls } = createTestClient([
      { body: CONTRACT_TEMPLATE_FIXTURE, status: 200 },
    ]);

    const result = await client.contractTemplates.get("ct-1");
    expect(result.id).toBe("ct-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/contract-templates/ct-1`);
  });
});
