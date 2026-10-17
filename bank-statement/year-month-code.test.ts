import {
  dateFromYearMonthCode,
  InvalidYearMonthCodeError,
} from "./year-month-code.ts";
import { assertEquals, assertThrows } from "@std/assert";

[["2025-01", "2025-01-01"]].forEach(([input, output]) => {
  Deno.test(`Date from year month code - ${input}`, () => {
    const date = dateFromYearMonthCode(input);
    assertEquals(date.toString(), output);
  });
});

["foo-bar", "2025M01"].forEach((input) => {
  Deno.test(`Error: Date from year month code - ${input}`, () => {
    assertThrows(
      () => dateFromYearMonthCode(input),
      InvalidYearMonthCodeError,
      "Invalid YearMonthCode",
    );
  });
});
