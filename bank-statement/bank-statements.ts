import type { Statement, Transaction } from "./types.ts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { filePathRelativeToCacheDir } from "@app/lib/workspace";
import type { YearMonthCode } from "./year-month-code.ts";

type BaseStatement = Omit<Statement, "period" | "balance">;

export function withPeriod(
  statement: BaseStatement,
  period: Statement["period"],
): BaseStatement & { period: Statement["period"] } {
  return Object.assign(statement, {
    period,
  });
}

export function withBalance(
  statement: BaseStatement,
  balance: Statement["balance"],
): BaseStatement & { balance: Statement["balance"] } {
  return Object.assign(statement, {
    balance,
  });
}

export function asStatement(statement: BaseStatement): Statement {
  return statement as Statement;
}

export function fromTransactions(
  transactions: Transaction[],
): Omit<Statement, "period" | "balance"> {
  const transactionsSorted = transactions
    .map((transaction) => {
      const to = (() => {
        if (transaction.remittanceInformationUnstructured) {
          return transaction.remittanceInformationUnstructured;
        }
        return transaction.creditorName;
      })();
      return Object.assign(transaction, {
        to: to!,
      });
    })
    .toSorted(
      (a, b) =>
        new Date(a.valueDateTime ?? a.bookingDateTime).getTime() -
        new Date(b.valueDateTime ?? b.bookingDateTime).getTime(),
    );
  return {
    transactions: transactionsSorted,
  };
}

export async function saveTransactionsAsMonthlyStatement(
  yearMonthCode: YearMonthCode,
  statement: Statement,
) {
  const dir = filePathRelativeToCacheDir("statements/Consolidated");
  await mkdir(dir, { recursive: true });
  const filePath = filePathRelativeToCacheDir(`statements/Consolidated/${yearMonthCode}.json`);
  await writeFile(filePath, JSON.stringify(statement, null, 4), "utf-8");
}

export async function getMonthlyStatement(yearMonthCode: YearMonthCode): Promise<Statement> {
  const filePath = filePathRelativeToCacheDir(`statements/Consolidated/${yearMonthCode}.json`);
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as Statement;
}
