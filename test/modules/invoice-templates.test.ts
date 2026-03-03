import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00.000Z";

const INVOICE_TEMPLATE_FIXTURE = {
  createdAt: NOW,
  id: "tmpl-1",
  object: "invoiceTemplate" as const,
  updatedAt: NOW,
};

describe("InvoiceTemplatesResource", () => {
  it("list() sends GET to v1/invoice-templates", async () => {
    const body = { data: [INVOICE_TEMPLATE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.invoiceTemplates.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/invoice-templates`);
  });
});
