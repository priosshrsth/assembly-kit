import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00.000Z";

const MESSAGE_CHANNEL_FIXTURE = {
  createdAt: NOW,
  id: "chan-1",
  membershipType: "individual" as const,
  object: "messageChannel" as const,
  updatedAt: NOW,
};

describe("MessageChannelsResource", () => {
  it("list() sends GET to v1/message-channels", async () => {
    const body = { data: [MESSAGE_CHANNEL_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.messageChannels.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/message-channels`);
  });

  it("get() sends GET to v1/message-channels/:id", async () => {
    const { client, calls } = createTestClient([
      { body: MESSAGE_CHANNEL_FIXTURE, status: 200 },
    ]);

    const result = await client.messageChannels.get("chan-1");
    expect(result.id).toBe("chan-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/message-channels/chan-1`);
  });

  it("create() sends POST to v1/message-channels", async () => {
    const { client, calls } = createTestClient([
      { body: MESSAGE_CHANNEL_FIXTURE, status: 200 },
    ]);

    await client.messageChannels.create({
      clientId: "client-1",
      membershipType: "individual",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/message-channels`);
    expect(call.body).toContain('"membershipType"');
    expect(call.body).toContain('"clientId"');
  });
});
