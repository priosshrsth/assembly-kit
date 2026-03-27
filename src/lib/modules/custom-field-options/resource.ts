import { BaseResource } from "src/client/base-resource";

import { ListCustomFieldOptionResponseSchema } from "./schema";
import type { ListCustomFieldOptionResponse } from "./schema";

export class CustomFieldOptionsResource extends BaseResource {
  /** List options for a multi-select custom field. */
  async list(args: { id: string; label?: string }): Promise<ListCustomFieldOptionResponse> {
    const raw = await this.sdk.listCustomFieldOptions(args);
    return this.parse(ListCustomFieldOptionResponseSchema, raw);
  }
}
