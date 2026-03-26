import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import {
  InternalUserResponseSchema,
  InternalUsersResponseSchema,
} from "./schema";
import type { InternalUser, InternalUsersResponse } from "./schema";

export class InternalUsersResource extends BaseResource {
  /** List internal users. */
  async list(args: ListArgs = {}): Promise<InternalUsersResponse> {
    const raw = await this.sdk.listInternalUsers(args);
    return this.parse(InternalUsersResponseSchema, raw);
  }

  /** Retrieve a single internal user by ID. */
  async retrieve(id: string): Promise<InternalUser> {
    const raw = await this.sdk.retrieveInternalUser({ id });
    return this.parse(InternalUserResponseSchema, raw);
  }

  /** Iterate over all internal users, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListArgs, "nextToken"> = {}
  ): AsyncGenerator<InternalUser> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
