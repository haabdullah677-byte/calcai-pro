/**
 * Calculator engine with standard & scientific math evaluation,
 * safe live preview, and vault pin detection.
 */

export interface CalcState {
  expression: string;
  display: string;
  preview: string;
  isRadian: boolean;
  history: HistoryItem[];
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

// Factorial helper
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
    if (!Number.isFinite(res)) return Infinity;
  }
  return res;
}

/**
 * Format calculation result to avoid IEEE floating point errors (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */
export function formatResult(val: number): string {
  if (!Number.isFinite(val)) {
    if (Number.isNaN(val)) return 'Error';
    return val > 0 ? 'Infinity' : '-Infinity';
  }
  
  // Clean up floating point precision issues
  const rounded = Number(Math.round(Number(val + 'e+10')) + 'e-10');
  
  // For very large or very small numbers, use scientific notation
  const abs = Math.abs(rounded);
  if ((abs >= 1e12 || (abs > 0 && abs < 1e-6)) && abs !== 0) {
    return rounded.toExponential(6).replace(/\.?0+e/, 'e');
  }
  
  // Format with thousands separator for readability
  const str = rounded.toString();
  if (str.includes('.')) {
    const [intPart, decPart] = str.split('.');
    return `${parseInt(intPart, 10).toLocaleString('en-US')}.${decPart}`;
  }
  return parseInt(str, 10).toLocaleString('en-US');
}

/**
 * Evaluate a mathematical expression string
 * Supports standard arithmetic, scientific functions, and degrees/radians
 */
export function evaluateExpression(rawExpr: string, isRadian = false): { success: boolean; result: number | null; error?: string } {
  if (!rawExpr || !rawExpr.trim()) {
    return { success: false, result: null };
  }

  try {
    let expr = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, `${Math.PI}`)
      .replace(/\bPI\b/gi, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`);

    // Replace percentages: e.g. 50% -> (50/100)
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Support power operator ^ -> **
    expr = expr.replace(/\^/g, '**');

    // Replace scientific functions
    // For trig functions, adjust for radians vs degrees
    const degToRad = (x: number) => (x * Math.PI) / 180;
    const radToDeg = (x: number) => (x * 180) / Math.PI;

    // Custom scope for math functions
    const scope = {
      sin: (x: number) => Math.sin(isRadian ? x : degToRad(x)),
      cos: (x: number) => {
        const rad = isRadian ? x : degToRad(x);
        // Clean near-zero cosine values (e.g. cos(90 deg))
        const val = Math.cos(rad);
        return Math.abs(val) < 1e-15 ? 0 : val;
      },
      tan: (x: number) => {
        const rad = isRadian ? x : degToRad(x);
        if (!isRadian && Math.abs(x % 180) === 90) return NaN;
        return Math.tan(rad);
      },
      asin: (x: number) => {
        const res = Math.asin(x);
        return isRadian ? res : radToDeg(res);
      },
      acos: (x: number) => {
        const res = Math.acos(x);
        return isRadian ? res : radToDeg(res);
      },
      atan: (x: number) => {
        const res = Math.atan(x);
        return isRadian ? res : radToDeg(res);
      },
      sqrt: Math.sqrt,
      cbrt: Math.cbrt,
      log: Math.log10,
      ln: Math.log,
      abs: Math.abs,
      fact: factorial,
      PI: Math.PI,
      E: Math.E,
    };

    // Sanitize expression: allow only numbers, whitespace, operators, and supported function names
    const allowedTokens = /[0-9+\-*/().,%^ \t\r\n]|sin|cos|tan|asin|acos|atan|sqrt|cbrt|log|ln|abs|fact|PI|E/g;
    const sanitized = expr.replace(allowedTokens, '');
    if (sanitized.trim().length > 0) {
      return { success: false, result: null, error: 'Invalid characters in expression' };
    }

    // Replace function calls e.g. sqrt(9) -> scope.sqrt(9)
    const processedExpr = expr
      .replace(/\bsin\(/g, 'scope.sin(')
      .replace(/\bcos\(/g, 'scope.cos(')
      .replace(/\btan\(/g, 'scope.tan(')
      .replace(/\basin\(/g, 'scope.asin(')
      .replace(/\bacos\(/g, 'scope.acos(')
      .replace(/\batan\(/g, 'scope.atan(')
      .replace(/\bsqrt\(/g, 'scope.sqrt(')
      .replace(/\bcbrt\(/g, 'scope.cbrt(')
      .replace(/\blog\(/g, 'scope.log(')
      .replace(/\bln\(/g, 'scope.ln(')
      .replace(/\babs\(/g, 'scope.abs(')
      .replace(/\bfact\(/g, 'scope.fact(');

    // Evaluate safely via new Function with scope parameter
    const fn = new Function('scope', `return (${processedExpr})`);
    const val = fn(scope);

    if (typeof val === 'number') {
      return { success: true, result: val };
    }
    return { success: false, result: null, error: 'Invalid result' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Calculation error';
    return { success: false, result: null, error: message };
  }
}

/**
 * Calculates a live preview if the expression is syntactically incomplete or complete
 */
export function getLivePreview(rawExpr: string, isRadian = false): string {
  if (!rawExpr || !rawExpr.trim()) return '';

  // Clean trailing operators for preview
  let trimmed = rawExpr.trim();
  
  // If ends with an operator, strip it for preview (e.g. "12 + " -> preview 12)
  trimmed = trimmed.replace(/[+\-×*÷/^]+$/, '').trim();
  if (!trimmed) return '';

  // Auto-close missing open parentheses for preview calculation
  const openCount = (trimmed.match(/\(/g) || []).length;
  const closeCount = (trimmed.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    trimmed += ')'.repeat(openCount - closeCount);
  }

  const evalRes = evaluateExpression(trimmed, isRadian);
  if (evalRes.success && evalRes.result !== null && Number.isFinite(evalRes.result)) {
    // If the expression was already just a single plain number, don't show a redundant preview
    if (/^\d+(\.\d+)?$/.test(rawExpr.trim())) {
      return '';
    }
    return `= ${formatResult(evalRes.result)}`;
  }
  return '';
}

/**
 * Checks if the current typed input matches Real or Decoy Secret Vault PIN
 */
export function checkSecretVaultTrigger(
  input: string,
  realPin: string | null = '1234',
  decoyPin: string | null = '0000'
): 'real' | 'decoy' | false {
  const cleaned = input.trim();
  if (realPin && cleaned === realPin) return 'real';
  if (decoyPin && cleaned === decoyPin) return 'decoy';
  return false;
}
