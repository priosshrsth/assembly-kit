import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const FILE_CHANNEL_FIXTURE = {
  createdAt: NOW,
  id: "fc-1",
  membershipType: "individual" as const,
  object: "fileChannel" as const,
  updatedAt: NOW,
};

describe("FileChannelsResource", () => {
  it("list() sends GET to v1/file-channels", async () => {
    const body = { data: [FILE_CHANNEL_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.fileChannels.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/file-channels`);
  });

  it("get() sends GET to v1/file-channels/:id", async () => {
    const { client, calls } = createTestClient([
      { body: FILE_CHANNEL_FIXTURE, status: 200 },
    ]);

    const result = await client.fileChannels.get("fc-1");
    expect(result.id).toBe("fc-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/file-channels/fc-1`);
  });

  it("create() sends POST to v1/file-channels with body", async () => {
    const { client, calls } = createTestClient([
      { body: FILE_CHANNEL_FIXTURE, status: 200 },
    ]);

    await client.fileChannels.create({
      clientId: "client-1",
      membershipType: "individual",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/file-channels`);
    expect(call.body).toContain('"membershipType"');
  });
});
