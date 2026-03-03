import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const PAYMENT_FIXTURE = {
  createdAt: NOW,
  id: "pay-1",
  object: "payment" as const,
};

describe("PaymentsResource", () => {
  it("list() sends GET to v1/payments", async () => {
    const body = { data: [PAYMENT_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.payments.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/payments`);
  });
});
