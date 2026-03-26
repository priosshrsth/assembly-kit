import { BaseResource } from "src/assembly-kit/base-resource";

import { ListCustomFieldResponseSchema } from "./schema";
import type { ListCustomFieldResponse } from "./schema";

export class CustomFieldsResource extends BaseResource {
  /** List custom fields with optional entity type filter. */
  async list(
    args: { entityType?: string } = {}
  ): Promise<ListCustomFieldResponse> {
    const raw = await this.sdk.listCustomFields(args);
    return this.parse(ListCustomFieldResponseSchema, raw);
  }
}
