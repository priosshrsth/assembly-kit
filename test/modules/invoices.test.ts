import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00.000Z";

const INVOICE_FIXTURE = {
  createdAt: NOW,
  id: "inv-1",
  object: "invoice" as const,
  updatedAt: NOW,
};

describe("InvoicesResource", () => {
  it("list() sends GET to v1/invoices", async () => {
    const body = { data: [INVOICE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.invoices.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/invoices`);
  });

  it("get() sends GET to v1/invoices/:id", async () => {
    const { client, calls } = createTestClient([
      { body: INVOICE_FIXTURE, status: 200 },
    ]);

    const result = await client.invoices.get("inv-1");
    expect(result.id).toBe("inv-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/invoices/inv-1`);
  });

  it("create() sends POST to v1/invoices", async () => {
    const { client, calls } = createTestClient([
      { body: INVOICE_FIXTURE, status: 200 },
    ]);

    await client.invoices.create({
      clientId: "client-1",
      lineItems: [
        {
          amount: 100,
          description: "Service fee",
          priceId: "price-1",
          productId: "prod-1",
          quantity: 1,
        },
      ],
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/invoices`);
    expect(call.body).toContain('"clientId"');
    expect(call.body).toContain('"lineItems"');
  });
});
