/**
 * Number to Words converter supporting English, Urdu, and Roman Urdu.
 * Used for live conversion under the calculator display (useful for cheques & bills).
 */

const ONES_EN = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS_EN = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const URDU_DIGITS = [
  '', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو',
  'دس', 'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس'
];

const URDU_TENS = [
  '', '', 'بیس', 'تیس', 'چالیس', 'پچاس', 'ساٹھ', 'ستر', 'اسی', 'نوے'
];

const ROMAN_URDU_ONES = [
  '', 'Aik', 'Do', 'Teen', 'Chaar', 'Paanch', 'Chhay', 'Saat', 'Aath', 'Nau',
  'Dus', 'Gyaarah', 'Baarah', 'Teerah', 'Chaudah', 'Pandrah', 'Solah', 'Satrah', 'Athaarah', 'Unnees'
];

const ROMAN_URDU_TENS = [
  '', '', 'Bees', 'Tees', 'Chaalees', 'Pachaas', 'Saath', 'Sattar', 'Assi', 'Nabbey'
];

function convertThreeDigitGroup(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ONES_EN[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += TENS_EN[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ONES_EN[n] + ' ';
  }
  return str.trim();
}

/**
 * Convert number into English words
 */
export function numberToEnglishWords(num: number): string {
  if (isNaN(num)) return '';
  if (num === 0) return 'Zero';
  if (!Number.isFinite(num)) return 'Infinity';

  const isNeg = num < 0;
  let abs = Math.abs(num);

  const intPart = Math.floor(abs);
  const decimalPart = Math.round((abs - intPart) * 100);

  if (intPart === 0 && decimalPart === 0) return 'Zero';

  const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
  let words = '';
  let scaleIdx = 0;
  let temp = intPart;

  while (temp > 0 && scaleIdx < scales.length) {
    const chunk = temp % 1000;
    if (chunk > 0) {
      const chunkStr = convertThreeDigitGroup(chunk);
      words = `${chunkStr} ${scales[scaleIdx]} ${words}`.trim();
    }
    temp = Math.floor(temp / 1000);
    scaleIdx++;
  }

  if (!words) words = 'Zero';
  if (isNeg) words = 'Minus ' + words;

  if (decimalPart > 0) {
    words += ` and ${decimalPart}/100`;
  }

  return words.trim();
}

/**
 * Convert number into Urdu / South Asian numbering words (Lakh, Crore)
 */
function urduInner(abs: number): string {
  if (abs === 0) return '';
  const crore = Math.floor(abs / 10000000);
  abs %= 10000000;
  const lakh = Math.floor(abs / 100000);
  abs %= 100000;
  const thousand = Math.floor(abs / 1000);
  abs %= 1000;
  const hundred = Math.floor(abs / 100);
  const rem = abs % 100;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${urduInner(crore)} کروڑ`);
  if (lakh > 0) parts.push(`${urduInner(lakh)} لاکھ`);
  if (thousand > 0) parts.push(`${urduInner(thousand)} ہزار`);
  if (hundred > 0) parts.push(`${URDU_DIGITS[hundred] || hundred} سو`);
  if (rem > 0) {
    if (rem < 20) {
      parts.push(URDU_DIGITS[rem] || String(rem));
    } else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      parts.push(`${URDU_TENS[t]} ${o > 0 ? URDU_DIGITS[o] : ''}`.trim());
    }
  }
  return parts.join(' ').trim();
}

/**
 * Convert number into Urdu / South Asian numbering words (Lakh, Crore)
 */
export function numberToUrduWords(num: number): string {
  if (isNaN(num)) return '';
  if (num === 0) return 'صفر روپے';
  if (!Number.isFinite(num)) return 'لا محدود';

  const isNeg = num < 0;
  const abs = Math.floor(Math.abs(num));
  if (abs >= 1e12) return numberToEnglishWords(num);

  let res = urduInner(abs);
  if (!res) res = 'صفر';
  if (isNeg) res = 'منفی ' + res;
  return res + ' روپے';
}

function romanUrduInner(abs: number): string {
  if (abs === 0) return '';
  const crore = Math.floor(abs / 10000000);
  abs %= 10000000;
  const lakh = Math.floor(abs / 100000);
  abs %= 100000;
  const thousand = Math.floor(abs / 1000);
  abs %= 1000;
  const hundred = Math.floor(abs / 100);
  const rem = abs % 100;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${romanUrduInner(crore)} Crore`);
  if (lakh > 0) parts.push(`${romanUrduInner(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${romanUrduInner(thousand)} Hazaar`);
  if (hundred > 0) parts.push(`${ROMAN_URDU_ONES[hundred] || hundred} Sau`);
  if (rem > 0) {
    if (rem < 20) {
      parts.push(ROMAN_URDU_ONES[rem] || String(rem));
    } else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      parts.push(`${ROMAN_URDU_TENS[t]} ${o > 0 ? ROMAN_URDU_ONES[o] : ''}`.trim());
    }
  }
  return parts.join(' ').trim();
}

/**
 * Convert number into Roman Urdu (e.g. "Chaudah Hazaar Paanch Sau Rupees")
 */
export function numberToRomanUrduWords(num: number): string {
  if (isNaN(num)) return '';
  if (num === 0) return 'Sifar Rupees';

  const isNeg = num < 0;
  const abs = Math.floor(Math.abs(num));
  let res = romanUrduInner(abs);
  if (!res) res = 'Sifar';
  if (isNeg) res = 'Minus ' + res;
  return res + ' Rupees';
}
