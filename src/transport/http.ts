import ky, { HTTPError } from "ky";
import pThrottle from "p-throttle";
import type { AssemblyError } from "src/errors/base";
import { AssemblyConnectionError } from "src/errors/connection";
import { AssemblyForbiddenError } from "src/errors/forbidden";
import { AssemblyNotFoundError } from "src/errors/not-found";
import { AssemblyRateLimitError } from "src/errors/rate-limit";
import { AssemblyServerError } from "src/errors/server";
import { AssemblyUnauthorizedError } from "src/errors/unauthorized";
import { AssemblyValidationError } from "src/errors/validation";

const DEFAULT_BASE_URL = "https://app.assembly.com/api";
const DEFAULT_REQUESTS_PER_SECOND = 20;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TransportOptions {
  /** Pre-built compound key value for the `X-API-Key` header. */
  compoundKey: string;
  /** SDK version string for the `X-Assembly-SDK-Version` header. */
  sdkVersion: string;
  /** Base URL for all API requests. Defaults to the Assembly API. */
  baseUrl?: string;
  /** Maximum number of retry attempts for retryable errors (ky default: 2). */
  retryCount?: number;
  /** Maximum requests per second for the sliding-window rate limiter. */
  requestsPerSecond?: number;
  /** Injectable fetch function for testing. Defaults to global `fetch`. */
  fetch?: typeof globalThis.fetch;
}

export interface RequestOpts {
  searchParams?: Record<string, string | number | boolean>;
}

export interface Transport {
  get<T>(path: string, opts?: RequestOpts): Promise<T>;
  post<T>(path: string, body?: unknown, opts?: RequestOpts): Promise<T>;
  patch<T>(path: string, body?: unknown, opts?: RequestOpts): Promise<T>;
  delete<T>(path: string, opts?: RequestOpts): Promise<T>;
}

// ---------------------------------------------------------------------------
// Retry-After parsing
// ---------------------------------------------------------------------------

/**
 * Parses a `Retry-After` header value into seconds.
 * Supports both integer seconds and HTTP-date formats (RFC 7231).
 * Returns `undefined` if the header is absent or unparseable.
 */
export const parseRetryAfter = (header: string | null): number | undefined => {
  if (!header) {
    return undefined;
  }

  const seconds = Number(header);
  if (!Number.isNaN(seconds)) {
    return seconds >= 0 ? seconds : undefined;
  }

  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    const delayMs = dateMs - Date.now();
    return delayMs > 0 ? Math.ceil(delayMs / 1000) : 0;
  }

  return undefined;
};

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

const tryParseBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.clone().json();
  } catch {
    return undefined;
  }
};

const createErrorForStatus = (
  status: number,
  cause: HTTPError,
  details: unknown,
  retryAfterHeader: string | null
): AssemblyError => {
  switch (status) {
    case 400:
    case 422: {
      return new AssemblyValidationError({ cause, details });
    }
    case 401: {
      return new AssemblyUnauthorizedError({ cause, details });
    }
    case 403: {
      return new AssemblyForbiddenError({ cause, details });
    }
    case 404: {
      return new AssemblyNotFoundError({ cause, details });
    }
    case 429: {
      return new AssemblyRateLimitError({
        cause,
        details,
        retryAfter: parseRetryAfter(retryAfterHeader),
      });
    }
    default: {
      if (status >= 500) {
        return new AssemblyServerError({ cause, details });
      }
      return new AssemblyConnectionError({
        cause,
        details,
        message: `Unexpected HTTP ${status}`,
      });
    }
  }
};

const mapHttpError = async (error: HTTPError): Promise<AssemblyError> => {
  const { response } = error;
  const details = await tryParseBody(response);
  return createErrorForStatus(
    response.status,
    error,
    details,
    response.headers.get("Retry-After")
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const stripLeadingSlash = (path: string): string =>
  path.startsWith("/") ? path.slice(1) : path;

const withErrorMapping = async <T>(request: Promise<T>): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    if (error instanceof HTTPError) {
      throw await mapHttpError(error);
    }
    throw new AssemblyConnectionError({ cause: error });
  }
};

// ---------------------------------------------------------------------------
// Transport factory
// ---------------------------------------------------------------------------

/**
 * Creates an HTTP transport backed by `ky` with rate limiting, retry,
 * auth headers, and structured error mapping. Each call produces a fully
 * independent instance (safe for serverless / multi-tenant).
 */
export const createTransport = (options: TransportOptions): Transport => {
  const acquireSlot = pThrottle({
    interval: 1000,
    limit: options.requestsPerSecond ?? DEFAULT_REQUESTS_PER_SECOND,
    // eslint-disable-next-line no-empty-function
  })(async (): Promise<void> => {});

  const api = ky.create({
    headers: {
      "X-API-Key": options.compoundKey,
      "X-Assembly-SDK-Version": options.sdkVersion,
    },
    hooks: {
      beforeRequest: [
        async (): Promise<void> => {
          await acquireSlot();
        },
      ],
    },
    prefixUrl: options.baseUrl ?? DEFAULT_BASE_URL,
    retry: {
      limit: options.retryCount ?? 2,
      methods: ["get", "post", "put", "patch", "delete"],
    },
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });

  return {
    delete: <T>(path: string, opts?: RequestOpts): Promise<T> =>
      withErrorMapping(
        api
          .delete(stripLeadingSlash(path), { searchParams: opts?.searchParams })
          .json<T>()
      ),

    get: <T>(path: string, opts?: RequestOpts): Promise<T> =>
      withErrorMapping(
        api
          .get(stripLeadingSlash(path), { searchParams: opts?.searchParams })
          .json<T>()
      ),

    patch: <T>(path: string, body?: unknown, opts?: RequestOpts): Promise<T> =>
      withErrorMapping(
        api
          .patch(stripLeadingSlash(path), {
            json: body,
            searchParams: opts?.searchParams,
          })
          .json<T>()
      ),

    post: <T>(path: string, body?: unknown, opts?: RequestOpts): Promise<T> =>
      withErrorMapping(
        api
          .post(stripLeadingSlash(path), {
            json: body,
            searchParams: opts?.searchParams,
          })
          .json<T>()
      ),
  };
};
