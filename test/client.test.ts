import { describe, expect, it } from "bun:test";

import { createClient } from "src/client/create-client";
import type { ClientOptions } from "src/client/options";
import { AssemblyMissingApiKeyError } from "src/errors/missing-api-key";
import { AssemblyNoTokenError } from "src/errors/no-token";
import { AssemblyResponseParseError } from "src/errors/response-parse";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type FetchFn = typeof globalThis.fetch;

interface MockResponse {
  status: number;
  body?: unknown;
}

interface MockCall {
  url: string;
  method: string;
  headers: Headers;
}

const createMockFetch = (
  responses: MockResponse[]
): { fetch: FetchFn; calls: MockCall[] } => {
  const calls: MockCall[] = [];
  let callIndex = 0;

  const mockFetch = (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const request = new Request(input, init);
    calls.push({
      headers: request.headers,
      method: request.method,
      url: request.url,
    });

    const preset = responses[callIndex] ?? (responses.at(-1) as MockResponse);
    callIndex += 1;

    return Promise.resolve(
      new Response(
        preset.body === undefined ? null : JSON.stringify(preset.body),
        {
          headers: new Headers({ "Content-Type": "application/json" }),
          status: preset.status,
        }
      )
    );
  };

  return { calls, fetch: mockFetch as FetchFn };
};

const WORKSPACE_FIXTURE = {
  id: "ws-123",
  object: "workspace" as const,
};

const baseOpts = (fetchFn: FetchFn): ClientOptions => ({
  apiKey: "test-key",
  fetch: fetchFn,
  requestsPerSecond: 1000,
  retryCount: 0,
  workspaceId: "ws-123",
});

const callAt = (calls: MockCall[], index = 0): MockCall => {
  const c = calls[index];
  if (c === undefined) {
    throw new Error(`No call at index ${index}`);
  }
  return c;
};

// ---------------------------------------------------------------------------
// Validation tests
// ---------------------------------------------------------------------------

describe("createClient — validation", () => {
  it("throws AssemblyMissingApiKeyError when workspaceId is empty", () => {
    try {
      createClient({ apiKey: "key", workspaceId: "" });
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AssemblyMissingApiKeyError);
    }
  });

  it("throws AssemblyMissingApiKeyError when apiKey is empty", () => {
    try {
      createClient({ apiKey: "", workspaceId: "ws-123" });
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AssemblyMissingApiKeyError);
    }
  });

  it("throws AssemblyNoTokenError when isMarketplaceApp=true and no token", () => {
    try {
      createClient({
        apiKey: "key",
        isMarketplaceApp: true,
        workspaceId: "ws-123",
      });
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AssemblyNoTokenError);
    }
  });

  it("constructs successfully for marketplace app with token", () => {
    const { fetch } = createMockFetch([
      { body: WORKSPACE_FIXTURE, status: 200 },
    ]);
    const client = createClient({
      ...baseOpts(fetch),
      isMarketplaceApp: true,
      token: "some-token",
    });
    expect(client).toBeDefined();
    expect(client.workspace).toBeDefined();
  });

  it("constructs successfully for non-marketplace app without token", () => {
    const { fetch } = createMockFetch([
      { body: WORKSPACE_FIXTURE, status: 200 },
    ]);
    const client = createClient(baseOpts(fetch));
    expect(client).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Compound key tests
// ---------------------------------------------------------------------------

describe("createClient — compound key", () => {
  it("sends X-API-Key as workspaceId/apiKey when no tokenId", async () => {
    const { fetch, calls } = createMockFetch([
      { body: WORKSPACE_FIXTURE, status: 200 },
    ]);
    const client = createClient(baseOpts(fetch));

    await client.workspace.get();
    const call = callAt(calls);
    expect(call.headers.get("X-API-Key")).toBe("ws-123/test-key");
  });

  it("sends X-API-Key as workspaceId/apiKey/tokenId when tokenId provided", async () => {
    const { fetch, calls } = createMockFetch([
      { body: WORKSPACE_FIXTURE, status: 200 },
    ]);
    const client = createClient({ ...baseOpts(fetch), tokenId: "tok-1" });

    await client.workspace.get();
    const call = callAt(calls);
    expect(call.headers.get("X-API-Key")).toBe("ws-123/test-key/tok-1");
  });
});

// ---------------------------------------------------------------------------
// Independence tests
// ---------------------------------------------------------------------------

describe("createClient — independence", () => {
  it("two createClient() calls produce independent instances", async () => {
    const { fetch: f1, calls: c1 } = createMockFetch([
      { body: WORKSPACE_FIXTURE, status: 200 },
    ]);
    const { fetch: f2, calls: c2 } = createMockFetch([
      { body: WORKSPACE_FIXTURE, status: 200 },
    ]);

    const client1 = createClient({ ...baseOpts(f1), workspaceId: "ws-a" });
    const client2 = createClient({ ...baseOpts(f2), workspaceId: "ws-b" });

    await client1.workspace.get();
    await client2.workspace.get();

    expect(c1).toHaveLength(1);
    expect(c2).toHaveLength(1);
    expect(callAt(c1).headers.get("X-API-Key")).toBe("ws-a/test-key");
    expect(callAt(c2).headers.get("X-API-Key")).toBe("ws-b/test-key");
  });
});

// ---------------------------------------------------------------------------
// Response validation tests
// ---------------------------------------------------------------------------

describe("createClient — validateResponses", () => {
  it("returns raw data when validateResponses is false", async () => {
    const badShape = { extra: true, unexpected: "data" };
    const { fetch } = createMockFetch([{ body: badShape, status: 200 }]);
    const client = createClient({
      ...baseOpts(fetch),
      validateResponses: false,
    });

    const result = await client.workspace.get();
    expect(result as unknown).toEqual(badShape);
  });

  it("throws AssemblyResponseParseError when validateResponses is true and response is invalid", async () => {
    const badShape = { notAWorkspace: true };
    const { fetch } = createMockFetch([{ body: badShape, status: 200 }]);
    const client = createClient({
      ...baseOpts(fetch),
      validateResponses: true,
    });

    try {
      await client.workspace.get();
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AssemblyResponseParseError);
    }
  });

  it("validates by default (validateResponses defaults to true)", async () => {
    const badShape = { notAWorkspace: true };
    const { fetch } = createMockFetch([{ body: badShape, status: 200 }]);
    const client = createClient(baseOpts(fetch));

    try {
      await client.workspace.get();
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AssemblyResponseParseError);
    }
  });
});

// ---------------------------------------------------------------------------
// Resource namespaces
// ---------------------------------------------------------------------------

describe("createClient — resource namespaces", () => {
  it("exposes all expected resource namespaces", () => {
    const { fetch } = createMockFetch([]);
    const client = createClient(baseOpts(fetch));

    expect(client.workspace).toBeDefined();
    expect(client.clients).toBeDefined();
    expect(client.companies).toBeDefined();
    expect(client.internalUsers).toBeDefined();
    expect(client.notifications).toBeDefined();
    expect(client.customFields).toBeDefined();
    expect(client.tasks).toBeDefined();
  });
});
