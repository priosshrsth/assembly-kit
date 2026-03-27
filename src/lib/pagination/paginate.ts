export interface ListArgs {
  limit?: number;
  nextToken?: string;
}

export interface PaginatedResponse<T> {
  data: T[] | null;
  nextToken?: string;
}

/**
 * Collects all items from a cursor-paginated endpoint into a single array.
 * Calls `fn` repeatedly, following `nextToken` until exhausted.
 */
export async function paginate<T>(
  fn: (args: ListArgs) => Promise<PaginatedResponse<T>>,
  initialArgs: ListArgs = {},
): Promise<T[]> {
  const results: T[] = [];
  let args: ListArgs = initialArgs;

  let hasMore: boolean = true;

  while (hasMore) {
    const { data, nextToken } = await fn(args);

    if (data && data.length > 0) {
      results.push(...data);
    }

    if (nextToken) {
      args = { ...initialArgs, nextToken };
    } else {
      hasMore = false;
    }
  }

  return results;
}
