import { describe, expect, it } from "vite-plus/test";

import { paginate } from "src/lib/pagination/paginate";
import type { ListArgs, PaginatedResponse } from "src/lib/pagination/paginate";

const collect = async <T>(gen: AsyncGenerator<T>): Promise<T[]> => {
  const items: T[] = [];
  for await (const item of gen) {
    items.push(item);
  }
  return items;
};

/** Creates a paginate-compatible fn from an ordered list of responses. */
const createPagedFn = <T>(
  responses: PaginatedResponse<T>[],
): {
  fn: (args: ListArgs) => Promise<PaginatedResponse<T>>;
  getCallCount: () => number;
} => {
  let callCount = 0;
  const fn = (_args: ListArgs): Promise<PaginatedResponse<T>> => {
    const index = callCount;
    callCount += 1;
    return Promise.resolve(responses[index] as PaginatedResponse<T>);
  };
  return { fn, getCallCount: () => callCount };
};

describe("paginate", () => {
  it("yields all items from a single page (no nextToken)", async () => {
    const { fn } = createPagedFn([{ data: [1, 2, 3] }]);
    const result = await collect(paginate(fn));
    expect(result).toEqual([1, 2, 3]);
  });

  it("follows nextToken across multiple pages", async () => {
    const { fn, getCallCount } = createPagedFn([
      { data: ["a", "b"], nextToken: "page2" },
      { data: ["c", "d"], nextToken: "page3" },
      { data: ["e"] },
    ]);

    const result = await collect(paginate(fn));
    expect(result).toEqual(["a", "b", "c", "d", "e"]);
    expect(getCallCount()).toBe(3);
  });

  it("yields nothing for an empty first page", async () => {
    const { fn } = createPagedFn<number>([{ data: [] }]);
    const result = await collect(paginate(fn));
    expect(result).toEqual([]);
  });

  it("yields nothing and does not throw when data is null", async () => {
    const { fn } = createPagedFn<number>([{ data: null }]);
    const result = await collect(paginate(fn));
    expect(result).toEqual([]);
  });

  it("passes initialArgs to the first call and preserves them across pages", async () => {
    const receivedLimits: (number | undefined)[] = [];
    const receivedTokens: (string | undefined)[] = [];

    const responses: PaginatedResponse<number>[] = [{ data: [1], nextToken: "tok" }, { data: [2] }];

    let callCount = 0;
    const fn = (args: ListArgs): Promise<PaginatedResponse<number>> => {
      receivedLimits.push(args.limit);
      receivedTokens.push(args.nextToken);
      const index = callCount;
      callCount += 1;
      return Promise.resolve(responses[index] as PaginatedResponse<number>);
    };

    await collect(paginate(fn, { limit: 5 }));

    expect(receivedLimits).toEqual([5, 5]);
    expect(receivedTokens).toEqual([undefined, "tok"]);
  });
});
