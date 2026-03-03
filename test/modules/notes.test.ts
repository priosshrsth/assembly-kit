import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const NOW = "2025-01-01T00:00:00.000Z";

const NOTE_FIXTURE = {
  createdAt: NOW,
  id: "note-1",
  object: "note" as const,
  updatedAt: NOW,
};

describe("NotesResource", () => {
  it("list() sends GET to v1/notes", async () => {
    const body = { data: [NOTE_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.notes.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/notes`);
  });

  it("get() sends GET to v1/notes/:id", async () => {
    const { client, calls } = createTestClient([
      { body: NOTE_FIXTURE, status: 200 },
    ]);

    const result = await client.notes.get("note-1");
    expect(result.id).toBe("note-1");

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/notes/note-1`);
  });

  it("create() sends POST to v1/notes", async () => {
    const { client, calls } = createTestClient([
      { body: NOTE_FIXTURE, status: 200 },
    ]);

    await client.notes.create({ clientId: "client-1", content: "Hello" });

    const call = callAt(calls);
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE_URL}/v1/notes`);
    expect(call.body).toContain('"content"');
    expect(call.body).toContain('"clientId"');
  });

  it("update() sends PATCH to v1/notes/:id", async () => {
    const { client, calls } = createTestClient([
      { body: NOTE_FIXTURE, status: 200 },
    ]);

    await client.notes.update({ body: { content: "Updated" }, id: "note-1" });

    const call = callAt(calls);
    expect(call.method).toBe("PATCH");
    expect(call.url).toBe(`${BASE_URL}/v1/notes/note-1`);
    expect(call.body).toContain('"content"');
  });

  it("delete() sends DELETE to v1/notes/:id", async () => {
    const { client, calls } = createTestClient([{ body: {}, status: 200 }]);

    await client.notes.delete("note-1");

    const call = callAt(calls);
    expect(call.method).toBe("DELETE");
    expect(call.url).toBe(`${BASE_URL}/v1/notes/note-1`);
  });
});
