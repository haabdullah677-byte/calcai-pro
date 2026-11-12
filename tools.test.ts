import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDiscount, calculateProfitLoss, convertUnits, calculateAge, calculateBmi } from './tools';

test('discount calculator', () => {
  const res = calculateDiscount({ originalPrice: 100, discountPercent: 20, taxPercent: 10 });
  assert.equal(res.discountAmount, 20);
  assert.equal(res.priceAfterDiscount, 80);
  assert.equal(res.taxAmount, 8);
  assert.equal(res.finalPrice, 88);
  assert.equal(res.totalSaved, 20);
});

test('profit and loss calculator', () => {
  const profit = calculateProfitLoss({ costPrice: 50, sellingPrice: 75, quantity: 10 });
  assert.equal(profit.totalCost, 500);
  assert.equal(profit.totalRevenue, 750);
  assert.equal(profit.netProfitLoss, 250);
  assert.equal(profit.isProfit, true);
  assert.equal(profit.profitPercentage, 50);

  const loss = calculateProfitLoss({ costPrice: 100, sellingPrice: 80, quantity: 2 });
  assert.equal(loss.netProfitLoss, -40);
  assert.equal(loss.isProfit, false);
});

test('unit conversion', () => {
  // Length: 1 km = 1000 m
  assert.equal(convertUnits('length', 1, 'km', 'm'), 1000);
  // Temperature: 100 C = 212 F
  assert.equal(convertUnits('temperature', 100, 'c', 'f'), 212);
  // Temperature: 32 F = 0 C
  assert.equal(convertUnits('temperature', 32, 'f', 'c'), 0);
  // Weight: 1 kg = ~2.20462 lb
  const lbs = convertUnits('weight', 1, 'kg', 'lb');
  assert(Math.abs(lbs - 2.20462) < 0.001);
});

test('age calculator', () => {
  const age = calculateAge('2000-01-01', '2026-01-01');
  assert(age !== null);
  assert.equal(age?.years, 26);
  assert.equal(age?.months, 0);
  assert.equal(age?.days, 0);
});

test('BMI calculator', () => {
  // Height 180cm, Weight 75kg
  // BMI = 75 / (1.8^2) = 23.15 -> 23.1
  const bmiRes = calculateBmi({ heightCm: 180, weightKg: 75, age: 30, gender: 'male' });
  assert(bmiRes !== null);
  assert.equal(bmiRes?.bmi, 23.1);
  assert.equal(bmiRes?.category, 'Normal weight');
});
