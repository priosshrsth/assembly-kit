import { paginate } from "src/lib/pagination";
import type { ListArgs } from "src/lib/pagination";
import { buildSearchParams } from "src/transport/build-search-params";
import type { Transport } from "src/transport/http";
import { parseResponse } from "src/transport/parse-response";

import { FormDataResponseSchema, FormsDataResponseSchema } from "./schema";
import type { Form, FormsDataResponse } from "./schema";

export class FormsResource {
  readonly #transport: Transport;
  readonly #validate: boolean;

  constructor({
    transport,
    validateResponses,
  }: {
    transport: Transport;
    validateResponses: boolean;
  }) {
    this.#transport = transport;
    this.#validate = validateResponses;
  }

  /** List forms. */
  async list(args: ListArgs = {}): Promise<FormsDataResponse> {
    const raw: unknown = await this.#transport.get("v1/forms", {
      searchParams: buildSearchParams(args),
    });
    return parseResponse({ schema: FormsDataResponseSchema, data: raw, validate: this.#validate });
  }

  /** Retrieve a single form by ID. */
  async retrieve(id: string): Promise<Form> {
    const raw: unknown = await this.#transport.get(`v1/forms/${id}`);
    return parseResponse({ schema: FormDataResponseSchema, data: raw, validate: this.#validate });
  }

  /** Iterate over all forms, automatically paginating. Default limit per page: 500. */
  async listAll(args: Omit<ListArgs, "nextToken"> = {}): Promise<Form[]> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
