import test from 'node:test';
import assert from 'node:assert/strict';
import { numberToEnglishWords, numberToUrduWords, numberToRomanUrduWords } from './numberToWords';
import { parseNaturalLanguageMath, detectLanguage } from './nlpMath';
import { calculateLoanEmi, calculateZakat, calculateMarksAndGpa, calculateBillSplit } from './toolsExtended';
import { checkSecretVaultTrigger } from './calculator';

test('number to words conversion', () => {
  assert.equal(numberToEnglishWords(14500), 'Fourteen Thousand Five Hundred');
  assert.equal(numberToEnglishWords(100), 'One Hundred');
  assert(numberToUrduWords(14500).includes('ہزار'));
  assert(numberToRomanUrduWords(14500).includes('Hazaar'));
});

test('multilingual language detection', () => {
  assert.equal(detectLanguage('Muje 3 or 4 ko + kr'), 'Roman Urdu');
  assert.equal(detectLanguage('پانچ سو کا بیس فیصد'), 'Urdu');
  assert.equal(detectLanguage('Split 4500 bill among 4 friends'), 'English');
});

test('natural language math evaluation (Roman Urdu & English)', () => {
  // Roman Urdu addition
  const res1 = parseNaturalLanguageMath('Muje 3 or 4 ko + kr');
  assert.equal(res1.totalAmount, '7');

  // Bill splitting
  const res2 = parseNaturalLanguageMath('Split 4500 bill among 4 friends with 10% tip');
  assert.equal(res2.totalAmount, '1237.50');

  // Zakat
  const res3 = parseNaturalLanguageMath('Calculate zakat on 100000');
  assert.equal(res3.totalAmount, '2500.00');
});

test('extended tools (EMI, Zakat, GPA, Bill Splitter)', () => {
  // Loan EMI: 100,000 at 12% for 12 months = ~8884.88
  const emi = calculateLoanEmi({ principal: 100000, annualInterestRate: 12, tenureMonths: 12 });
  assert(Math.abs(emi.monthlyEmi - 8884.88) < 1);

  // Zakat 2.5%
  const zakat = calculateZakat({ cashInHandBank: 200000, goldValue: 50000, silverValue: 0, businessInventory: 0, debtsLiabilities: 10000, silverNisabThreshold: 100000 });
  assert.equal(zakat.netZakatableWealth, 240000);
  assert.equal(zakat.zakatDue, 6000);

  // Student Marks & GPA
  const gpa = calculateMarksAndGpa([
    { id: '1', name: 'Math', obtained: 85, total: 100, creditHours: 3 },
    { id: '2', name: 'Physics', obtained: 80, total: 100, creditHours: 3 },
  ]);
  assert.equal(gpa.percentage, 82.5);
  assert.equal(gpa.letterGrade, 'A');

  // Bill Splitter
  const bill = calculateBillSplit({ billAmount: 1000, tipPercent: 10, numberOfPeople: 4 });
  assert.equal(bill.grandTotal, 1100);
  assert.equal(bill.perPersonTotal, 275);
});

test('dual-PIN vault trigger in calculator', () => {
  assert.equal(checkSecretVaultTrigger('1234', '1234', '0000'), 'real');
  assert.equal(checkSecretVaultTrigger('0000', '1234', '0000'), 'decoy');
  assert.equal(checkSecretVaultTrigger('9999', '1234', '0000'), false);
});
