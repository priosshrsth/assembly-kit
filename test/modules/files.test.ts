import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00Z";

const FILE_FIXTURE = {
  createdAt: NOW,
  id: "file-1",
  object: "file" as const,
  updatedAt: NOW,
};

describe("FilesResource", () => {
  it("list() sends GET to v1/files", async () => {
    const body = { data: [FILE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.files.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/files`);
  });

  it("get() sends GET to v1/files/:id", async () => {
    const { client, calls } = createTestClient([
      { body: FILE_FIXTURE, status: 200 },
    ]);

    const result = await client.files.get("file-1");
    expect(result.id).toBe("file-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/files/file-1`);
  });

  it("create() sends POST to v1/files/:fileType with body", async () => {
    const { client, calls } = createTestClient([
      { body: FILE_FIXTURE, status: 200 },
    ]);

    await client.files.create({
      body: { name: "My File" },
      fileType: "file",
    });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/files/file`);
    expect(call.body).toContain('"name"');
  });

  it("delete() sends DELETE to v1/files/:id", async () => {
    const { client, calls } = createTestClient([{ body: {}, status: 200 }]);

    await client.files.delete("file-1");

    const call = callAt(calls);
    expect(call.method).toBe("DELETE");
    expect(call.url).toBe(`${BASE_URL}/v1/files/file-1`);
  });

  it("updatePermissions() sends PUT to v1/files/:id/permissions with body", async () => {
    const { client, calls } = createTestClient([
      { body: FILE_FIXTURE, status: 200 },
    ]);

    await client.files.updatePermissions({
      body: { clientIds: ["client-1"] },
      id: "file-1",
    });

    const call = callAt(calls);
    expect(call.method).toBe("PUT");
    expect(call.url).toBe(`${BASE_URL}/v1/files/file-1/permissions`);
    expect(call.body).toContain('"clientIds"');
  });
});
