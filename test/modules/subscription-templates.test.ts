import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const SUBSCRIPTION_TEMPLATE_FIXTURE = {
  createdAt: NOW,
  id: "st-1",
  object: "subscriptionTemplate" as const,
  updatedAt: NOW,
};

describe("SubscriptionTemplatesResource", () => {
  it("list() sends GET to v1/subscription-templates", async () => {
    const body = { data: [SUBSCRIPTION_TEMPLATE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.subscriptionTemplates.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/subscription-templates`);
  });
});
