import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const NOTIFICATION_FIXTURE = {
  createdAt: NOW,
  id: "notif-1",
  object: "notification" as const,
};

describe("NotificationsResource", () => {
  it("list() sends GET to v1/notifications", async () => {
    const body = { data: [NOTIFICATION_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.notifications.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/notifications`);
  });

  it("list() passes includeRead filter as search param", async () => {
    const body = { data: [] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    await client.notifications.list({ includeRead: true });
    const call = callAt(calls);
    const url = new URL(call.url);
    expect(url.searchParams.get("includeRead")).toBe("true");
  });

  it("create() sends POST to v1/notifications", async () => {
    const { client, calls } = createTestClient([
      { body: NOTIFICATION_FIXTURE, status: 200 },
    ]);

    await client.notifications.create({
      deliveryTargets: {
        inProduct: { body: "Hello", title: "Test" },
      },
      recipientId: "user-1",
      senderId: "sender-1",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/notifications`);
    expect(call.body).toContain('"recipientId"');
  });

  it("delete() sends DELETE to v1/notifications/:id", async () => {
    const { client, calls } = createTestClient([{ body: {}, status: 200 }]);

    await client.notifications.delete("notif-1");

    const call = callAt(calls);
    expect(call.method).toBe("DELETE");
    expect(call.url).toBe(`${BASE_URL}/v1/notifications/notif-1`);
  });
});
