import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00.000Z";

const PRODUCT_FIXTURE = {
  createdAt: NOW,
  id: "prod-1",
  object: "product" as const,
  updatedAt: NOW,
};

describe("ProductsResource", () => {
  it("list() sends GET to v1/products", async () => {
    const body = { data: [PRODUCT_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.products.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/products`);
  });

  it("get() sends GET to v1/products/:id", async () => {
    const { client, calls } = createTestClient([
      { body: PRODUCT_FIXTURE, status: 200 },
    ]);

    const result = await client.products.get("prod-1");
    expect(result.id).toBe("prod-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/products/prod-1`);
  });
});
