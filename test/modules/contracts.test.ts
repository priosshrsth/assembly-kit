import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const CONTRACT_FIXTURE = {
  createdAt: NOW,
  id: "contract-1",
  object: "contract" as const,
  updatedAt: NOW,
};

describe("ContractsResource", () => {
  it("list() sends GET to v1/contracts", async () => {
    const body = { data: [CONTRACT_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.contracts.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/contracts`);
  });

  it("get() sends GET to v1/contracts/:id", async () => {
    const { client, calls } = createTestClient([
      { body: CONTRACT_FIXTURE, status: 200 },
    ]);

    const result = await client.contracts.get("contract-1");
    expect(result.id).toBe("contract-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/contracts/contract-1`);
  });

  it("send() sends POST to v1/contracts with body", async () => {
    const { client, calls } = createTestClient([
      { body: CONTRACT_FIXTURE, status: 200 },
    ]);

    await client.contracts.send({
      clientId: "client-1",
      contractTemplateId: "ct-1",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/contracts`);
    expect(call.body).toContain('"contractTemplateId"');
  });
});
