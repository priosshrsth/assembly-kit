import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const CLIENT_FIXTURE = {
  avatarImageUrl: null,
  companyIds: ["comp-1"],
  createdAt: NOW,
  creationMethod: "internalUser" as const,
  email: "test@example.com",
  fallbackColor: "#ff0000",
  familyName: "Doe",
  firstLoginDate: null,
  givenName: "Jane",
  id: "client-1",
  lastLoginDate: null,
  object: "client" as const,
  status: "active" as const,
  updatedAt: NOW,
};

describe("ClientsResource", () => {
  it("list() sends GET to v1/clients", async () => {
    const body = { data: [CLIENT_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.clients.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/clients`);
  });

  it("list() passes filter params as search params", async () => {
    const body = { data: [] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    await client.clients.list({ companyId: "comp-1", limit: 10 });
    const call = callAt(calls);
    const url = new URL(call.url);
    expect(url.searchParams.get("companyId")).toBe("comp-1");
    expect(url.searchParams.get("limit")).toBe("10");
  });

  it("get() sends GET to v1/clients/:id", async () => {
    const { client, calls } = createTestClient([
      { body: CLIENT_FIXTURE, status: 200 },
    ]);

    const result = await client.clients.get("client-1");
    expect(result.id).toBe("client-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/clients/client-1`);
  });

  it("create() sends POST to v1/clients with sendInvite param", async () => {
    const { client, calls } = createTestClient([
      { body: CLIENT_FIXTURE, status: 200 },
    ]);

    await client.clients.create({
      body: {
        email: "test@example.com",
        familyName: "Doe",
        givenName: "Jane",
      },
      sendInvite: true,
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    const url = new URL(call.url);
    expect(url.pathname).toBe("/api/v1/clients");
    expect(url.searchParams.get("sendInvite")).toBe("true");
    expect(call.body).toContain('"email"');
  });

  it("update() sends PATCH to v1/clients/:id", async () => {
    const { client, calls } = createTestClient([
      { body: CLIENT_FIXTURE, status: 200 },
    ]);

    await client.clients.update({
      body: { givenName: "Updated" },
      id: "client-1",
    });

    const call = callAt(calls);
    expect(call.method).toBe("PATCH");
    expect(call.url).toBe(`${BASE_URL}/v1/clients/client-1`);
    expect(call.body).toContain('"givenName"');
  });

  it("delete() sends DELETE to v1/clients/:id", async () => {
    const { client, calls } = createTestClient([{ body: {}, status: 200 }]);

    await client.clients.delete("client-1");

    const call = callAt(calls);
    expect(call.method).toBe("DELETE");
    expect(call.url).toBe(`${BASE_URL}/v1/clients/client-1`);
  });
});
