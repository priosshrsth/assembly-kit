import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const WORKSPACE = {
  id: "ws-123",
  object: "workspace" as const,
};

describe("WorkspaceResource", () => {
  it("get() sends GET to v1/workspaces and returns parsed response", async () => {
    const { client, calls } = createTestClient([
      { body: WORKSPACE, status: 200 },
    ]);

    const result = await client.workspace.get();
    expect(result).toEqual(WORKSPACE);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/workspaces`);
  });

  it("get() includes optional fields when present", async () => {
    const full = {
      ...WORKSPACE,
      brandName: "Acme",
      portalUrl: "https://portal.example.com",
    };
    const { client } = createTestClient([{ body: full, status: 200 }]);

    const result = await client.workspace.get();
    expect(result.brandName).toBe("Acme");
    expect(result.portalUrl).toBe("https://portal.example.com");
  });
});
