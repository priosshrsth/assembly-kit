export interface ListArgs {
  limit?: number;
  nextToken?: string;
}

export interface PaginatedResponse<T> {
  data: T[] | null;
  nextToken?: string;
}

/**
 * Async generator that abstracts cursor-based pagination.
 * Calls `fn` repeatedly, yielding each item from `data`,
 * and follows `nextToken` until exhausted.
 *
 * @yields Each item from the paginated response data arrays.
 */
// Generator functions cannot use arrow syntax; named expression satisfies func-style.
export const paginate = async function* paginate<T>(
  fn: (args: ListArgs) => Promise<PaginatedResponse<T>>,
  initialArgs: ListArgs = {},
): AsyncGenerator<T> {
  let args: ListArgs = initialArgs;

  for (;;) {
    const { data, nextToken } = await fn(args);

    if (!data || data.length === 0) {
      return;
    }

    yield* data;

    if (!nextToken) {
      return;
    }

    args = { ...initialArgs, nextToken };
  }
};
