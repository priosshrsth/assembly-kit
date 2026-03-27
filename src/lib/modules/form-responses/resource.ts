import { BaseResource } from "src/client/base-resource";

import { FormResponseItemResponseSchema, FormResponsesResponseSchema } from "./schema";
import type { FormResponse, FormResponseCreateRequest, FormResponsesResponse } from "./schema";

export class FormResponsesResource extends BaseResource {
  /** Request a form response (send form to a client). */
  async create(body: FormResponseCreateRequest): Promise<FormResponse> {
    const raw = await this.sdk.requestFormResponse({
      requestBody: body as never,
    });
    return this.parse(FormResponseItemResponseSchema, raw);
  }

  /** List form responses. */
  async list(args: { formId?: string; clientId?: string } = {}): Promise<FormResponsesResponse> {
    const raw = await this.sdk.listFormResponses({ id: args.formId } as never);
    return this.parse(FormResponsesResponseSchema, raw);
  }
}
