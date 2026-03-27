import { describe, expect, it } from "vite-plus/test";

import {
  AssemblyInvalidTokenError,
  AssemblyNoTokenError,
  AssemblyUnauthorizedError,
} from "src/errors";
import type { TokenPayload } from "src/schemas/shared/token";
import { AssemblyToken, createToken } from "src/token";

import {
  BLOCK_ALIGNED_TOKEN,
  BLOCK_ALIGNED_WORKSPACE_ID,
  CLIENT_TOKEN,
  INTERNAL_USER_TOKEN,
  TEST_API_KEY,
  TEST_BASE_URL,
  TEST_CLIENT_ID,
  TEST_COMPANY_ID,
  TEST_INTERNAL_USER_ID,
  TEST_TOKEN_ID,
  TEST_WORKSPACE_ID,
  TOKEN_WITH_BASE_URL,
  TOKEN_WITH_TOKEN_ID,
} from "./fixtures/tokens";

// ---------------------------------------------------------------------------
// Constructor errors
// ---------------------------------------------------------------------------
describe("AssemblyToken constructor errors", () => {
  describe("throws AssemblyNoTokenError for missing tokens", () => {
    it("undefined", () => {
      expect(() => new AssemblyToken({ apiKey: TEST_API_KEY, token: undefined })).toThrow(
        AssemblyNoTokenError,
      );
    });

    it("null", () => {
      expect(() => new AssemblyToken({ apiKey: TEST_API_KEY, token: null })).toThrow(
        AssemblyNoTokenError,
      );
    });

    it("empty string", () => {
      expect(() => new AssemblyToken({ apiKey: TEST_API_KEY, token: "" })).toThrow(
        AssemblyNoTokenError,
      );
    });
  });

  describe("throws AssemblyInvalidTokenError for invalid tokens", () => {
    it("non-string value", () => {
      expect(() => new AssemblyToken({ apiKey: TEST_API_KEY, token: 123 })).toThrow(
        AssemblyInvalidTokenError,
      );
    });

    it("non-hex string", () => {
      expect(
        () =>
          new AssemblyToken({
            apiKey: TEST_API_KEY,
            token: "not-a-valid-hex-token",
          }),
      ).toThrow(AssemblyInvalidTokenError);
    });

    it("wrong API key", () => {
      expect(() => new AssemblyToken({ apiKey: "wrong-api-key", token: CLIENT_TOKEN })).toThrow(
        AssemblyInvalidTokenError,
      );
    });

    it("preserves cause on decryption failure", () => {
      let caught: unknown;
      try {
        caught = new AssemblyToken({
          apiKey: TEST_API_KEY,
          token: "not-a-valid-hex-token",
        });
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AssemblyInvalidTokenError);
      expect((caught as AssemblyInvalidTokenError).cause).toBeDefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Decryption
// ---------------------------------------------------------------------------
describe("AssemblyToken decryption", () => {
  it("client token → { workspaceId, clientId, companyId }", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    expect(t.payload.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(t.payload.clientId).toBe(TEST_CLIENT_ID);
    expect(t.payload.companyId).toBe(TEST_COMPANY_ID);
    expect(t.payload.internalUserId).toBeUndefined();
  });

  it("internal user token → { workspaceId, internalUserId }", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: INTERNAL_USER_TOKEN,
    });
    expect(t.payload.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(t.payload.internalUserId).toBe(TEST_INTERNAL_USER_ID);
    expect(t.payload.clientId).toBeUndefined();
    expect(t.payload.companyId).toBeUndefined();
  });

  it("token with tokenId → payload includes tokenId", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: TOKEN_WITH_TOKEN_ID,
    });
    expect(t.payload.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(t.payload.clientId).toBe(TEST_CLIENT_ID);
    expect(t.payload.companyId).toBe(TEST_COMPANY_ID);
    expect(t.payload.tokenId).toBe(TEST_TOKEN_ID);
  });

  it("token with baseUrl → payload includes baseUrl", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: TOKEN_WITH_BASE_URL,
    });
    expect(t.payload.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(t.payload.internalUserId).toBe(TEST_INTERNAL_USER_ID);
    expect(t.payload.baseUrl).toBe(TEST_BASE_URL);
  });

  it("block-aligned token decrypts correctly (Node 24 PKCS7 edge case)", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: BLOCK_ALIGNED_TOKEN,
    });
    expect(t.payload.workspaceId).toBe(BLOCK_ALIGNED_WORKSPACE_ID);
    expect(t.payload.internalUserId).toBe(TEST_INTERNAL_USER_ID);
  });
});

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------
describe("AssemblyToken getters", () => {
  it("exposes workspaceId", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    expect(t.workspaceId).toBe(TEST_WORKSPACE_ID);
  });

  it("exposes clientId and companyId for client tokens", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    expect(t.clientId).toBe(TEST_CLIENT_ID);
    expect(t.companyId).toBe(TEST_COMPANY_ID);
  });

  it("exposes internalUserId for internal user tokens", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: INTERNAL_USER_TOKEN,
    });
    expect(t.internalUserId).toBe(TEST_INTERNAL_USER_ID);
  });

  it("exposes tokenId when present", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: TOKEN_WITH_TOKEN_ID,
    });
    expect(t.tokenId).toBe(TEST_TOKEN_ID);
  });

  it("exposes baseUrl when present", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: TOKEN_WITH_BASE_URL,
    });
    expect(t.baseUrl).toBe(TEST_BASE_URL);
  });

  it("returns undefined for absent optional fields", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    expect(t.internalUserId).toBeUndefined();
    expect(t.tokenId).toBeUndefined();
    expect(t.baseUrl).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Identity checks
// ---------------------------------------------------------------------------
describe("AssemblyToken identity checks", () => {
  it("isClientUser is true for client tokens", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    expect(t.isClientUser).toBe(true);
    expect(t.isInternalUser).toBe(false);
  });

  it("isInternalUser is true for internal user tokens", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: INTERNAL_USER_TOKEN,
    });
    expect(t.isInternalUser).toBe(true);
    expect(t.isClientUser).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------
describe("AssemblyToken.ensureIsClient", () => {
  it("returns narrowed type for client tokens", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    const narrowed = t.ensureIsClient();
    expect(narrowed.clientId).toBe(TEST_CLIENT_ID);
    expect(narrowed.companyId).toBe(TEST_COMPANY_ID);
  });

  it("throws AssemblyUnauthorizedError for internal user tokens", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: INTERNAL_USER_TOKEN,
    });
    expect(() => t.ensureIsClient()).toThrow(AssemblyUnauthorizedError);
  });
});

describe("AssemblyToken.ensureIsInternalUser", () => {
  it("returns narrowed type for internal user tokens", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: INTERNAL_USER_TOKEN,
    });
    const narrowed = t.ensureIsInternalUser();
    expect(narrowed.internalUserId).toBe(TEST_INTERNAL_USER_ID);
  });

  it("throws AssemblyUnauthorizedError for client tokens", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    expect(() => t.ensureIsInternalUser()).toThrow(AssemblyUnauthorizedError);
  });
});

// ---------------------------------------------------------------------------
// buildCompoundKey
// ---------------------------------------------------------------------------
describe("AssemblyToken.buildCompoundKey", () => {
  it("without tokenId → workspaceId/apiKey", () => {
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
    expect(t.buildCompoundKey({ apiKey: TEST_API_KEY })).toBe(
      `${TEST_WORKSPACE_ID}/${TEST_API_KEY}`,
    );
  });

  it("with tokenId → workspaceId/apiKey/tokenId", () => {
    const t = new AssemblyToken({
      apiKey: TEST_API_KEY,
      token: TOKEN_WITH_TOKEN_ID,
    });
    expect(t.buildCompoundKey({ apiKey: TEST_API_KEY })).toBe(
      `${TEST_WORKSPACE_ID}/${TEST_API_KEY}/${TEST_TOKEN_ID}`,
    );
  });
});

// ---------------------------------------------------------------------------
// createToken (standalone)
// ---------------------------------------------------------------------------
describe("createToken", () => {
  it("round-trips a client payload through createToken → AssemblyToken", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const token = createToken({ apiKey: TEST_API_KEY, payload });
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token });
    expect(t.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(t.clientId).toBe(TEST_CLIENT_ID);
    expect(t.companyId).toBe(TEST_COMPANY_ID);
  });

  it("round-trips an internal user payload", () => {
    const payload: TokenPayload = {
      internalUserId: TEST_INTERNAL_USER_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const token = createToken({ apiKey: TEST_API_KEY, payload });
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token });
    expect(t.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(t.internalUserId).toBe(TEST_INTERNAL_USER_ID);
  });

  it("preserves optional fields (tokenId, baseUrl)", () => {
    const payload: TokenPayload = {
      baseUrl: TEST_BASE_URL,
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      tokenId: TEST_TOKEN_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const token = createToken({ apiKey: TEST_API_KEY, payload });
    const t = new AssemblyToken({ apiKey: TEST_API_KEY, token });
    expect(t.tokenId).toBe(TEST_TOKEN_ID);
    expect(t.baseUrl).toBe(TEST_BASE_URL);
  });

  it("produces different ciphertexts for the same payload (random IV)", () => {
    const payload: TokenPayload = {
      internalUserId: TEST_INTERNAL_USER_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const token1 = createToken({ apiKey: TEST_API_KEY, payload });
    const token2 = createToken({ apiKey: TEST_API_KEY, payload });
    expect(token1).not.toBe(token2);
  });

  it("throws AssemblyInvalidTokenError for invalid payload", () => {
    const badPayload = { workspaceId: "" } as TokenPayload;
    expect(() => createToken({ apiKey: TEST_API_KEY, payload: badPayload })).toThrow(
      AssemblyInvalidTokenError,
    );
  });
});

// ─── AsyncLocalStorage (.new / .current) ─────────────────────────────────────

/** Run `fn` in a fresh async context (isolated from the test runner's context). */
const inFreshContext = (fn: () => void): Promise<void> =>
  // eslint-disable-next-line eslint-plugin-promise/avoid-new
  new Promise<void>((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, 0);
  });

describe("AssemblyToken.new", () => {
  const opts = { apiKey: TEST_API_KEY, token: CLIENT_TOKEN };

  it("returns the same instance on repeated .new() calls", async () => {
    await inFreshContext(() => {
      const first = AssemblyToken.new(opts);
      const second = AssemblyToken.new(opts);
      expect(second).toBe(first);
    });
  });

  it("creates a new instance when token changes", async () => {
    await inFreshContext(() => {
      const first = AssemblyToken.new(opts);
      const second = AssemblyToken.new({
        apiKey: TEST_API_KEY,
        token: INTERNAL_USER_TOKEN,
      });
      expect(second).not.toBe(first);
    });
  });

  it("different async contexts get different instances", async () => {
    const instances: AssemblyToken[] = [];
    await Promise.all([
      inFreshContext(() => {
        instances.push(AssemblyToken.new(opts));
      }),
      inFreshContext(() => {
        instances.push(AssemblyToken.new(opts));
      }),
    ]);
    expect(instances[0]).not.toBe(instances[1]);
  });
});
