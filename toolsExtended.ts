/**
 * Extended calculations for 8 Everyday Utilities in CalcAI Pro:
 * - Khata / Ledger Book
 * - Loan / EMI & Zakat Calculator
 * - Student Marks & GPA Calculator
 * - Bill Splitter & Tip
 */

// 1. KHATA / LEDGER
export interface KhataTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'give' | 'got'; // 'give' = credit/udhar diya (+), 'got' = debit/wasool hua (-)
  amount: number;
  note: string;
  date: number;
}

export interface KhataCustomer {
  id: string;
  name: string;
  phone?: string;
  totalGiven: number; // You gave
  totalReceived: number; // You got
  netBalance: number; // Positive = customer owes you, Negative = you owe customer
}

export function computeCustomerKhata(
  transactions: KhataTransaction[]
): Record<string, { totalGiven: number; totalReceived: number; netBalance: number }> {
  const result: Record<string, { totalGiven: number; totalReceived: number; netBalance: number }> = {};

  for (const tx of transactions) {
    if (!result[tx.customerId]) {
      result[tx.customerId] = { totalGiven: 0, totalReceived: 0, netBalance: 0 };
    }
    if (tx.type === 'give') {
      result[tx.customerId].totalGiven += tx.amount;
      result[tx.customerId].netBalance += tx.amount;
    } else {
      result[tx.customerId].totalReceived += tx.amount;
      result[tx.customerId].netBalance -= tx.amount;
    }
  }

  return result;
}

// 2. LOAN / EMI CALCULATOR
export interface LoanInput {
  principal: number;
  annualInterestRate: number; // e.g. 12%
  tenureMonths: number; // e.g. 24 months
}

export interface LoanResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
}

export function calculateLoanEmi(input: LoanInput): LoanResult {
  const P = Math.max(0, input.principal);
  const annualRate = Math.max(0, input.annualInterestRate);
  const N = Math.max(1, input.tenureMonths);

  if (annualRate === 0) {
    const monthlyEmi = P / N;
    return {
      monthlyEmi: Number(monthlyEmi.toFixed(2)),
      totalInterest: 0,
      totalPayment: P,
      principal: P,
    };
  }

  const r = annualRate / (12 * 100); // monthly interest rate
  const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
  const totalPayment = emi * N;
  const totalInterest = totalPayment - P;

  return {
    monthlyEmi: Number(emi.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
    principal: P,
  };
}

// ISLAMIC ZAKAT CALCULATOR (2.5%)
export interface ZakatInput {
  cashInHandBank: number;
  goldValue: number;
  silverValue: number;
  businessInventory: number;
  debtsLiabilities: number;
  silverNisabThreshold?: number; // e.g. equivalent of 52.5 tolas (~612 grams) of silver
}

export interface ZakatResult {
  totalAssets: number;
  netZakatableWealth: number;
  zakatDue: number; // 2.5%
  isEligibleForZakat: boolean;
  nisabThreshold: number;
}

export function calculateZakat(input: ZakatInput): ZakatResult {
  const totalAssets =
    Math.max(0, input.cashInHandBank || 0) +
    Math.max(0, input.goldValue || 0) +
    Math.max(0, input.silverValue || 0) +
    Math.max(0, input.businessInventory || 0);

  const debts = Math.max(0, input.debtsLiabilities || 0);
  const netZakatableWealth = Math.max(0, totalAssets - debts);

  // Standard silver nisab approximate value (default ~150,000 PKR / ~$550 USD)
  const nisabThreshold = input.silverNisabThreshold || 150000;
  const isEligibleForZakat = netZakatableWealth >= nisabThreshold;
  const zakatDue = isEligibleForZakat ? Number((netZakatableWealth * 0.025).toFixed(2)) : 0;

  return {
    totalAssets,
    netZakatableWealth,
    zakatDue,
    isEligibleForZakat,
    nisabThreshold,
  };
}

// 3. STUDENT MARKS & GPA CALCULATOR
export interface SubjectMarks {
  id: string;
  name: string;
  obtained: number;
  total: number;
  creditHours?: number;
}

export interface GpaResult {
  totalObtained: number;
  totalMaximum: number;
  percentage: number;
  letterGrade: string;
  gpa: number;
  remarks: string;
}

export function calculateMarksAndGpa(subjects: SubjectMarks[]): GpaResult {
  if (!subjects.length) {
    return {
      totalObtained: 0,
      totalMaximum: 0,
      percentage: 0,
      letterGrade: 'N/A',
      gpa: 0,
      remarks: 'Add subjects to calculate grade',
    };
  }

  let totalObtained = 0;
  let totalMaximum = 0;
  let totalWeightedGradePoints = 0;
  let totalCredits = 0;

  for (const s of subjects) {
    const ob = Math.max(0, s.obtained || 0);
    const tot = Math.max(1, s.total || 100);
    const cr = Math.max(1, s.creditHours || 3);

    totalObtained += ob;
    totalMaximum += tot;

    const pct = (ob / tot) * 100;
    let point = 0;
    if (pct >= 85) point = 4.0;
    else if (pct >= 80) point = 3.7;
    else if (pct >= 75) point = 3.3;
    else if (pct >= 70) point = 3.0;
    else if (pct >= 65) point = 2.7;
    else if (pct >= 60) point = 2.3;
    else if (pct >= 55) point = 2.0;
    else if (pct >= 50) point = 1.0;
    else point = 0.0;

    totalWeightedGradePoints += point * cr;
    totalCredits += cr;
  }

  const percentage = totalMaximum > 0 ? (totalObtained / totalMaximum) * 100 : 0;
  const gpa = totalCredits > 0 ? totalWeightedGradePoints / totalCredits : 0;

  let letterGrade = 'F';
  let remarks = 'Fail - Needs Improvement';

  if (percentage >= 85) {
    letterGrade = 'A+';
    remarks = 'Outstanding! Top Distinction';
  } else if (percentage >= 80) {
    letterGrade = 'A';
    remarks = 'Excellent Academic Performance';
  } else if (percentage >= 75) {
    letterGrade = 'B+';
    remarks = 'Very Good';
  } else if (percentage >= 70) {
    letterGrade = 'B';
    remarks = 'Good';
  } else if (percentage >= 60) {
    letterGrade = 'C';
    remarks = 'Satisfactory';
  } else if (percentage >= 50) {
    letterGrade = 'D';
    remarks = 'Pass';
  }

  return {
    totalObtained: Number(totalObtained.toFixed(1)),
    totalMaximum: Number(totalMaximum.toFixed(1)),
    percentage: Number(percentage.toFixed(2)),
    letterGrade,
    gpa: Number(gpa.toFixed(2)),
    remarks,
  };
}

// 4. BILL SPLITTER & TIP
export interface BillSplitInput {
  billAmount: number;
  tipPercent: number;
  taxPercent?: number;
  numberOfPeople: number;
}

export interface BillSplitResult {
  billAmount: number;
  tipAmount: number;
  taxAmount: number;
  grandTotal: number;
  perPersonBill: number;
  perPersonTip: number;
  perPersonTotal: number;
}

export function calculateBillSplit(input: BillSplitInput): BillSplitResult {
  const bill = Math.max(0, input.billAmount || 0);
  const tipPct = Math.max(0, input.tipPercent || 0);
  const taxPct = Math.max(0, input.taxPercent || 0);
  const people = Math.max(1, input.numberOfPeople || 1);

  const tipAmount = (bill * tipPct) / 100;
  const taxAmount = (bill * taxPct) / 100;
  const grandTotal = bill + tipAmount + taxAmount;

  const perPersonTotal = grandTotal / people;
  const perPersonBill = bill / people;
  const perPersonTip = tipAmount / people;

  return {
    billAmount: Number(bill.toFixed(2)),
    tipAmount: Number(tipAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    perPersonBill: Number(perPersonBill.toFixed(2)),
    perPersonTip: Number(perPersonTip.toFixed(2)),
    perPersonTotal: Number(perPersonTotal.toFixed(2)),
  };
}
