import { AssemblyMissingApiKeyError } from "src/errors/missing-api-key";
import { AssemblyNoTokenError } from "src/errors/no-token";
import { createTransport } from "src/transport/http";
import { SDK_VERSION } from "src/version";

import { AssemblyKitClient } from "./assembly-kit-client";
import type { ClientOptions } from "./options";

/**
 * Creates an Assembly SDK client. Each call produces an independent instance
 * with its own HTTP transport and rate limiter (safe for serverless).
 */
export const createAssemblyKit = (
  options: ClientOptions
): AssemblyKitClient => {
  if (!options.workspaceId) {
    throw new AssemblyMissingApiKeyError({
      message: "workspaceId is required",
    });
  }

  if (!options.apiKey) {
    throw new AssemblyMissingApiKeyError();
  }

  if (options.isMarketplaceApp && !options.token) {
    throw new AssemblyNoTokenError({
      message: "A token is required for marketplace app.",
    });
  }

  const compoundKey =
    options.tokenId && !process.env.SKIP_TOKEN_ID
      ? `${options.workspaceId}/${options.apiKey}/${options.tokenId}`
      : `${options.workspaceId}/${options.apiKey}`;

  const transport = createTransport({
    baseUrl: options.baseUrl,
    compoundKey,
    fetch: options.fetch,
    requestsPerSecond: options.requestsPerSecond,
    retryCount: options.retryCount,
    sdkVersion: SDK_VERSION,
  });

  return new AssemblyKitClient({
    token: options.token,
    transport,
    validateResponses: options.validateResponses ?? true,
  });
};
