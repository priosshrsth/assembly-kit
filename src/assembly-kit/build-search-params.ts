/**
 * Builds a search params record from an optional args object,
 * filtering out `undefined` and `null` values.
 */
export const buildSearchParams = (
  args?: Record<string, string | number | boolean | undefined | null>
): Record<string, string | number | boolean> => {
  if (!args) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined && value !== null) {
      params[key] = value;
    }
  }
  return params;
};
