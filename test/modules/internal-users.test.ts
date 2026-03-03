import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const INTERNAL_USER_FIXTURE = {
  companyAccessList: null,
  email: "admin@example.com",
  familyName: "Smith",
  givenName: "John",
  id: "iu-1",
  isClientAccessLimited: false,
  object: "internalUser" as const,
};

describe("InternalUsersResource", () => {
  it("list() sends GET to v1/internal-users", async () => {
    const body = { data: [INTERNAL_USER_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.internalUsers.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/internal-users`);
  });

  it("list() passes pagination params", async () => {
    const body = { data: [] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    await client.internalUsers.list({ limit: 5, nextToken: "tok" });
    const call = callAt(calls);
    const url = new URL(call.url);
    expect(url.searchParams.get("limit")).toBe("5");
    expect(url.searchParams.get("nextToken")).toBe("tok");
  });

  it("get() sends GET to v1/internal-users/:id", async () => {
    const { client, calls } = createTestClient([
      { body: INTERNAL_USER_FIXTURE, status: 200 },
    ]);

    const result = await client.internalUsers.get("iu-1");
    expect(result.id).toBe("iu-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/internal-users/iu-1`);
  });
});
