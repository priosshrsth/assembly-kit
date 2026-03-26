/* eslint-disable eslint-plugin-promise/avoid-new */
import { describe, expect, it, mock } from "bun:test";

// Mock the SDK before importing AssemblyKit
mock.module("@assembly-js/node-sdk", () => ({
  assemblyApi: () => ({ retrieveWorkspace: () => Promise.resolve({}) }),
}));

// eslint-disable-next-line eslint-plugin-import/first
import { AssemblyKit } from "src/assembly-kit/assembly-kit";

const opts = { apiKey: "test-key" };

/** Run `fn` in a fresh async context (isolated from the test runner's context). */
const inFreshContext = (fn: () => void): Promise<void> =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, 0);
  });

describe("AssemblyKit.new", () => {
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
