import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const TASK_TEMPLATE_FIXTURE = {
  createdAt: NOW,
  id: "tt-1",
  object: "taskTemplate" as const,
  updatedAt: NOW,
};

describe("TaskTemplatesResource", () => {
  it("list() sends GET to v1/task-templates", async () => {
    const body = { data: [TASK_TEMPLATE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.taskTemplates.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/task-templates`);
  });

  it("get() sends GET to v1/task-templates/:id", async () => {
    const { client, calls } = createTestClient([
      { body: TASK_TEMPLATE_FIXTURE, status: 200 },
    ]);

    const result = await client.taskTemplates.get("tt-1");
    expect(result.id).toBe("tt-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/task-templates/tt-1`);
  });
});
