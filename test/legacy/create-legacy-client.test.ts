import { beforeAll, describe, expect, it, mock } from "bun:test";

import { createAssemblyClient } from "src/assembly-client/create-assembly-client";

/** Mimics the SDK's ApiError shape (extends Error with a status property). */
class MockApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const mockWorkspace = { id: "ws-1", name: "Test" };

/**
 * Creates a mock that fails `failCount` times with the given status,
 * then succeeds with `mockWorkspace`.
 */
const createFailThenSucceedMock = (
  failCount: number,
  status: number,
  message: string
): { fn: () => unknown; getCallCount: () => number } => {
  let callCount = 0;
  const fn = (): unknown => {
    callCount += 1;
    if (callCount <= failCount) {
      throw new MockApiError(message, status);
    }
    return mockWorkspace;
  };
  return { fn, getCallCount: () => callCount };
};

/**
 * Creates a mock that always fails with the given status.
 */
const createAlwaysFailMock = (
  status: number,
  message: string
): { fn: () => never; getCallCount: () => number } => {
  let callCount = 0;
  const fn = (): never => {
    callCount += 1;
    throw new MockApiError(message, status);
  };
  return { fn, getCallCount: () => callCount };
};

describe("createAssemblyClient", () => {
  beforeAll(() => {
    mock.module("@assembly-js/node-sdk", () => ({
      assemblyApi: () => ({
        listClients: mock(() => ({ data: [] })),
        retrieveWorkspace: mock(() => mockWorkspace),
      }),
    }));
  });

  it("constructs with apiKey only", () => {
    const client = createAssemblyClient({ apiKey: "test-key" });
    expect(client).toBeDefined();
    expect(typeof client.retrieveWorkspace).toBe("function");
  });

  it("constructs with apiKey and token", () => {
    const client = createAssemblyClient({
      apiKey: "test-key",
      token: "some-token",
    });
    expect(client).toBeDefined();
  });

  it("with retry: false returns unwrapped SDK methods", async () => {
    const client = createAssemblyClient({
      apiKey: "test-key",
      retry: false,
    });
    const result = await client.retrieveWorkspace();
    expect(result).toEqual(mockWorkspace as never);
  });
});

describe("createAssemblyClient retry behavior", () => {
  it("retries on 429 and succeeds on second attempt", async () => {
    const { fn, getCallCount } = createFailThenSucceedMock(
      1,
      429,
      "Rate limited"
    );

    mock.module("@assembly-js/node-sdk", () => ({
      assemblyApi: () => ({
        retrieveWorkspace: fn,
      }),
    }));

    const client = createAssemblyClient({
      apiKey: "test-key",
      retry: { factor: 1, maxTimeout: 50, minTimeout: 10, retries: 3 },
    });

    const result = await client.retrieveWorkspace();
    expect(result).toEqual(mockWorkspace as never);
    expect(getCallCount()).toBe(2);
  });

  it("does not retry on 401", async () => {
    const { fn, getCallCount } = createAlwaysFailMock(401, "Unauthorized");

    mock.module("@assembly-js/node-sdk", () => ({
      assemblyApi: () => ({
        retrieveWorkspace: fn,
      }),
    }));

    const client = createAssemblyClient({
      apiKey: "test-key",
      retry: { factor: 1, maxTimeout: 50, minTimeout: 10, retries: 3 },
    });

    try {
      await client.retrieveWorkspace();
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(MockApiError);
      expect((error as MockApiError).status).toBe(401);
    }
    expect(getCallCount()).toBe(1);
  });
});
