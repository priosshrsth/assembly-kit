/**
 * Builds a search params record from an optional args object,
 * filtering out `undefined` and `null` values and keeping only
 * string, number, and boolean values.
 */
// eslint-disable-next-line typescript/no-explicit-any -- accepts any args object
export const buildSearchParams = (args?: any): Record<string, string | number | boolean> => {
  if (!args) return {};

  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(args)) {
    if (
      value !== undefined &&
      value !== null &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    ) {
      params[key] = value;
    }
  }
  return params;
};
