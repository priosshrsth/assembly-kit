import { describe, expect, it } from "bun:test";

import { BASE_URL, callAt, createTestClient } from "./_helpers";

const CUSTOM_FIELD_OPTION_FIXTURE = {
  id: "cfo-1",
  key: "option-a",
  label: "Option A",
  object: "customFieldOption" as const,
};

describe("CustomFieldOptionsResource", () => {
  it("list() sends GET to v1/custom-field-options", async () => {
    const body = { data: [CUSTOM_FIELD_OPTION_FIXTURE] };
    const { client, calls } = createTestClient([{ body, status: 200 }]);

    const result = await client.customFieldOptions.list();
    expect(result.data).toHaveLength(1);

    const call = callAt(calls);
    expect(call.method).toBe("GET");
    expect(call.url).toBe(`${BASE_URL}/v1/custom-field-options`);
  });
});
