import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const APP_INSTALL_FIXTURE = {
  id: "ai-1",
  object: "appInstall" as const,
};

describe("AppInstallsResource", () => {
  it("list() sends GET to v1/app-installs", async () => {
    const body = { data: [APP_INSTALL_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.appInstalls.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/app-installs`);
  });
});
