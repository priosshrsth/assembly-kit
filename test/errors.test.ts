import { beforeAll, describe, expect, it } from "bun:test";

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
} from "src/errors";
import type { AssemblyErrorOptions } from "src/errors";
import { z } from "zod";
import type { ZodError } from "zod";

describe("AssemblyError (base)", () => {
  it("has correct name, statusCode, and message", () => {
    const err = new AssemblyError({ message: "base error", statusCode: 500 });
    expect(err.name).toBe("AssemblyError");
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("base error");
    expect(err instanceof Error).toBe(true);
  });

  it("stores optional details", () => {
    const details = { raw: "body" };
    const err = new AssemblyError({ details, message: "msg", statusCode: 400 });
    expect(err.details).toBe(details);
  });

  it("stores optional cause", () => {
    const cause = new Error("original");
    const err = new AssemblyError({ cause, message: "msg", statusCode: 400 });
    expect(err.cause).toBe(cause);
  });
});

describe("factory-generated error subclasses", () => {
  const cases: {
    name: string;
    Ctor: new (opts?: AssemblyErrorOptions) => AssemblyError;
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

      it("accepts a custom message", () => {
        const err = new Ctor({ message: "custom message" });
        expect(err.message).toBe("custom message");
      });

      it("stores optional details", () => {
        const details = { extra: true };
        const err = new Ctor({ details });
        expect(err.details).toEqual(details);
      });

      it("stores optional cause", () => {
        const cause = new Error("original");
        const err = new Ctor({ cause });
        expect(err.cause).toBe(cause);
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
    const err = new AssemblyRateLimitError({ retryAfter: 30 });
    expect(err.retryAfter).toBe(30);
  });

  it("accepts a custom message", () => {
    const err = new AssemblyRateLimitError({ message: "slow down" });
    expect(err.message).toBe("slow down");
  });
});

describe("AssemblyResponseParseError", () => {
  let zodError: ZodError;
  let nestedZodError: ZodError;

  beforeAll(() => {
    const flat = z.string().safeParse(42);
    if (flat.success) {
      throw new Error("Expected flat parse to fail");
    }
    zodError = flat.error;

    const nested = z
      .object({ user: z.object({ age: z.number(), name: z.string() }) })
      .safeParse({ user: { age: "x", name: 1 } });
    if (nested.success) {
      throw new Error("Expected nested parse to fail");
    }
    nestedZodError = nested.error;
  });

  it("has correct .name and .statusCode", () => {
    const err = new AssemblyResponseParseError({ cause: zodError });
    expect(err.name).toBe("AssemblyResponseParseError");
    expect(err.statusCode).toBe(500);
  });

  it("is instanceof AssemblyError and Error", () => {
    const err = new AssemblyResponseParseError({ cause: zodError });
    expect(err instanceof AssemblyError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it("exposes the ZodError on .cause", () => {
    const err = new AssemblyResponseParseError({ cause: zodError });
    expect(err.cause).toBe(zodError);
    expect(err.cause.issues.length).toBeGreaterThan(0);
  });

  it("accepts a custom message", () => {
    const err = new AssemblyResponseParseError({
      cause: zodError,
      message: "schema mismatch",
    });
    expect(err.message).toBe("schema mismatch");
  });

  it("validationErrors is a non-empty string containing a checkmark", () => {
    const err = new AssemblyResponseParseError({ cause: zodError });
    expect(err.validationErrors.length).toBeGreaterThan(0);
    expect(err.validationErrors).toContain("✖");
  });

  it("validationErrors includes field paths for nested errors", () => {
    const err = new AssemblyResponseParseError({ cause: nestedZodError });
    expect(err.validationErrors).toContain("user.name");
    expect(err.validationErrors).toContain("user.age");
  });
});
