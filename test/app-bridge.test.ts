import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { DASHBOARD_DOMAINS, Icons, sendToParent } from "src/app-bridge";
import type { ActionsMenuPayload, PrimaryCtaPayload } from "src/app-bridge";

// ─── call tracker ─────────────────────────────────────────────────────────────

interface Call {
  data: unknown;
  origin: string;
}

const setupWindow = (): Call[] => {
  const calls: Call[] = [];
  (globalThis as unknown as { window: unknown }).window = {
    parent: {
      postMessage: (data: unknown, origin: string) => {
        calls.push({ data, origin });
      },
    },
  };
  return calls;
};

const teardownWindow = (): void => {
  delete (globalThis as unknown as { window: unknown }).window;
};

// ─── sendToParent ─────────────────────────────────────────────────────────────

describe("sendToParent — browser environment", () => {
  let calls: Call[];

  beforeEach(() => {
    calls = setupWindow();
  });

  afterEach(() => {
    teardownWindow();
  });

  const payload: PrimaryCtaPayload = {
    label: "Save",
    type: "header.primaryCta",
  };

  it("posts to every DASHBOARD_DOMAIN when no portalUrl given", () => {
    sendToParent(payload);
    expect(calls).toHaveLength(DASHBOARD_DOMAINS.length);
    for (const domain of DASHBOARD_DOMAINS) {
      expect(calls).toContainEqual({ data: payload, origin: domain });
    }
  });

  it("posts only to the given portalUrl", () => {
    sendToParent(payload, "https://my-portal.example.com");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      data: payload,
      origin: "https://my-portal.example.com",
    });
  });

  it("upgrades http:// portalUrl to https://", () => {
    sendToParent(payload, "http://my-portal.example.com");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      data: payload,
      origin: "https://my-portal.example.com",
    });
  });

  it("leaves https:// portalUrl unchanged", () => {
    sendToParent(payload, "https://my-portal.example.com");
    expect(calls[0]).toEqual({
      data: payload,
      origin: "https://my-portal.example.com",
    });
  });

  it("forwards the full payload object to postMessage", () => {
    const menu: ActionsMenuPayload = {
      items: [
        { icon: Icons.Trash, label: "Delete", onClick: "actions.delete" },
      ],
      type: "header.actionsMenu",
    };
    sendToParent(menu);
    expect(calls[0]).toEqual({ data: menu, origin: DASHBOARD_DOMAINS[0] });
  });
});

describe("sendToParent — SSR environment", () => {
  it("is a no-op and does not throw when window is undefined", () => {
    expect(() => sendToParent({ type: "header.primaryCta" })).not.toThrow();
  });
});

// ─── DASHBOARD_DOMAINS ───────────────────────────────────────────────────────

describe("DASHBOARD_DOMAINS", () => {
  it("contains the production dashboard domain", () => {
    expect(DASHBOARD_DOMAINS).toContain("https://dashboard.assembly.com");
  });

  it("contains the staging dashboard domain", () => {
    expect(DASHBOARD_DOMAINS).toContain(
      "https://dashboard.assembly-staging.com"
    );
  });

  it("all entries use https://", () => {
    for (const domain of DASHBOARD_DOMAINS) {
      expect(domain).toStartWith("https://");
    }
  });
});

// ─── Icons ───────────────────────────────────────────────────────────────────

describe("Icons", () => {
  it("has all expected values", () => {
    expect(Icons.Archive).toBe("Archive");
    expect(Icons.Plus).toBe("Plus");
    expect(Icons.Templates).toBe("Templates");
    expect(Icons.Trash).toBe("Trash");
    expect(Icons.Download).toBe("Download");
    expect(Icons.Disconnect).toBe("Disconnect");
  });
});
