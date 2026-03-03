import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const PRICE_FIXTURE = {
  id: "price-1",
  object: "price" as const,
};

describe("PricesResource", () => {
  it("list() sends GET to v1/prices", async () => {
    const body = { data: [PRICE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.prices.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/prices`);
  });

  it("get() sends GET to v1/prices/:id", async () => {
    const { client, calls } = createTestClient([
      { body: PRICE_FIXTURE, status: 200 },
    ]);

    const result = await client.prices.get("price-1");
    expect(result.id).toBe("price-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/prices/price-1`);
  });
});
