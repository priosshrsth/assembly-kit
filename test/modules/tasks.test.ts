import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const TASK_FIXTURE = {
  createdAt: NOW,
  id: "task-1",
  object: "task" as const,
  status: "todo" as const,
  title: "Test task",
  updatedAt: NOW,
};

describe("TasksResource", () => {
  it("list() sends GET to v1/tasks", async () => {
    const body = { data: [TASK_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.tasks.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/tasks`);
  });

  it("list() passes status filter as search param", async () => {
    const body = { data: [] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    await client.tasks.list({ status: "done" });
    const call = callAt(calls);
    const url = new URL(call.url);
    expect(url.searchParams.get("status")).toBe("done");
  });

  it("get() sends GET to v1/tasks/:id", async () => {
    const { client, calls } = createTestClient([
      { body: TASK_FIXTURE, status: 200 },
    ]);

    const result = await client.tasks.get("task-1");
    expect(result.id).toBe("task-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/tasks/task-1`);
  });

  it("create() sends POST to v1/tasks", async () => {
    const { client, calls } = createTestClient([
      { body: TASK_FIXTURE, status: 200 },
    ]);

    await client.tasks.create({ title: "New task" });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/tasks`);
    expect(call.body).toContain('"title"');
  });

  it("update() sends PATCH to v1/tasks/:id", async () => {
    const { client, calls } = createTestClient([
      { body: TASK_FIXTURE, status: 200 },
    ]);

    await client.tasks.update({ body: { status: "done" }, id: "task-1" });

    const call = callAt(calls);
    expect(call.method).toBe("PATCH");
    expect(call.url).toBe(`${BASE_URL}/v1/tasks/task-1`);
  });

  it("delete() sends DELETE to v1/tasks/:id", async () => {
    const { client, calls } = createTestClient([{ body: {}, status: 200 }]);

    await client.tasks.delete("task-1");

    const call = callAt(calls);
    expect(call.method).toBe("DELETE");
    expect(call.url).toBe(`${BASE_URL}/v1/tasks/task-1`);
  });
});
