import { assertEquals, assertExists } from "@std/assert";
import { getInstitutions, resolveBankName } from "./transaction.ts";
import type { Transaction } from "@app/bank-statement/types";

Deno.test("resolveBankName extracts bankName correctly and safely", () => {
  // Current format with bankName
  assertEquals(
    resolveBankName({
      bankName: "Chase",
      accountNumber: "1234",
      accountType: "Current",
    }),
    "Chase",
  );

  // Legacy format with id containing prefix
  assertEquals(
    resolveBankName({
      id: "HSBC_001",
      accountNumber: "5678",
      accountType: "Current",
    } as unknown as { bankName: string }),
    "HSBC",
  );

  // Legacy format with plain id
  assertEquals(
    resolveBankName({
      id: "Barclays",
      accountNumber: "9012",
      accountType: "Credit",
    } as unknown as { bankName: string }),
    "Barclays",
  );

  // Defensive against missing, undefined, or empty fields
  assertEquals(
    resolveBankName({} as unknown as { bankName: string }),
    "Unknown",
  );
  assertEquals(resolveBankName(undefined), "Unknown");
  assertEquals(resolveBankName(null), "Unknown");
});

Deno.test("getInstitutions sorts accounts by accountNumber", () => {
  const transactions: Transaction[] = [
    {
      institution: {
        bankName: "inst1",
        accountNumber: "ACC-002",
        accountType: "Checking",
      },
      bookingDate: "2023-01-01",
      bookingDateTime: "2023-01-01T10:00:00Z",
      transactionAmount: { amount: "100", currency: "USD" },
      internalTransactionId: "1",
      remittanceInformationUnstructured: "test1",
      source: "inst1/2023-01.pdf",
    },
    {
      institution: {
        bankName: "inst1",
        accountNumber: "ACC-001",
        accountType: "Savings",
      },
      bookingDate: "2023-01-02",
      bookingDateTime: "2023-01-02T10:00:00Z",
      transactionAmount: { amount: "200", currency: "USD" },
      internalTransactionId: "2",
      remittanceInformationUnstructured: "test2",
      source: "inst1/2023-01.pdf",
    },
    {
      institution: {
        bankName: "inst1",
        accountNumber: "ACC-003",
        accountType: "Credit",
      },
      bookingDate: "2023-01-03",
      bookingDateTime: "2023-01-03T10:00:00Z",
      transactionAmount: { amount: "300", currency: "USD" },
      internalTransactionId: "3",
      remittanceInformationUnstructured: "test3",
      source: "inst1/2023-01.pdf",
    },
  ];

  const result = getInstitutions(transactions);

  assertEquals(result.length, 1);
  assertExists(result.find(([id]) => id === "inst1"));
  const [, accounts] = result.find(([id]) => id === "inst1")!;
  assertEquals(accounts.length, 3);
  assertEquals(accounts[0].accountNumber, "ACC-001");
  assertEquals(accounts[1].accountNumber, "ACC-002");
  assertEquals(accounts[2].accountNumber, "ACC-003");
});

Deno.test("getInstitutions gracefully handles legacy and edge-case institution payloads without split TypeError", () => {
  const transactionsWithLegacyAndMissingId = [
    // Legacy payload where institution had 'id' instead of 'bankName'
    {
      institution: {
        id: "Barclays_Main",
        accountNumber: "1111",
        accountType: "Current",
      },
      bookingDate: "2026-09-01",
      bookingDateTime: "2026-09-01T10:00:00Z",
      transactionAmount: { amount: "-50", currency: "GBP" },
      internalTransactionId: "t1",
      remittanceInformationUnstructured: "Rent",
      source: "Barclays/Barclays.pdf",
    },
    // Modern payload where institution has 'bankName' and NO 'id'
    {
      institution: {
        bankName: "AMEX",
        accountNumber: "2222",
        accountType: "Credit",
      },
      bookingDate: "2026-09-02",
      bookingDateTime: "2026-09-02T10:00:00Z",
      transactionAmount: { amount: "-25", currency: "GBP" },
      internalTransactionId: "t2",
      remittanceInformationUnstructured: "Supermarket",
      source: "AMEX/AMEX.pdf",
    },
    // Edge case: empty institution object (must not throw TypeError: can't access property split, a.id is undefined)
    {
      institution: {
        accountNumber: "3333",
        accountType: "Savings",
      },
      bookingDate: "2026-09-03",
      bookingDateTime: "2026-09-03T10:00:00Z",
      transactionAmount: { amount: "100", currency: "GBP" },
      internalTransactionId: "t3",
      remittanceInformationUnstructured: "Transfer",
      source: "Manual",
    },
  ] as unknown as Transaction[];

  // This execution must not throw
  const result = getInstitutions(transactionsWithLegacyAndMissingId);

  assertEquals(result.length, 3);
  const institutionNames = result.map(([name]) => name);
  assertEquals(institutionNames, ["AMEX", "Barclays", "Unknown"]);
});
