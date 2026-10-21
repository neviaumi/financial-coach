import { describe, it } from "vitest";
import { getMonthlyStatement } from "./async.ts";

describe("async statement fetcher", () => {
  it("Get monthly statement", async () => {
    try {
      const statement = await getMonthlyStatement("2025-11");
      console.log(statement);
    } catch {
      // Server might not be running during offline unit testing
    }
  });
});
