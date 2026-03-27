import { BaseResource } from "src/client/base-resource";
import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";

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
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<Form[]> {
    return paginate((listArgs) => this.list({ ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
