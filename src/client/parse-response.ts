import { AssemblyResponseParseError } from "src/errors/response-parse";
import type { z } from "zod";

/**
 * Validates `data` against a Zod schema.
 * Throws `AssemblyResponseParseError` on validation failure.
 */
export const parseResponse = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AssemblyResponseParseError({
      cause: result.error,
      details: data,
    });
  }
  return result.data;
};
