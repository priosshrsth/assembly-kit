import { describe, expect, it } from "bun:test";

import { isRetryableError } from "src/assembly-kit/error-filter";

describe("isRetryableError", () => {
  it("returns true for status 429", () => {
    expect(isRetryableError({ status: 429 })).toBe(true);
  });

  it("returns true for status 500", () => {
    expect(isRetryableError({ status: 500 })).toBe(true);
  });

  it("returns true for status 503", () => {
    expect(isRetryableError({ status: 503 })).toBe(true);
  });

  it("returns false for status 401", () => {
    expect(isRetryableError({ status: 401 })).toBe(false);
  });

  it("returns false for status 404", () => {
    expect(isRetryableError({ status: 404 })).toBe(false);
  });

  it("returns false for non-object errors", () => {
    expect(isRetryableError("network error")).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(42)).toBe(false);
  });

  it("returns false for objects without status", () => {
    expect(isRetryableError({ message: "fail" })).toBe(false);
    expect(isRetryableError({})).toBe(false);
  });
});
