import { describe, it, expect } from "vitest";
import { getInstitutions, resolveBankName } from "./transaction.ts";
import type { Transaction } from "@app/bank-statement/types";

describe("transaction utilities", () => {
  it("resolveBankName extracts bankName correctly and safely", () => {
    // Current format with bankName
    expect(
      resolveBankName({
        bankName: "Chase",
        accountNumber: "1234",
        accountType: "Current",
      }),
    ).toBe("Chase");

    // Legacy format with id containing prefix
    expect(
      resolveBankName({
        id: "HSBC_001",
        accountNumber: "5678",
        accountType: "Current",
      } as unknown as { bankName: string }),
    ).toBe("HSBC");

    // Legacy format with plain id
    expect(
      resolveBankName({
        id: "Barclays",
        accountNumber: "9012",
        accountType: "Credit",
      } as unknown as { bankName: string }),
    ).toBe("Barclays");

    // Defensive against missing, undefined, or empty fields
    expect(resolveBankName({} as unknown as { bankName: string })).toBe("Unknown");
    expect(resolveBankName(undefined)).toBe("Unknown");
    expect(resolveBankName(null)).toBe("Unknown");
  });

  it("getInstitutions sorts accounts by accountNumber", () => {
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

    expect(result.length).toBe(1);
    expect(result.find(([id]) => id === "inst1")).toBeDefined();
    const [, accounts] = result.find(([id]) => id === "inst1")!;
    expect(accounts.length).toBe(3);
    expect(accounts[0].accountNumber).toBe("ACC-001");
    expect(accounts[1].accountNumber).toBe("ACC-002");
    expect(accounts[2].accountNumber).toBe("ACC-003");
  });

  it("getInstitutions gracefully handles legacy and edge-case institution payloads without split TypeError", () => {
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

    expect(result.length).toBe(3);
    const institutionNames = result.map(([name]) => name);
    expect(institutionNames).toEqual(["AMEX", "Barclays", "Unknown"]);
  });
});
