import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const COMPANY_FIXTURE = {
  createdAt: NOW,
  id: "comp-1",
  isPlaceholder: false,
  name: "Acme Corp",
  object: "company" as const,
  updatedAt: NOW,
};

describe("CompaniesResource", () => {
  it("list() sends GET to v1/companies", async () => {
    const body = { data: [COMPANY_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.companies.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/companies`);
  });

  it("list() passes isPlaceholder filter as search param", async () => {
    const body = { data: [] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    await client.companies.list({ isPlaceholder: true });
    const call = callAt(calls);
    const url = new URL(call.url);
    expect(url.searchParams.get("isPlaceholder")).toBe("true");
  });

  it("get() sends GET to v1/companies/:id", async () => {
    const { client, calls } = createTestClient([
      { body: COMPANY_FIXTURE, status: 200 },
    ]);

    const result = await client.companies.get("comp-1");
    expect(result.id).toBe("comp-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/companies/comp-1`);
  });

  it("create() sends POST to v1/companies", async () => {
    const { client, calls } = createTestClient([
      { body: COMPANY_FIXTURE, status: 200 },
    ]);

    await client.companies.create({ name: "Acme Corp" });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/companies`);
    expect(call.body).toContain('"name"');
  });

  it("update() sends PATCH to v1/companies/:id", async () => {
    const { client, calls } = createTestClient([
      { body: COMPANY_FIXTURE, status: 200 },
    ]);

    await client.companies.update({ body: { name: "Updated" }, id: "comp-1" });

    const call = callAt(calls);
    expect(call.method).toBe("PATCH");
    expect(call.url).toBe(`${BASE_URL}/v1/companies/comp-1`);
  });

  it("delete() sends DELETE to v1/companies/:id", async () => {
    const { client, calls } = createTestClient([{ body: {}, status: 200 }]);

    await client.companies.delete("comp-1");

    const call = callAt(calls);
    expect(call.method).toBe("DELETE");
    expect(call.url).toBe(`${BASE_URL}/v1/companies/comp-1`);
  });
});
