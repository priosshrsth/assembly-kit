import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const APP_CONNECTION_FIXTURE = {
  createdAt: NOW,
  id: "ac-1",
  object: "appConnection" as const,
  updatedAt: NOW,
};

describe("AppConnectionsResource", () => {
  it("list() sends GET to v1/app-connections", async () => {
    const body = { data: [APP_CONNECTION_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.appConnections.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/app-connections`);
  });

  it("create() sends POST to v1/app-connections with body", async () => {
    const { client, calls } = createTestClient([
      { body: APP_CONNECTION_FIXTURE, status: 200 },
    ]);

    await client.appConnections.create({
      content: "https://example.com",
      installId: "install-1",
      membershipType: "individual",
      type: "link",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/app-connections`);
    expect(call.body).toContain('"installId"');
  });
});
