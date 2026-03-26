import { BaseResource } from "src/assembly-kit/base-resource";
import { paginate } from "src/pagination";
import type { ListArgs } from "src/pagination";

import { PaymentsResponseSchema } from "./schema";
import type { Payment, PaymentsResponse } from "./schema";

export interface ListPaymentsArgs extends ListArgs {
  clientId?: string;
  invoiceId?: string;
}

export class PaymentsResource extends BaseResource {
  /** List payments with optional filters. */
  async list(args: ListPaymentsArgs = {}): Promise<PaymentsResponse> {
    const raw = await this.sdk.listPayments(args as never);
    return this.parse(PaymentsResponseSchema, raw);
  }

  /** Iterate over all payments, automatically paginating. Default limit per page: 500. */
  listAll(
    args: Omit<ListPaymentsArgs, "nextToken"> = {}
  ): AsyncGenerator<Payment> {
    return paginate((listArgs) => this.list({ ...args, ...listArgs }), {
      limit: args.limit ?? 500,
    });
  }
}
