import { describe, expect, it, vi } from "vite-plus/test";

import { AssemblyKit, createAssemblyKit } from "src/client";
import { KitMode } from "src/constants";
import { AssemblyNoTokenError } from "src/errors/no-token";

// Mock token module so it doesn't actually decrypt
vi.mock("src/token/assembly-token", () => ({
  AssemblyToken: class {
    currentToken: string;
    payload = { workspaceId: "ws-1" };
    constructor(public opts: { token: unknown; apiKey: string }) {
      this.currentToken = opts.token as string;
    }
    buildCompoundKey({ apiKey }: { apiKey: string }): string {
      return `ws-1/${apiKey}`;
    }
    ensureIsClient(): unknown {
      return this.payload;
    }
    ensureIsInternalUser(): unknown {
      return this.payload;
    }
  },
}));

// --- KitMode -----------------------------------------------------------------

describe("KitMode", () => {
  it("exports Local and Marketplace values", () => {
    expect(KitMode.Local).toBe("local");
    expect(KitMode.Marketplace).toBe("marketplace");
  });
});

// --- createAssemblyKit -------------------------------------------------------

describe("createAssemblyKit", () => {
  it("returns an AssemblyKit instance", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", workspaceId: "ws-1" });
    expect(kit).toBeInstanceOf(AssemblyKit);
  });

  it("returns a new instance on each call", () => {
    const opts = { apiKey: "test-key", workspaceId: "ws-1" } as const;
    const first = createAssemblyKit(opts);
    const second = createAssemblyKit(opts);
    expect(second).not.toBe(first);
  });

  it("defaults to local mode", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", workspaceId: "ws-1" });
    expect(kit).toBeInstanceOf(AssemblyKit);
  });

  it("accepts token in local mode (optional)", () => {
    const kit = createAssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      token: "some-token",
    });
    expect(kit.token?.currentToken).toBe("some-token");
    expect(kit.token).toBeDefined();
    expect(kit.token?.payload).toBeDefined();
  });

  it("works in local mode with only apiKey", () => {
    const kit = createAssemblyKit({ apiKey: "test-key" });
    expect(kit).toBeInstanceOf(AssemblyKit);
    expect(kit.token).toBeUndefined();
  });

  it("works in local mode with token but no workspaceId", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", token: "some-token" });
    expect(kit).toBeInstanceOf(AssemblyKit);
    expect(kit.token?.currentToken).toBe("some-token");
  });
});

// --- Marketplace mode --------------------------------------------------------

describe("marketplace mode", () => {
  it("accepts token", () => {
    const kit = createAssemblyKit({
      apiKey: "test-key",
      token: "some-token",
      kitMode: KitMode.Marketplace,
    });
    expect(kit).toBeInstanceOf(AssemblyKit);
    expect(kit.token?.currentToken).toBe("some-token");
  });

  it("accepts workspaceId without token", () => {
    const kit = createAssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      kitMode: KitMode.Marketplace,
    });
    expect(kit).toBeInstanceOf(AssemblyKit);
    expect(kit.token).toBeUndefined();
  });

  it("accepts both token and workspaceId", () => {
    const kit = createAssemblyKit({
      apiKey: "test-key",
      token: "some-token",
      workspaceId: "ws-1",
      kitMode: KitMode.Marketplace,
    });
    expect(kit).toBeInstanceOf(AssemblyKit);
    expect(kit.token?.currentToken).toBe("some-token");
  });

  it("throws when neither token nor workspaceId is provided", () => {
    expect(() =>
      createAssemblyKit({
        apiKey: "test-key",
        kitMode: KitMode.Marketplace,
      }),
    ).toThrow("Marketplace mode requires either `token` or `workspaceId`.");
  });
});

// --- Resource namespaces -----------------------------------------------------

describe("resource namespaces", () => {
  it("exposes all resource namespaces", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", workspaceId: "ws-1" });
    expect(kit.companies).toBeDefined();
    expect(kit.clients).toBeDefined();
    expect(kit.tasks).toBeDefined();
    expect(kit.events).toBeDefined();
    expect(kit.workspace).toBeDefined();
    expect(kit.notifications).toBeDefined();
  });
});

// --- Token guards ------------------------------------------------------------

describe("token guards", () => {
  it("ensureIsClient throws when no token", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", workspaceId: "ws-1" });
    expect(() => kit.ensureIsClient()).toThrow(AssemblyNoTokenError);
  });

  it("ensureIsInternalUser throws when no token", () => {
    const kit = createAssemblyKit({ apiKey: "test-key", workspaceId: "ws-1" });
    expect(() => kit.ensureIsInternalUser()).toThrow(AssemblyNoTokenError);
  });

  it("ensureIsClient returns payload when token is present", () => {
    const kit = createAssemblyKit({
      apiKey: "test-key",
      workspaceId: "ws-1",
      token: "some-token",
    });
    expect(kit.ensureIsClient()).toEqual({ workspaceId: "ws-1" });
  });
});
