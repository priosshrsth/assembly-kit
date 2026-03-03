import type { AssemblyKitClient } from "src/assembly-kit/assembly-kit-client";
import { createAssemblyKit } from "src/assembly-kit/create-assembly-kit";

type FetchFn = typeof globalThis.fetch;

export interface MockCall {
  url: string;
  method: string;
  headers: Headers;
  body: string | null;
}

interface MockResponse {
  status: number;
  body?: unknown;
}

export const createMockFetch = (
  responses: MockResponse[]
): { fetch: FetchFn; calls: MockCall[] } => {
  const calls: MockCall[] = [];
  let callIndex = 0;

  const mockFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const request = new Request(input, init);
    calls.push({
      body: request.body ? await request.text() : null,
      headers: request.headers,
      method: request.method,
      url: request.url,
    });

    const preset = responses[callIndex] ?? (responses.at(-1) as MockResponse);
    callIndex += 1;

    return new Response(
      preset.body === undefined ? null : JSON.stringify(preset.body),
      {
        headers: new Headers({ "Content-Type": "application/json" }),
        status: preset.status,
      }
    );
  };

  return { calls, fetch: mockFetch as FetchFn };
};

export const createTestClient = (
  responses: MockResponse[]
): { client: AssemblyKitClient; calls: MockCall[] } => {
  const { fetch, calls } = createMockFetch(responses);
  const client = createAssemblyKit({
    apiKey: "test-key",
    fetch,
    requestsPerSecond: 1000,
    retryCount: 0,
    workspaceId: "ws-123",
  });
  return { calls, client };
};

export const callAt = (calls: MockCall[], index = 0): MockCall => {
  const c = calls[index];
  if (c === undefined) {
    throw new Error(`No call at index ${index}`);
  }
  return c;
};

export const BASE_URL = "https://app.assembly.com/api";
