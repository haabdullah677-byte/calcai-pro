import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression, formatResult, getLivePreview, checkSecretVaultTrigger } from './calculator';

test('standard arithmetic evaluation', () => {
  assert.equal(evaluateExpression('2 + 3 * 4').result, 14);
  assert.equal(evaluateExpression('(10 - 2) / 4').result, 2);
  assert.equal(evaluateExpression('50% * 200').result, 100);
  assert.equal(evaluateExpression('15 × 4 ÷ 2 − 5').result, 25);
});

test('scientific operations and trig functions', () => {
  // Degrees mode by default (isRadian = false)
  const sin30 = evaluateExpression('sin(30)', false).result;
  assert(sin30 !== null && Math.abs(sin30 - 0.5) < 1e-6);

  const cos0 = evaluateExpression('cos(0)', false).result;
  assert.equal(cos0, 1);

  // Radians mode (isRadian = true)
  const sinPiOver2 = evaluateExpression('sin(PI / 2)', true).result;
  assert(sinPiOver2 !== null && Math.abs(sinPiOver2 - 1) < 1e-6);

  // Sqrt, log, power
  assert.equal(evaluateExpression('sqrt(144)').result, 12);
  assert.equal(evaluateExpression('log(1000)').result, 3);
  assert.equal(evaluateExpression('2^10').result, 1024);
  assert.equal(evaluateExpression('fact(5)').result, 120);
});

test('live preview generation', () => {
  assert.equal(getLivePreview('25 * 4 + 10'), '= 110');
  assert.equal(getLivePreview('sqrt(64) + '), '= 8');
  assert.equal(getLivePreview('(5 + 5'), '= 10');
  assert.equal(getLivePreview('123'), ''); // plain number has no preview
});

test('formatting precision handling', () => {
  assert.equal(formatResult(0.1 + 0.2), '0.3');
  assert.equal(formatResult(1000000), '1,000,000');
  assert.equal(formatResult(12.345), '12.345');
});

test('secret vault pin trigger', () => {
  assert.equal(checkSecretVaultTrigger('1234', '1234', '0000'), 'real');
  assert.equal(checkSecretVaultTrigger('0000', '1234', '0000'), 'decoy');
  assert.equal(checkSecretVaultTrigger('9999', '1234', '0000'), false);
  assert.equal(checkSecretVaultTrigger(' 1234 ', '1234', '0000'), 'real');
});
