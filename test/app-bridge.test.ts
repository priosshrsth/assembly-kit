import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DASHBOARD_DOMAINS, Icons, sendToParent } from "src/app-bridge";
import type { ActionsMenuPayload, PrimaryCtaPayload } from "src/app-bridge";

// ─── helpers ─────────────────────────────────────────────────────────────────

type PostMessageMock = ReturnType<
  typeof mock<(data: unknown, origin: string) => void>
>;

const setupWindow = (): PostMessageMock => {
  const postMessage = mock<(data: unknown, origin: string) => void>(
    (_data, _origin) => {}
  );
  (globalThis as unknown as { window: unknown }).window = {
    parent: { postMessage },
  };
  return postMessage;
};

const teardownWindow = (): void => {
  delete (globalThis as unknown as { window: unknown }).window;
};

// ─── sendToParent ─────────────────────────────────────────────────────────────

describe("sendToParent — browser environment", () => {
  let postMessage: PostMessageMock;

  beforeEach(() => {
    postMessage = setupWindow();
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
    expect(postMessage).toHaveBeenCalledTimes(DASHBOARD_DOMAINS.length);
    for (const domain of DASHBOARD_DOMAINS) {
      expect(postMessage).toHaveBeenCalledWith(payload, domain);
    }
  });

  it("posts only to the given portalUrl", () => {
    sendToParent(payload, "https://my-portal.example.com");
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(
      payload,
      "https://my-portal.example.com"
    );
  });

  it("upgrades http:// portalUrl to https://", () => {
    sendToParent(payload, "http://my-portal.example.com");
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(
      payload,
      "https://my-portal.example.com"
    );
  });

  it("leaves https:// portalUrl unchanged", () => {
    sendToParent(payload, "https://my-portal.example.com");
    expect(postMessage).toHaveBeenCalledWith(
      payload,
      "https://my-portal.example.com"
    );
  });

  it("forwards the full payload object to postMessage", () => {
    const menu: ActionsMenuPayload = {
      items: [
        { icon: Icons.Trash, label: "Delete", onClick: "actions.delete" },
      ],
      type: "header.actionsMenu",
    };
    sendToParent(menu);
    expect(postMessage).toHaveBeenCalledWith(menu, DASHBOARD_DOMAINS[0]);
  });
});

describe("sendToParent — SSR environment", () => {
  it("is a no-op and does not throw when window is undefined", () => {
    // In bun's test runner, window is not defined — mirrors SSR behaviour.
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
