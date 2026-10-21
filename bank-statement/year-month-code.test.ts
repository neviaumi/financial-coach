import { describe, it, expect } from "vitest";
import { dateFromYearMonthCode, InvalidYearMonthCodeError } from "./year-month-code.ts";

describe("year-month-code", () => {
  [["2025-01", "2025-01-01"]].forEach(([input, output]) => {
    it(`Date from year month code - ${input}`, () => {
      const date = dateFromYearMonthCode(input);
      expect(date.toString()).toBe(output);
    });
  });

  ["foo-bar", "2025M01"].forEach((input) => {
    it(`Error: Date from year month code - ${input}`, () => {
      expect(() => dateFromYearMonthCode(input)).toThrow(InvalidYearMonthCodeError);
    });
  });
});
