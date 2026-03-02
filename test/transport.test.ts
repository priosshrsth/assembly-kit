import { describe, expect, it } from "bun:test";

import {
  AssemblyConnectionError,
  AssemblyForbiddenError,
  AssemblyNotFoundError,
  AssemblyRateLimitError,
  AssemblyServerError,
  AssemblyUnauthorizedError,
  AssemblyValidationError,
} from "src/errors";
import { AssemblyError } from "src/errors/base";
import { createTransport, parseRetryAfter } from "src/transport/http";
import type { Transport } from "src/transport/http";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.assembly.test";
const COMPOUND_KEY = "ws-123/api-key-456";
const SDK_VERSION = "0.1.0-test";

interface MockCall {
  url: string;
  method: string;
  headers: Headers;
  body: string | null;
}

interface MockResponse {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
};

const FAILING_FETCH: typeof globalThis.fetch = () => {
  throw new TypeError("fetch failed");
};

const createMockFetch = (
  responses: MockResponse[]
): { fetch: typeof globalThis.fetch; calls: MockCall[] } => {
  const calls: MockCall[] = [];
  let callIndex = 0;

  const mockFetch: typeof globalThis.fetch = async (
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
        headers: new Headers({
          "Content-Type": "application/json",
          ...preset.headers,
        }),
        status: preset.status,
        statusText: STATUS_TEXT[preset.status] ?? "",
      }
    );
  };

  return { calls, fetch: mockFetch };
};

const createTestTransport = (overrides: {
  fetch: typeof globalThis.fetch;
  retryCount?: number;
  requestsPerSecond?: number;
}): Transport =>
  createTransport({
    baseUrl: BASE_URL,
    compoundKey: COMPOUND_KEY,
    retryCount: 0,
    sdkVersion: SDK_VERSION,
    ...overrides,
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createTransport", () => {
  // ------- Success cases -------

  describe("successful responses", () => {
    it("GET 200 → resolves with parsed JSON", async () => {
      const { fetch, calls } = createMockFetch([
        { body: { data: [{ id: "1" }] }, status: 200 },
      ]);
      const transport = createTestTransport({ fetch });

      const result = await transport.get<{ data: { id: string }[] }>(
        "/clients"
      );

      expect(result).toEqual({ data: [{ id: "1" }] });
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe(`${BASE_URL}/clients`);
    });

    it("POST 200 → sends JSON body and resolves", async () => {
      const { fetch, calls } = createMockFetch([
        { body: { data: { id: "new-1" } }, status: 200 },
      ]);
      const transport = createTestTransport({ fetch });

      const result = await transport.post<{ data: { id: string } }>(
        "/clients",
        { name: "Acme" }
      );

      expect(result).toEqual({ data: { id: "new-1" } });
      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("POST");
      const body = String(calls[0].body);
      expect(JSON.parse(body)).toEqual({ name: "Acme" });
    });

    it("PATCH 200 → sends JSON body and resolves", async () => {
      const { fetch, calls } = createMockFetch([
        { body: { data: { id: "1", name: "Updated" } }, status: 200 },
      ]);
      const transport = createTestTransport({ fetch });

      const result = await transport.patch<{
        data: { id: string; name: string };
      }>("/clients/1", { name: "Updated" });

      expect(result).toEqual({ data: { id: "1", name: "Updated" } });
      expect(calls[0].method).toBe("PATCH");
    });

    it("DELETE 200 → resolves with parsed JSON", async () => {
      const { fetch, calls } = createMockFetch([
        { body: { success: true }, status: 200 },
      ]);
      const transport = createTestTransport({ fetch });

      const result = await transport.delete<{ success: boolean }>("/clients/1");

      expect(result).toEqual({ success: true });
      expect(calls[0].method).toBe("DELETE");
    });

    it("strips leading slash from paths (ky prefixUrl requirement)", async () => {
      const { fetch, calls } = createMockFetch([{ body: {}, status: 200 }]);
      const transport = createTestTransport({ fetch });

      await transport.get("/clients");

      expect(calls[0].url).toBe(`${BASE_URL}/clients`);
    });

    it("handles paths without leading slash", async () => {
      const { fetch, calls } = createMockFetch([{ body: {}, status: 200 }]);
      const transport = createTestTransport({ fetch });

      await transport.get("clients");

      expect(calls[0].url).toBe(`${BASE_URL}/clients`);
    });

    it("passes searchParams to the request", async () => {
      const { fetch, calls } = createMockFetch([
        { body: { data: [] }, status: 200 },
      ]);
      const transport = createTestTransport({ fetch });

      await transport.get("/clients", {
        searchParams: { active: true, limit: 10, page: 1 },
      });

      const url = new URL(calls[0].url);
      expect(url.searchParams.get("page")).toBe("1");
      expect(url.searchParams.get("limit")).toBe("10");
      expect(url.searchParams.get("active")).toBe("true");
    });
  });

  // ------- Headers -------

  describe("auth and SDK headers", () => {
    it("sends X-API-Key header with compound key", async () => {
      const { fetch, calls } = createMockFetch([{ body: {}, status: 200 }]);
      const transport = createTestTransport({ fetch });

      await transport.get("/clients");

      expect(calls[0].headers.get("X-API-Key")).toBe(COMPOUND_KEY);
    });

    it("does NOT send Authorization header", async () => {
      const { fetch, calls } = createMockFetch([{ body: {}, status: 200 }]);
      const transport = createTestTransport({ fetch });

      await transport.get("/clients");

      expect(calls[0].headers.get("Authorization")).toBeNull();
    });

    it("sends X-Assembly-SDK-Version header", async () => {
      const { fetch, calls } = createMockFetch([{ body: {}, status: 200 }]);
      const transport = createTestTransport({ fetch });

      await transport.get("/clients");

      expect(calls[0].headers.get("X-Assembly-SDK-Version")).toBe(SDK_VERSION);
    });

    it("sends Content-Type: application/json on POST", async () => {
      const { fetch, calls } = createMockFetch([{ body: {}, status: 200 }]);
      const transport = createTestTransport({ fetch });

      await transport.post("/clients", { name: "Test" });

      expect(calls[0].headers.get("Content-Type")).toBe("application/json");
    });
  });

  // ------- Error mapping: status codes -------

  describe("error mapping — status codes", () => {
    it("400 → AssemblyValidationError", async () => {
      const { fetch } = createMockFetch([
        { body: { error: "bad request" }, status: 400 },
      ]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyValidationError);
        expect((error as AssemblyValidationError).details).toEqual({
          error: "bad request",
        });
      }
    });

    it("401 → AssemblyUnauthorizedError", async () => {
      const { fetch } = createMockFetch([{ status: 401 }]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyUnauthorizedError);
      }
    });

    it("403 → AssemblyForbiddenError", async () => {
      const { fetch } = createMockFetch([{ status: 403 }]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyForbiddenError);
      }
    });

    it("404 → AssemblyNotFoundError", async () => {
      const { fetch } = createMockFetch([
        { body: { error: "not found" }, status: 404 },
      ]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients/999");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyNotFoundError);
        expect((error as AssemblyNotFoundError).details).toEqual({
          error: "not found",
        });
      }
    });

    it("422 → AssemblyValidationError", async () => {
      const { fetch } = createMockFetch([
        { body: { errors: ["name is required"] }, status: 422 },
      ]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.post("/clients", {});
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyValidationError);
      }
    });

    it("429 → AssemblyRateLimitError with retryAfter", async () => {
      const { fetch } = createMockFetch([
        {
          body: { error: "rate limited" },
          headers: { "Retry-After": "30" },
          status: 429,
        },
      ]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyRateLimitError);
        expect((error as AssemblyRateLimitError).retryAfter).toBe(30);
      }
    });

    it("429 without Retry-After → undefined retryAfter", async () => {
      const { fetch } = createMockFetch([{ status: 429 }]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyRateLimitError);
        expect((error as AssemblyRateLimitError).retryAfter).toBeUndefined();
      }
    });
  });

  describe("error mapping — server errors and misc", () => {
    it("500 → AssemblyServerError", async () => {
      const { fetch } = createMockFetch([{ status: 500 }]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyServerError);
      }
    });

    it("502 → AssemblyServerError", async () => {
      const { fetch } = createMockFetch([{ status: 502 }]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyServerError);
      }
    });

    it("503 → AssemblyServerError", async () => {
      const { fetch } = createMockFetch([{ status: 503 }]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyServerError);
      }
    });

    it("all mapped errors extend AssemblyError", async () => {
      const { fetch } = createMockFetch([{ status: 404 }]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyError);
      }
    });

    it("network failure → AssemblyConnectionError", async () => {
      const transport = createTestTransport({ fetch: FAILING_FETCH });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyConnectionError);
        expect((error as AssemblyConnectionError).cause).toBeInstanceOf(
          TypeError
        );
      }
    });

    it("preserves response body as details on error", async () => {
      const { fetch } = createMockFetch([
        { body: { code: "INVALID", fields: ["name"] }, status: 400 },
      ]);
      const transport = createTestTransport({ fetch });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect((error as AssemblyValidationError).details).toEqual({
          code: "INVALID",
          fields: ["name"],
        });
      }
    });
  });

  // ------- Retry -------

  describe("retry behavior", () => {
    it("429 once then 200 → resolves on retry", async () => {
      const { fetch, calls } = createMockFetch([
        { headers: { "Retry-After": "0" }, status: 429 },
        { body: { data: "ok" }, status: 200 },
      ]);
      const transport = createTestTransport({ fetch, retryCount: 1 });

      const result = await transport.get<{ data: string }>("/clients");

      expect(result).toEqual({ data: "ok" });
      expect(calls.length).toBeGreaterThanOrEqual(2);
    });

    it("503 once then 200 → resolves on retry", async () => {
      const { fetch, calls } = createMockFetch([
        { status: 503 },
        { body: { data: "recovered" }, status: 200 },
      ]);
      const transport = createTestTransport({ fetch, retryCount: 1 });

      const result = await transport.get<{ data: string }>("/clients");

      expect(result).toEqual({ data: "recovered" });
      expect(calls.length).toBeGreaterThanOrEqual(2);
    });

    it("503 exhausts retries → AssemblyServerError", async () => {
      const { fetch, calls } = createMockFetch([
        { status: 503 },
        { status: 503 },
        { status: 503 },
      ]);
      const transport = createTestTransport({ fetch, retryCount: 2 });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyServerError);
      }
      // 1 initial + 2 retries = 3 calls
      expect(calls.length).toBeGreaterThanOrEqual(3);
    });

    it("retryCount: 0 → no retries on 500", async () => {
      const { fetch, calls } = createMockFetch([
        { status: 500 },
        { body: {}, status: 200 },
      ]);
      const transport = createTestTransport({ fetch, retryCount: 0 });

      try {
        await transport.get("/clients");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyServerError);
      }
      expect(calls).toHaveLength(1);
    });
  });

  // ------- Rate limiting -------

  describe("rate limiting", () => {
    it("21 concurrent calls with 20/s limit → all resolve", async () => {
      const { fetch } = createMockFetch([{ body: { ok: true }, status: 200 }]);
      const transport = createTestTransport({
        fetch,
        requestsPerSecond: 20,
      });

      const promises = Array.from({ length: 21 }, (_, i) =>
        transport.get(`/item/${i}`)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(21);
      for (const result of results) {
        expect(result).toEqual({ ok: true });
      }
    });

    it("rate limiter delays requests beyond the limit", async () => {
      const timestamps: number[] = [];
      const mockFetch: typeof globalThis.fetch = (
        _input: RequestInfo | URL,
        _init?: RequestInit
      ): Promise<Response> => {
        timestamps.push(Date.now());
        return Promise.resolve(Response.json({ ok: true }, { status: 200 }));
      };

      // Use a very low limit so we can observe the delay
      const transport = createTestTransport({
        fetch: mockFetch,
        requestsPerSecond: 3,
      });

      const promises = Array.from({ length: 4 }, (_, i) =>
        transport.get(`/item/${i}`)
      );
      await Promise.all(promises);

      // The first 3 should be nearly simultaneous, the 4th should be delayed
      const firstThree = timestamps.slice(0, 3);
      const [fourth] = timestamps.slice(3);
      const maxEarlyTimestamp = Math.max(...firstThree);

      // The 4th request should be delayed by the rate limiter
      // (p-throttle uses a sliding window of 1000ms for 3 req/s)
      expect(fourth - maxEarlyTimestamp).toBeGreaterThanOrEqual(200);
    });
  });
});

// ---------------------------------------------------------------------------
// parseRetryAfter (unit tests)
// ---------------------------------------------------------------------------

describe("parseRetryAfter", () => {
  it("returns undefined for null", () => {
    expect(parseRetryAfter(null)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(parseRetryAfter("")).toBeUndefined();
  });

  it("parses integer seconds", () => {
    expect(parseRetryAfter("30")).toBe(30);
  });

  it("parses zero seconds", () => {
    expect(parseRetryAfter("0")).toBe(0);
  });

  it("parses decimal seconds", () => {
    expect(parseRetryAfter("1.5")).toBe(1.5);
  });

  it("returns undefined for negative value", () => {
    expect(parseRetryAfter("-5")).toBeUndefined();
  });

  it("parses HTTP-date in the future", () => {
    const futureDate = new Date(Date.now() + 60_000).toUTCString();
    const result = parseRetryAfter(futureDate) as number;
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(61);
  });

  it("returns 0 for HTTP-date in the past", () => {
    const pastDate = new Date(Date.now() - 60_000).toUTCString();
    expect(parseRetryAfter(pastDate)).toBe(0);
  });

  it("returns undefined for unparseable string", () => {
    expect(parseRetryAfter("not-a-date")).toBeUndefined();
  });
});
