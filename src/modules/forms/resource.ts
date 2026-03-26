import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import { FormDataResponseSchema, FormsDataResponseSchema } from "./schema";
import type { Form, FormsDataResponse } from "./schema";

export class FormsResource extends BaseResource {
  /** List forms. */
  async list(args: ListArgs = {}): Promise<FormsDataResponse> {
    const raw = await this.sdk.listForms(args);
    return this.parse(FormsDataResponseSchema, raw);
  }

  /** Retrieve a single form by ID. */
  async retrieve(id: string): Promise<Form> {
    const raw = await this.sdk.retrieveForm({ id });
    return this.parse(FormDataResponseSchema, raw);
  }

  /** Iterate over all forms, automatically paginating. Default limit per page: 500. */
  listAll(args: Omit<ListArgs, "nextToken"> = {}): AsyncGenerator<Form> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
