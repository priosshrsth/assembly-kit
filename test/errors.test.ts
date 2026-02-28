import { describe, expect, it } from "bun:test";

import { z } from "zod";

import {
  AssemblyConnectionError,
  AssemblyError,
  AssemblyForbiddenError,
  AssemblyInvalidTokenError,
  AssemblyMissingApiKeyError,
  AssemblyNoTokenError,
  AssemblyNotFoundError,
  AssemblyRateLimitError,
  AssemblyResponseParseError,
  AssemblyServerError,
  AssemblyUnauthorizedError,
  AssemblyValidationError,
} from "@/errors/index.ts";

describe("AssemblyError (base)", () => {
  it("has correct name, statusCode, and message", () => {
    const err = new AssemblyError("base error", 500);
    expect(err.name).toBe("AssemblyError");
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("base error");
    expect(err instanceof Error).toBe(true);
  });

  it("stores optional details", () => {
    const details = { raw: "body" };
    const err = new AssemblyError("msg", 400, details);
    expect(err.details).toBe(details);
  });
});

describe("factory-generated error subclasses", () => {
  const cases: {
    name: string;
    Ctor: new (msg?: string, details?: unknown) => AssemblyError;
    statusCode: number;
    defaultMessageFragment: string;
  }[] = [
    {
      Ctor: AssemblyMissingApiKeyError,
      defaultMessageFragment: "API key",
      name: "AssemblyMissingApiKeyError",
      statusCode: 400,
    },
    {
      Ctor: AssemblyNoTokenError,
      defaultMessageFragment: "token",
      name: "AssemblyNoTokenError",
      statusCode: 400,
    },
    {
      Ctor: AssemblyInvalidTokenError,
      defaultMessageFragment: "token",
      name: "AssemblyInvalidTokenError",
      statusCode: 401,
    },
    {
      Ctor: AssemblyUnauthorizedError,
      defaultMessageFragment: "Unauthorized",
      name: "AssemblyUnauthorizedError",
      statusCode: 401,
    },
    {
      Ctor: AssemblyForbiddenError,
      defaultMessageFragment: "Forbidden",
      name: "AssemblyForbiddenError",
      statusCode: 403,
    },
    {
      Ctor: AssemblyNotFoundError,
      defaultMessageFragment: "not found",
      name: "AssemblyNotFoundError",
      statusCode: 404,
    },
    {
      Ctor: AssemblyValidationError,
      defaultMessageFragment: "payload",
      name: "AssemblyValidationError",
      statusCode: 422,
    },
    {
      Ctor: AssemblyServerError,
      defaultMessageFragment: "Assembly server",
      name: "AssemblyServerError",
      statusCode: 500,
    },
    {
      Ctor: AssemblyConnectionError,
      defaultMessageFragment: "network",
      name: "AssemblyConnectionError",
      statusCode: 503,
    },
  ];

  describe.each(cases)(
    "$name",
    ({ name, Ctor, statusCode, defaultMessageFragment }) => {
      it("has correct .name and .statusCode", () => {
        const err = new Ctor();
        expect(err.name).toBe(name);
        expect(err.statusCode).toBe(statusCode);
      });

      it("is instanceof AssemblyError and Error", () => {
        const err = new Ctor();
        expect(err instanceof AssemblyError).toBe(true);
        expect(err instanceof Error).toBe(true);
      });

      it("has a default message containing expected text", () => {
        const err = new Ctor();
        expect(err.message.toLowerCase()).toContain(
          defaultMessageFragment.toLowerCase()
        );
      });

      it("accepts a custom message override", () => {
        const err = new Ctor("custom message");
        expect(err.message).toBe("custom message");
      });

      it("stores optional details", () => {
        const details = { extra: true };
        const err = new Ctor(undefined, details);
        expect(err.details).toEqual(details);
      });
    }
  );
});

describe("AssemblyRateLimitError", () => {
  it("has correct .name and .statusCode", () => {
    const err = new AssemblyRateLimitError();
    expect(err.name).toBe("AssemblyRateLimitError");
    expect(err.statusCode).toBe(429);
  });

  it("is instanceof AssemblyError and Error", () => {
    const err = new AssemblyRateLimitError();
    expect(err instanceof AssemblyError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it("retryAfter is undefined when not provided", () => {
    const err = new AssemblyRateLimitError();
    expect(err.retryAfter).toBeUndefined();
  });

  it("stores retryAfter when provided", () => {
    const err = new AssemblyRateLimitError(undefined, 30);
    expect(err.retryAfter).toBe(30);
  });

  it("accepts a custom message override", () => {
    const err = new AssemblyRateLimitError("slow down");
    expect(err.message).toBe("slow down");
  });
});

describe("AssemblyResponseParseError", () => {
  const parseResult = z.string().safeParse(42);
  if (parseResult.success) {
    throw new Error("Expected parse to fail");
  }
  const zodError = parseResult.error;

  it("has correct .name and .statusCode", () => {
    const err = new AssemblyResponseParseError(zodError);
    expect(err.name).toBe("AssemblyResponseParseError");
    expect(err.statusCode).toBe(500);
  });

  it("is instanceof AssemblyError and Error", () => {
    const err = new AssemblyResponseParseError(zodError);
    expect(err instanceof AssemblyError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it("stores the ZodError on .zodError", () => {
    const err = new AssemblyResponseParseError(zodError);
    expect(err.zodError).toBe(zodError);
    expect(err.zodError.issues.length).toBeGreaterThan(0);
  });

  it("accepts a custom message override", () => {
    const err = new AssemblyResponseParseError(zodError, "schema mismatch");
    expect(err.message).toBe("schema mismatch");
  });
});
