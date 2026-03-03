import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00.000Z";

const MESSAGE_FIXTURE = {
  createdAt: NOW,
  id: "msg-1",
  object: "message" as const,
  updatedAt: NOW,
};

describe("MessagesResource", () => {
  it("list() sends GET to v1/messages", async () => {
    const body = { data: [MESSAGE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.messages.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/messages`);
  });

  it("send() sends POST to v1/messages", async () => {
    const { client, calls } = createTestClient([
      { body: MESSAGE_FIXTURE, status: 200 },
    ]);

    await client.messages.send({
      channelId: "chan-1",
      senderId: "user-1",
      text: "Hello",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/messages`);
    expect(call.body).toContain('"channelId"');
    expect(call.body).toContain('"senderId"');
    expect(call.body).toContain('"text"');
  });
});
