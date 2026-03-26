import type { z } from "zod";

import { parseResponse } from "./parse-response";
import type { AssemblyClient } from "./wrap-sdk";

export abstract class BaseResource {
  protected readonly sdk: AssemblyClient;
  protected readonly validateResponses: boolean;

  constructor(sdk: AssemblyClient, validateResponses: boolean) {
    this.sdk = sdk;
    this.validateResponses = validateResponses;
  }

  /** Parse and validate data against a Zod schema when validation is enabled. */
  protected parse<T>(schema: z.ZodType<T>, data: unknown): T {
    if (!this.validateResponses) {
      return data as T;
    }
    return parseResponse(schema, data);
  }
}
