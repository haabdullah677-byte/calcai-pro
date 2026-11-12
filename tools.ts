/**
 * Pure calculation utilities for Tools tab:
 * 1. Discount & Profit/Loss
 * 2. Currency & Unit Converter
 * 3. Age & Date Difference
 * 4. BMI & Health Calculator
 */

// 1. DISCOUNT CALCULATOR
export interface DiscountInput {
  originalPrice: number;
  discountPercent: number;
  taxPercent?: number;
}

export interface DiscountResult {
  discountAmount: number;
  priceAfterDiscount: number;
  taxAmount: number;
  finalPrice: number;
  totalSaved: number;
}

export function calculateDiscount(input: DiscountInput): DiscountResult {
  const price = Math.max(0, input.originalPrice || 0);
  const discountRate = Math.max(0, Math.min(100, input.discountPercent || 0)) / 100;
  const taxRate = Math.max(0, input.taxPercent || 0) / 100;

  const discountAmount = price * discountRate;
  const priceAfterDiscount = price - discountAmount;
  const taxAmount = priceAfterDiscount * taxRate;
  const finalPrice = priceAfterDiscount + taxAmount;

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    priceAfterDiscount: Number(priceAfterDiscount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
    totalSaved: Number(discountAmount.toFixed(2)),
  };
}

// PROFIT & LOSS CALCULATOR
export interface ProfitLossInput {
  costPrice: number;
  sellingPrice: number;
  quantity?: number;
}

export interface ProfitLossResult {
  totalCost: number;
  totalRevenue: number;
  netProfitLoss: number;
  isProfit: boolean;
  profitPercentage: number;
  marginPercentage: number;
}

export function calculateProfitLoss(input: ProfitLossInput): ProfitLossResult {
  const qty = Math.max(1, input.quantity || 1);
  const cp = Math.max(0, input.costPrice || 0);
  const sp = Math.max(0, input.sellingPrice || 0);

  const totalCost = cp * qty;
  const totalRevenue = sp * qty;
  const netProfitLoss = totalRevenue - totalCost;
  const isProfit = netProfitLoss >= 0;

  const profitPercentage = totalCost > 0 ? (netProfitLoss / totalCost) * 100 : 0;
  const marginPercentage = totalRevenue > 0 ? (netProfitLoss / totalRevenue) * 100 : 0;

  return {
    totalCost: Number(totalCost.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    netProfitLoss: Number(netProfitLoss.toFixed(2)),
    isProfit,
    profitPercentage: Number(profitPercentage.toFixed(2)),
    marginPercentage: Number(marginPercentage.toFixed(2)),
  };
}

// 2. UNIT CONVERTER
export type UnitCategory = 'length' | 'weight' | 'temperature' | 'speed' | 'currency';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  ratioToBase: number; // Ratio to base unit (e.g. meter for length, kg for weight)
}

export const LENGTH_UNITS: UnitDefinition[] = [
  { id: 'm', name: 'Meter', symbol: 'm', ratioToBase: 1 },
  { id: 'km', name: 'Kilometer', symbol: 'km', ratioToBase: 1000 },
  { id: 'cm', name: 'Centimeter', symbol: 'cm', ratioToBase: 0.01 },
  { id: 'mm', name: 'Millimeter', symbol: 'mm', ratioToBase: 0.001 },
  { id: 'mi', name: 'Mile', symbol: 'mi', ratioToBase: 1609.344 },
  { id: 'yd', name: 'Yard', symbol: 'yd', ratioToBase: 0.9144 },
  { id: 'ft', name: 'Foot', symbol: 'ft', ratioToBase: 0.3048 },
  { id: 'in', name: 'Inch', symbol: 'in', ratioToBase: 0.0254 },
];

export const WEIGHT_UNITS: UnitDefinition[] = [
  { id: 'kg', name: 'Kilogram', symbol: 'kg', ratioToBase: 1 },
  { id: 'g', name: 'Gram', symbol: 'g', ratioToBase: 0.001 },
  { id: 'mg', name: 'Milligram', symbol: 'mg', ratioToBase: 0.000001 },
  { id: 'lb', name: 'Pound', symbol: 'lb', ratioToBase: 0.45359237 },
  { id: 'oz', name: 'Ounce', symbol: 'oz', ratioToBase: 0.028349523125 },
  { id: 'ton', name: 'Metric Ton', symbol: 't', ratioToBase: 1000 },
];

export const SPEED_UNITS: UnitDefinition[] = [
  { id: 'kmh', name: 'Kilometer / hr', symbol: 'km/h', ratioToBase: 1 },
  { id: 'mph', name: 'Mile / hr', symbol: 'mph', ratioToBase: 1.60934 },
  { id: 'ms', name: 'Meter / sec', symbol: 'm/s', ratioToBase: 3.6 },
  { id: 'knot', name: 'Knot', symbol: 'kn', ratioToBase: 1.852 },
];

// Benchmark currency rates relative to 1 USD
export const DEFAULT_CURRENCY_RATES: Record<string, { name: string; symbol: string; rateToUSD: number }> = {
  USD: { name: 'US Dollar', symbol: '$', rateToUSD: 1.0 },
  EUR: { name: 'Euro', symbol: '€', rateToUSD: 0.92 },
  GBP: { name: 'British Pound', symbol: '£', rateToUSD: 0.79 },
  JPY: { name: 'Japanese Yen', symbol: '¥', rateToUSD: 154.5 },
  CAD: { name: 'Canadian Dollar', symbol: 'CA$', rateToUSD: 1.38 },
  AUD: { name: 'Australian Dollar', symbol: 'A$', rateToUSD: 1.52 },
  INR: { name: 'Indian Rupee', symbol: '₹', rateToUSD: 85.8 },
  CNY: { name: 'Chinese Yuan', symbol: '¥', rateToUSD: 7.24 },
  AED: { name: 'UAE Dirham', symbol: 'AED', rateToUSD: 3.67 },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', rateToUSD: 0.89 },
};

export function convertUnits(
  category: UnitCategory,
  value: number,
  fromUnit: string,
  toUnit: string,
  customCurrencyRates?: Record<string, number>
): number {
  if (fromUnit === toUnit) return value;

  if (category === 'temperature') {
    // Celsius <-> Fahrenheit <-> Kelvin
    let celsius = value;
    if (fromUnit === 'f') {
      celsius = ((value - 32) * 5) / 9;
    } else if (fromUnit === 'k') {
      celsius = value - 273.15;
    }

    if (toUnit === 'c') return Number(celsius.toFixed(2));
    if (toUnit === 'f') return Number(((celsius * 9) / 5 + 32).toFixed(2));
    if (toUnit === 'k') return Number((celsius + 273.15).toFixed(2));
    return value;
  }

  if (category === 'currency') {
    const rates = customCurrencyRates || {};
    const fromRate = rates[fromUnit] ?? DEFAULT_CURRENCY_RATES[fromUnit]?.rateToUSD ?? 1;
    const toRate = rates[toUnit] ?? DEFAULT_CURRENCY_RATES[toUnit]?.rateToUSD ?? 1;
    // Value in USD = value / fromRate
    // Value in toUnit = (value / fromRate) * toRate
    const inUSD = value / fromRate;
    const result = inUSD * toRate;
    return Number(result.toFixed(4));
  }

  let list: UnitDefinition[] = [];
  if (category === 'length') list = LENGTH_UNITS;
  else if (category === 'weight') list = WEIGHT_UNITS;
  else if (category === 'speed') list = SPEED_UNITS;

  const fromDef = list.find((u) => u.id === fromUnit);
  const toDef = list.find((u) => u.id === toUnit);

  if (!fromDef || !toDef) return value;

  const inBase = value * fromDef.ratioToBase;
  const result = inBase / toDef.ratioToBase;
  return Number(result.toFixed(6));
}

// 3. AGE & DATE DIFFERENCE CALCULATOR
export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  nextBirthdayDays: number;
  nextBirthdayDayOfWeek: string;
}

export function calculateAge(birthDateStr: string, asOfDateStr?: string): AgeResult | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();

  if (isNaN(birth.getTime()) || isNaN(asOf.getTime()) || birth > asOf) {
    return null;
  }

  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();
  let days = asOf.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = asOf.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

  // Next birthday calculation
  let nextBday = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday < asOf) {
    nextBday = new Date(asOf.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const nextDiffMs = nextBday.getTime() - asOf.getTime();
  const nextBirthdayDays = Math.ceil(nextDiffMs / (1000 * 60 * 60 * 24));
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const nextBirthdayDayOfWeek = weekdays[nextBday.getDay()];

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    nextBirthdayDays,
    nextBirthdayDayOfWeek,
  };
}

// 4. BMI & HEALTH CALCULATOR
export interface BmiInput {
  heightCm: number;
  weightKg: number;
  age?: number;
  gender?: 'male' | 'female';
}

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  color: string;
  minHealthyWeight: number; // For BMI 18.5
  maxHealthyWeight: number; // For BMI 24.9
  weightDifferenceToNormal: number; // 0 if normal, positive if overweight, negative if underweight
  bmr: number; // Basal Metabolic Rate (Mifflin-St Jeor)
  dailyCalories: number; // Moderate activity estimate (TDEE)
}

export function calculateBmi(input: BmiInput): BmiResult | null {
  const hMeters = input.heightCm / 100;
  const wKg = input.weightKg;

  if (hMeters <= 0 || wKg <= 0) return null;

  const bmi = Number((wKg / (hMeters * hMeters)).toFixed(1));

  let category: BmiResult['category'] = 'Normal weight';
  let color = 'text-emerald-500';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-amber-400';
  } else if (bmi <= 24.9) {
    category = 'Normal weight';
    color = 'text-emerald-400';
  } else if (bmi <= 29.9) {
    category = 'Overweight';
    color = 'text-orange-400';
  } else {
    category = 'Obese';
    color = 'text-rose-500';
  }

  const minHealthyWeight = Number((18.5 * hMeters * hMeters).toFixed(1));
  const maxHealthyWeight = Number((24.9 * hMeters * hMeters).toFixed(1));

  let weightDifferenceToNormal = 0;
  if (wKg < minHealthyWeight) {
    weightDifferenceToNormal = Number((wKg - minHealthyWeight).toFixed(1)); // negative
  } else if (wKg > maxHealthyWeight) {
    weightDifferenceToNormal = Number((wKg - maxHealthyWeight).toFixed(1)); // positive
  }

  // Mifflin - St Jeor BMR
  const age = input.age || 25;
  const isFemale = input.gender === 'female';
  // BMR = 10W + 6.25H - 5A + (5 for male, -161 for female)
  const bmrBase = 10 * wKg + 6.25 * input.heightCm - 5 * age;
  const bmr = Math.round(isFemale ? bmrBase - 161 : bmrBase + 5);
  const dailyCalories = Math.round(bmr * 1.4); // Moderate activity

  return {
    bmi,
    category,
    color,
    minHealthyWeight,
    maxHealthyWeight,
    weightDifferenceToNormal,
    bmr,
    dailyCalories,
  };
}
