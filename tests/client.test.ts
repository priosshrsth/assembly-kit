import { describe, expect, it, vi } from "vite-plus/test";

const { mockRetrieveWorkspace } = vi.hoisted(() => ({
  mockRetrieveWorkspace: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
}));

vi.mock("@assembly-js/node-sdk", () => ({
  assemblyApi: () => ({
    retrieveWorkspace: (...args: unknown[]) => mockRetrieveWorkspace(...args),
  }),
}));

import { AssemblyKit } from "src/client/client";

/** Run `fn` in a fresh async context (isolated from the test runner's context). */
const inFreshContext = (fn: () => void): Promise<void> =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, 0);
  });

// --- Singleton (.new) --------------------------------------------------------

describe("AssemblyKit.new", () => {
  const opts = { apiKey: "test-key" };

  it("returns the same instance on repeated .new() calls", async () => {
    await inFreshContext(() => {
      const first = AssemblyKit.new(opts);
      const second = AssemblyKit.new(opts);
      expect(second).toBe(first);
    });
  });

  it("creates a new instance when token changes", async () => {
    await inFreshContext(() => {
      const first = AssemblyKit.new({ apiKey: "test-key", token: "token-a" });
      const second = AssemblyKit.new({ apiKey: "test-key", token: "token-b" });
      expect(second).not.toBe(first);
    });
  });

  it("different async contexts get different instances", async () => {
    const instances: AssemblyKit[] = [];
    await Promise.all([
      inFreshContext(() => {
        instances.push(AssemblyKit.new(opts));
      }),
      inFreshContext(() => {
        instances.push(AssemblyKit.new(opts));
      }),
    ]);
    expect(instances[0]).not.toBe(instances[1]);
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
      retry: { maxTimeout: 50, minTimeout: 10, retries: 3 },
      validateResponses: false,
    });

    await expect(kit.workspace.retrieve()).rejects.toThrow("HTTP 400");
  });

  it("throws after exhausting retries", async () => {
    mockRetrieveWorkspace.mockImplementation(() => Promise.reject(new MockApiError(503)));

    const kit = new AssemblyKit({
      apiKey: "test-key",
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
      retry: false,
      validateResponses: false,
    });

    await expect(kit.workspace.retrieve()).rejects.toThrow("HTTP 429");
    expect(callCount).toBe(1);
  });
});
