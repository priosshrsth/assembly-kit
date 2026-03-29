import { AssemblyResponseParseError } from "src/errors/response-parse";
import type { z } from "zod";

/**
 * Optionally validates `data` against a Zod schema.
 * When `validate` is false, returns `data` as-is (cast to `T`).
 * When `validate` is true and parsing fails, throws `AssemblyResponseParseError`.
 */
export const parseResponse = <T>({
  schema,
  data,
  validate,
}: {
  schema: z.ZodType<T>;
  data: unknown;
  validate: boolean;
}): T => {
  if (!validate) return data as T;

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AssemblyResponseParseError({ cause: result.error });
  }
  return result.data;
};
