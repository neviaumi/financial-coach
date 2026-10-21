import type { Context } from "hono";
import { factory } from "../app-factory.ts";
import { getMonthlyStatement } from "@app/bank-statement";
import { toYearMonthCode } from "@app/bank-statement/year-month-code";
import type { Transaction } from "@app/bank-statement/types";

function extractYearMonthCodeFromPathParams(param: string | undefined) {
  if (!param) {
    throw new Error("Missing yearMonthCode parameter");
  }
  return toYearMonthCode(param.split(".")[0]);
}

function escapeCsvField(val: unknown): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

function transactionsToCsv(transactions: Transaction[]): string {
  const headers = [
    "from.Bank",
    "from.AccountNumber",
    "from.AccountType",
    "source",
    "merchantCategoryCode",
    "to",
    "additionalInformation",
    "proprietaryBankTransactionCode",
    "bookingDate",
    "transaction.amount",
    "transaction.currency",
    "transaction.id",
  ];
  const rows = transactions.map((t) => [
    t.institution?.bankName ?? "",
    t.institution?.accountNumber ?? "",
    t.institution?.accountType ?? "",
    t.source ?? "",
    t.merchantCategoryCode ?? "",
    t.to ?? "",
    t.remittanceInformationUnstructured ?? "",
    "",
    t.bookingDate ?? "",
    t.transactionAmount?.amount ?? "",
    t.transactionAmount?.currency ?? "",
    t.internalTransactionId ?? "",
  ]);
  const bom = "\uFEFF";
  const headerLine = headers.map(escapeCsvField).join(",");
  const rowLines = rows.map((row) => row.map(escapeCsvField).join(",")).join("\n");
  return `${bom}${headerLine}\n${rowLines}\n`;
}

const app = factory.createApp();
app
  .get("/:yearMonthCode{.+\\.json}", (c: Context) => {
    try {
      const yearMonthCode = extractYearMonthCodeFromPathParams(c.req.param("yearMonthCode"));
      return getMonthlyStatement(yearMonthCode)
        .then((content) => c.json(content))
        .catch((error) => {
          console.error(`Error fetching statement for ${yearMonthCode}:`, error);
          return c.json({ error: "Statement not found or an error occurred." }, 404);
        });
    } catch (error) {
      return c.json({ error: String(error) }, 400);
    }
  })
  .get("/:yearMonthCode{.+\\.csv}", async (c: Context) => {
    try {
      const yearMonthCode = extractYearMonthCodeFromPathParams(c.req.param("yearMonthCode"));
      const responseBody = await getMonthlyStatement(yearMonthCode).then((statement) =>
        transactionsToCsv(statement.transactions),
      );
      return c.body(responseBody, 200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${yearMonthCode}.csv"`,
      });
    } catch (error) {
      return c.json({ error: String(error) }, 400);
    }
  })
  .get("/:yearMonthCode{.+\\.html}", (c: Context) => {
    return c.text("Not Implemented", 501);
  });

export default app;
