import { describe, expect, it, vi } from "vite-plus/test";

process.env.ASSEMBLY_ENV = "local";

const { mockRetrieveWorkspace } = vi.hoisted(() => ({
  mockRetrieveWorkspace: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
}));

vi.mock("@assembly-js/node-sdk", () => ({
  assemblyApi: () => ({
    retrieveWorkspace: (...args: unknown[]) => mockRetrieveWorkspace(...args),
  }),
}));

vi.mock("src/token/assembly-token", () => ({
  AssemblyToken: class {
    payload = { workspaceId: "ws-1" };
    constructor(public opts: { token: unknown; apiKey: string }) {}
    ensureIsClient(): unknown {
      return this.payload;
    }
    ensureIsInternalUser(): unknown {
      return this.payload;
    }
  },
}));

import { AssemblyKit, createAssemblyKit } from "src/client";

// --- createAssemblyKit -------------------------------------------------------

describe("createAssemblyKit", () => {
  it("returns an AssemblyKit instance", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", workspaceId: "ws-1" });
    expect(kit).toBeInstanceOf(AssemblyKit);
  });

  it("returns a new instance on each call", () => {
    const opts = { apiKey: "test-key", workspaceId: "ws-1" } as const;
    const first = createAssemblyKit(opts);
    const second = createAssemblyKit(opts);
    expect(second).not.toBe(first);
  });

  it("accepts token instead of workspaceId", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", token: "some-token" });
    expect(kit).toBeInstanceOf(AssemblyKit);
    expect(kit.currentToken).toBe("some-token");
  });

  it("accepts both token and workspaceId (token takes precedence)", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", token: "some-token", workspaceId: "ws-1" });
    expect(kit).toBeInstanceOf(AssemblyKit);
    expect(kit.currentToken).toBe("some-token");
  });

  it("throws when neither token nor workspaceId is provided", () => {
    expect(() => createAssemblyKit({ apiKey: "test-key" })).toThrow(
      "Either `token` or `workspaceId` must be provided.",
    );
  });

  it("sets ASSEMBLY_ENV=local when using workspaceId without token", () => {
    createAssemblyKit({ apiKey: "test-key", workspaceId: "ws-1" });
    expect(process.env.ASSEMBLY_ENV).toBe("local");
  });
});

// --- Retry -------------------------------------------------------------------

class MockApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
    this.name = "MockApiError";
  }
}

describe("retry behavior", () => {
  it("retries on 429 and eventually succeeds", async () => {
    let callCount = 0;
    mockRetrieveWorkspace.mockImplementation(() => {
      callCount += 1;
      if (callCount <= 2) {
        return Promise.reject(new MockApiError(429));
      }
      return Promise.resolve({ id: "ws-1", object: "workspace" });
    });

    const kit = new AssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      retry: { maxTimeout: 50, minTimeout: 10, retries: 3 },
      validateResponses: false,
    });

    const result = await kit.workspace.retrieve();
    expect(result).toEqual({ id: "ws-1", object: "workspace" });
    expect(callCount).toBe(3);
  });

  it("retries on 500 and eventually succeeds", async () => {
    let callCount = 0;
    mockRetrieveWorkspace.mockImplementation(() => {
      callCount += 1;
      if (callCount <= 1) {
        return Promise.reject(new MockApiError(500));
      }
      return Promise.resolve({ id: "ws-2", object: "workspace" });
    });

    const kit = new AssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      retry: { maxTimeout: 50, minTimeout: 10, retries: 3 },
      validateResponses: false,
    });

    const result = await kit.workspace.retrieve();
    expect(result).toEqual({ id: "ws-2", object: "workspace" });
    expect(callCount).toBe(2);
  });

  it("does not retry on 400 (non-retryable)", async () => {
    mockRetrieveWorkspace.mockImplementation(() => Promise.reject(new MockApiError(400)));

    const kit = new AssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      retry: { maxTimeout: 50, minTimeout: 10, retries: 3 },
      validateResponses: false,
    });

    await expect(kit.workspace.retrieve()).rejects.toThrow("HTTP 400");
  });

  it("throws after exhausting retries", async () => {
    mockRetrieveWorkspace.mockImplementation(() => Promise.reject(new MockApiError(503)));

    const kit = new AssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      retry: { maxTimeout: 50, minTimeout: 10, retries: 2 },
      validateResponses: false,
    });

    await expect(kit.workspace.retrieve()).rejects.toThrow("HTTP 503");
  });

  it("skips retry when retry: false", async () => {
    let callCount = 0;
    mockRetrieveWorkspace.mockImplementation(() => {
      callCount += 1;
      return Promise.reject(new MockApiError(429));
    });

    const kit = new AssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      retry: false,
      validateResponses: false,
    });

    await expect(kit.workspace.retrieve()).rejects.toThrow("HTTP 429");
    expect(callCount).toBe(1);
  });
});
