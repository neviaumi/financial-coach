import { describe, it, expect, vi } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { getStableStatementStartDate } from "./date.ts";

describe("date utilities", () => {
  [
    ["2024-01-15", "2028-10-01", "2023-12-01"],
    ["2024-02-14", "2024-02-05", "2024-01-01"],
    ["2024-02-15", "2024-02-05", "2024-01-01"],
    ["2024-02-07", "2024-01-15", "2024-01-01"],
    ["2024-02-08", "2024-01-15", "2024-01-01"],
    ["2024-02-15", "2024-01-15", "2024-01-01"],
    ["2024-02-15", "2023-12-15", "2023-12-01"],
  ].forEach(([today, input, targetStartDate]) => {
    it(`getStableStatementStartDate today=${today} input=${input}`, () => {
      const timeSpy = vi
        .spyOn(Temporal.Now, "plainDateISO")
        .mockReturnValue(Temporal.PlainDate.from(today));
      try {
        const inputDate = Temporal.PlainDate.from(input);
        const startDate = getStableStatementStartDate(inputDate);
        expect(startDate.toString()).toBe(targetStartDate);
      } finally {
        timeSpy.mockRestore();
      }
    });
  });
});
