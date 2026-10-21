import type { Institution, Transaction } from "@app/bank-statement/types";

export type InstitutionInfo = Omit<Institution, "bankName">;

/**
 * Resolves the display bank name for an institution, supporting both
 * the current `bankName` field and legacy `id` format (e.g. "HSBC_001").
 * Defensively handles missing or undefined values without throwing.
 */
export function resolveBankName(
  institution?: Partial<Institution> & { id?: string } | null,
): string {
  if (!institution) return "Unknown";
  if (institution.bankName) {
    return institution.bankName;
  }
  if (typeof institution.id === "string" && institution.id.length > 0) {
    return institution.id.split("_")[0] || "Unknown";
  }
  return "Unknown";
}

export function getInstitutions(
  transactions: Transaction[],
): (readonly [string, InstitutionInfo[]])[] {
  const institutions = transactions.reduce<Record<string, InstitutionInfo[]>>(
    (institutions, transaction) => {
      const { institution } = transaction;
      const bankName = resolveBankName(institution);
      if (!institutions[bankName]) {
        institutions[bankName] = [];
      }

      const existingInstitutionAccount = institutions[bankName].find((
        institutionInfo,
      ) =>
        institutionInfo.softCode === institution.softCode &&
        institutionInfo.accountNumber === institution.accountNumber &&
        institutionInfo.accountType === institution.accountType
      );
      if (existingInstitutionAccount) return institutions;
      institutions[bankName].push({
        softCode: institution.softCode,
        accountNumber: institution.accountNumber,
        accountType: institution.accountType,
      });

      return institutions;
    },
    {},
  );

  return Object.entries(institutions).map(([bankName, accounts]) => {
    return [
      bankName,
      accounts.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
    ] as const;
  }).toSorted(([a], [b]) => a.localeCompare(b));
}
