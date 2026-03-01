import { describe, expect, it } from "bun:test";

import {
  AssemblyInvalidTokenError,
  AssemblyNoTokenError,
  AssemblyUnauthorizedError,
} from "src/errors";
import type { TokenPayload } from "src/schemas/base/token";
import {
  buildCompoundKey,
  createToken,
  ensureIsClient,
  ensureIsInternalUser,
  isClientToken,
  isInternalUserToken,
  parseToken,
} from "src/token";

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
// parseToken
// ---------------------------------------------------------------------------
describe("parseToken", () => {
  describe("throws AssemblyNoTokenError for missing tokens", () => {
    it("undefined", () => {
      expect(() =>
        parseToken({ apiKey: TEST_API_KEY, token: undefined })
      ).toThrow(AssemblyNoTokenError);
    });

    it("null", () => {
      expect(() => parseToken({ apiKey: TEST_API_KEY, token: null })).toThrow(
        AssemblyNoTokenError
      );
    });

    it("empty string", () => {
      expect(() => parseToken({ apiKey: TEST_API_KEY, token: "" })).toThrow(
        AssemblyNoTokenError
      );
    });
  });

  describe("throws AssemblyInvalidTokenError for invalid tokens", () => {
    it("non-string value", () => {
      expect(() => parseToken({ apiKey: TEST_API_KEY, token: 123 })).toThrow(
        AssemblyInvalidTokenError
      );
    });

    it("non-hex string", () => {
      expect(() =>
        parseToken({ apiKey: TEST_API_KEY, token: "not-a-valid-hex-token" })
      ).toThrow(AssemblyInvalidTokenError);
    });

    it("wrong API key", () => {
      expect(() =>
        parseToken({ apiKey: "wrong-api-key", token: CLIENT_TOKEN })
      ).toThrow(AssemblyInvalidTokenError);
    });

    it("preserves cause on decryption failure", () => {
      try {
        parseToken({ apiKey: TEST_API_KEY, token: "not-a-valid-hex-token" });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AssemblyInvalidTokenError);
        expect((error as AssemblyInvalidTokenError).cause).toBeDefined();
      }
    });
  });

  describe("decrypts valid tokens", () => {
    it("client token → { workspaceId, clientId, companyId }", () => {
      const payload = parseToken({ apiKey: TEST_API_KEY, token: CLIENT_TOKEN });
      expect(payload.workspaceId).toBe(TEST_WORKSPACE_ID);
      expect(payload.clientId).toBe(TEST_CLIENT_ID);
      expect(payload.companyId).toBe(TEST_COMPANY_ID);
      expect(payload.internalUserId).toBeUndefined();
    });

    it("internal user token → { workspaceId, internalUserId }", () => {
      const payload = parseToken({
        apiKey: TEST_API_KEY,
        token: INTERNAL_USER_TOKEN,
      });
      expect(payload.workspaceId).toBe(TEST_WORKSPACE_ID);
      expect(payload.internalUserId).toBe(TEST_INTERNAL_USER_ID);
      expect(payload.clientId).toBeUndefined();
      expect(payload.companyId).toBeUndefined();
    });

    it("token with tokenId → payload includes tokenId", () => {
      const payload = parseToken({
        apiKey: TEST_API_KEY,
        token: TOKEN_WITH_TOKEN_ID,
      });
      expect(payload.workspaceId).toBe(TEST_WORKSPACE_ID);
      expect(payload.clientId).toBe(TEST_CLIENT_ID);
      expect(payload.companyId).toBe(TEST_COMPANY_ID);
      expect(payload.tokenId).toBe(TEST_TOKEN_ID);
    });

    it("token with baseUrl → payload includes baseUrl", () => {
      const payload = parseToken({
        apiKey: TEST_API_KEY,
        token: TOKEN_WITH_BASE_URL,
      });
      expect(payload.workspaceId).toBe(TEST_WORKSPACE_ID);
      expect(payload.internalUserId).toBe(TEST_INTERNAL_USER_ID);
      expect(payload.baseUrl).toBe(TEST_BASE_URL);
    });

    it("block-aligned token decrypts correctly (Node 24 PKCS7 edge case)", () => {
      const payload = parseToken({
        apiKey: TEST_API_KEY,
        token: BLOCK_ALIGNED_TOKEN,
      });
      expect(payload.workspaceId).toBe(BLOCK_ALIGNED_WORKSPACE_ID);
      expect(payload.internalUserId).toBe(TEST_INTERNAL_USER_ID);
    });
  });
});

// ---------------------------------------------------------------------------
// createToken
// ---------------------------------------------------------------------------
describe("createToken", () => {
  it("round-trips a client payload through createToken → parseToken", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const token = createToken({ apiKey: TEST_API_KEY, payload });
    const parsed = parseToken({ apiKey: TEST_API_KEY, token });
    expect(parsed.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(parsed.clientId).toBe(TEST_CLIENT_ID);
    expect(parsed.companyId).toBe(TEST_COMPANY_ID);
  });

  it("round-trips an internal user payload", () => {
    const payload: TokenPayload = {
      internalUserId: TEST_INTERNAL_USER_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const token = createToken({ apiKey: TEST_API_KEY, payload });
    const parsed = parseToken({ apiKey: TEST_API_KEY, token });
    expect(parsed.workspaceId).toBe(TEST_WORKSPACE_ID);
    expect(parsed.internalUserId).toBe(TEST_INTERNAL_USER_ID);
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
    const parsed = parseToken({ apiKey: TEST_API_KEY, token });
    expect(parsed.tokenId).toBe(TEST_TOKEN_ID);
    expect(parsed.baseUrl).toBe(TEST_BASE_URL);
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
    expect(() =>
      createToken({ apiKey: TEST_API_KEY, payload: badPayload })
    ).toThrow(AssemblyInvalidTokenError);
  });
});

// ---------------------------------------------------------------------------
// buildCompoundKey
// ---------------------------------------------------------------------------
describe("buildCompoundKey", () => {
  it("without tokenId → workspaceId/apiKey", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(buildCompoundKey({ apiKey: TEST_API_KEY, payload })).toBe(
      `${TEST_WORKSPACE_ID}/${TEST_API_KEY}`
    );
  });

  it("with tokenId → workspaceId/apiKey/tokenId", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      tokenId: TEST_TOKEN_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(buildCompoundKey({ apiKey: TEST_API_KEY, payload })).toBe(
      `${TEST_WORKSPACE_ID}/${TEST_API_KEY}/${TEST_TOKEN_ID}`
    );
  });
});

// ---------------------------------------------------------------------------
// Type predicates
// ---------------------------------------------------------------------------
describe("isClientToken", () => {
  it("returns true for client payload", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(isClientToken(payload)).toBe(true);
  });

  it("returns false for internal user payload", () => {
    const payload: TokenPayload = {
      internalUserId: TEST_INTERNAL_USER_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(isClientToken(payload)).toBe(false);
  });
});

describe("isInternalUserToken", () => {
  it("returns true for internal user payload", () => {
    const payload: TokenPayload = {
      internalUserId: TEST_INTERNAL_USER_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(isInternalUserToken(payload)).toBe(true);
  });

  it("returns false for client payload", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(isInternalUserToken(payload)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Guard functions
// ---------------------------------------------------------------------------
describe("ensureIsClient", () => {
  it("returns narrowed type for client payload", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const narrowed = ensureIsClient(payload);
    expect(narrowed.clientId).toBe(TEST_CLIENT_ID);
    expect(narrowed.companyId).toBe(TEST_COMPANY_ID);
  });

  it("throws AssemblyUnauthorizedError for internal user payload", () => {
    const payload: TokenPayload = {
      internalUserId: TEST_INTERNAL_USER_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(() => ensureIsClient(payload)).toThrow(AssemblyUnauthorizedError);
  });
});

describe("ensureIsInternalUser", () => {
  it("returns narrowed type for internal user payload", () => {
    const payload: TokenPayload = {
      internalUserId: TEST_INTERNAL_USER_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    const narrowed = ensureIsInternalUser(payload);
    expect(narrowed.internalUserId).toBe(TEST_INTERNAL_USER_ID);
  });

  it("throws AssemblyUnauthorizedError for client payload", () => {
    const payload: TokenPayload = {
      clientId: TEST_CLIENT_ID,
      companyId: TEST_COMPANY_ID,
      workspaceId: TEST_WORKSPACE_ID,
    };
    expect(() => ensureIsInternalUser(payload)).toThrow(
      AssemblyUnauthorizedError
    );
  });
});
