import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const SUBSCRIPTION_FIXTURE = {
  createdAt: NOW,
  id: "sub-1",
  object: "subscription" as const,
  updatedAt: NOW,
};

describe("SubscriptionsResource", () => {
  it("list() sends GET to v1/subscriptions", async () => {
    const body = { data: [SUBSCRIPTION_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.subscriptions.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/subscriptions`);
  });

  it("get() sends GET to v1/subscriptions/:id", async () => {
    const { client, calls } = createTestClient([
      { body: SUBSCRIPTION_FIXTURE, status: 200 },
    ]);

    const result = await client.subscriptions.get("sub-1");
    expect(result.id).toBe("sub-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/subscriptions/sub-1`);
  });

  it("create() sends POST to v1/subscriptions with body", async () => {
    const { client, calls } = createTestClient([
      { body: SUBSCRIPTION_FIXTURE, status: 200 },
    ]);

    await client.subscriptions.create({ clientId: "client-1" });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/subscriptions`);
    expect(call.body).toContain('"clientId"');
  });

  it("cancel() sends POST to v1/subscriptions/:id/cancel", async () => {
    const { client, calls } = createTestClient([
      { body: SUBSCRIPTION_FIXTURE, status: 200 },
    ]);

    await client.subscriptions.cancel("sub-1");

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/subscriptions/sub-1/cancel`);
  });
});
