export type Amount = {
  amount: string;
  currency: string;
};

export type Balance = {
  balanceAmount: Amount;
  balanceType: string;
  referenceDate: string;
};

export type Institution = {
  id: string;
  accountNumber: string;
  accountType: string;
  softCode?: string;
};

export type Transaction = {
  bookingDate: string;
  valueDate?: string;
  bookingDateTime: string;
  valueDateTime?: string;
  transactionAmount: Amount;
  creditorName?: string;
  remittanceInformationUnstructured: string;
  merchantCategoryCode?: string;
  internalTransactionId: string;
  institution: Institution;
  to?: string;
};

export type ReviewComment = {
  plain: string;
  html: string;
};

export type Statement = {
  period: {
    start: string;
    end: string;
  };
  balance: {
    referenceDate: string;
    amount: Amount;
  };
  aiReview?: {
    insightSummary: ReviewComment;
    actionPlan: Array<ReviewComment>;
    analysisRationale: Array<ReviewComment>;
  };
  transactions: Array<Transaction & { to: string }>;
};
