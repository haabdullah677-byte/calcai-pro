import React, { useState, useMemo, useEffect } from 'react';
import {
  Tag,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Calendar,
  Activity,
  Percent,
  Clock,
  DollarSign,
  Heart,
  Scale,
  Thermometer,
  Zap,
  BookOpen,
  Landmark,
  GraduationCap,
  Users,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { ThemeColors } from '../utils/theme';
import {
  calculateDiscount,
  calculateProfitLoss,
  convertUnits,
  calculateAge,
  calculateBmi,
  UnitCategory,
  LENGTH_UNITS,
  WEIGHT_UNITS,
  SPEED_UNITS,
  DEFAULT_CURRENCY_RATES,
} from '../utils/tools';
import {
  calculateLoanEmi,
  calculateZakat,
  calculateMarksAndGpa,
  calculateBillSplit,
  KhataTransaction,
  SubjectMarks,
} from '../utils/toolsExtended';
import { playFeedback } from '../utils/audio';

interface ToolsTabProps {
  theme: ThemeColors;
}

type ToolType =
  | 'discount'
  | 'converter'
  | 'age'
  | 'bmi'
  | 'khata'
  | 'loan_zakat'
  | 'student_gpa'
  | 'bill_split';

const LOCAL_STORAGE_KHATA = 'calcai_tools_khata';
const LOCAL_STORAGE_SUBJECTS = 'calcai_tools_subjects';

export const ToolsTab: React.FC<ToolsTabProps> = ({ theme }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('discount');

  // 1. DISCOUNT & P/L
  const [discMode, setDiscMode] = useState<'discount' | 'profit'>('discount');
  const [origPrice, setOrigPrice] = useState<string>('120');
  const [discPercent, setDiscPercent] = useState<string>('25');
  const [taxPercent, setTaxPercent] = useState<string>('8');
  const [costPrice, setCostPrice] = useState<string>('45');
  const [sellingPrice, setSellingPrice] = useState<string>('75');
  const [quantity, setQuantity] = useState<string>('10');

  // 2. CONVERTER (Added PKR, INR, SAR, AED)
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('currency');
  const [convertVal, setConvertVal] = useState<string>('100');
  const [fromUnit, setFromUnit] = useState<string>('USD');
  const [toUnit, setToUnit] = useState<string>('PKR');

  // Extended Currency Rates including PKR, INR, SAR, AED
  const currencyRates = useMemo(() => {
    return {
      USD: 1.0,
      PKR: 278.5,
      INR: 85.8,
      SAR: 3.75,
      AED: 3.67,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.38,
      AUD: 1.52,
      JPY: 154.5,
    };
  }, []);

  // 3. AGE & DATE
  const [ageMode, setAgeMode] = useState<'age' | 'diff'>('age');
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // 4. BMI & HEALTH
  const [bmiUnitSystem, setBmiUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState<string>('175');
  const [weightKg, setWeightKg] = useState<string>('68');
  const [heightFeet, setHeightFeet] = useState<string>('5');
  const [heightInches, setHeightInches] = useState<string>('9');
  const [weightLbs, setWeightLbs] = useState<string>('150');
  const [bmiAge, setBmiAge] = useState<string>('26');
  const [bmiGender, setBmiGender] = useState<'male' | 'female'>('male');

  // 5. KHATA / LEDGER
  const [transactions, setTransactions] = useState<KhataTransaction[]>([]);
  const [khataCustName, setKhataCustName] = useState('');
  const [khataAmount, setKhataAmount] = useState('');
  const [khataNote, setKhataNote] = useState('');
  const [khataType, setKhataType] = useState<'give' | 'got'>('give');

  // 6. LOAN & ZAKAT
  const [loanZakatTab, setLoanZakatTab] = useState<'loan' | 'zakat'>('loan');
  const [loanPrincipal, setLoanPrincipal] = useState('500000');
  const [loanRate, setLoanRate] = useState('12');
  const [loanTenureMonths, setLoanTenureMonths] = useState('24');

  const [zakatCash, setZakatCash] = useState('250000');
  const [zakatGold, setZakatGold] = useState('100000');
  const [zakatSilver, setZakatSilver] = useState('0');
  const [zakatStock, setZakatStock] = useState('50000');
  const [zakatDebts, setZakatDebts] = useState('20000');

  // 7. STUDENT MARKS & GPA
  const [subjects, setSubjects] = useState<SubjectMarks[]>([
    { id: '1', name: 'Mathematics', obtained: 88, total: 100, creditHours: 3 },
    { id: '2', name: 'Computer Science', obtained: 92, total: 100, creditHours: 4 },
    { id: '3', name: 'Physics', obtained: 78, total: 100, creditHours: 3 },
  ]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubObtained, setNewSubObtained] = useState('');
  const [newSubTotal, setNewSubTotal] = useState('100');

  // 8. BILL SPLITTER & TIP
  const [splitBill, setSplitBill] = useState('4500');
  const [splitTipPct, setSplitTipPct] = useState('10');
  const [splitTaxPct, setSplitTaxPct] = useState('5');
  const [splitPeople, setSplitPeople] = useState('4');

  // Load saved khata
  useEffect(() => {
    try {
      const rawKhata = localStorage.getItem(LOCAL_STORAGE_KHATA);
      if (rawKhata) setTransactions(JSON.parse(rawKhata));
      const rawSub = localStorage.getItem(LOCAL_STORAGE_SUBJECTS);
      if (rawSub) setSubjects(JSON.parse(rawSub));
    } catch {}
  }, []);

  const saveKhataTxs = (txs: KhataTransaction[]) => {
    setTransactions(txs);
    try {
      localStorage.setItem(LOCAL_STORAGE_KHATA, JSON.stringify(txs));
    } catch {}
  };

  const saveSubjectsList = (subs: SubjectMarks[]) => {
    setSubjects(subs);
    try {
      localStorage.setItem(LOCAL_STORAGE_SUBJECTS, JSON.stringify(subs));
    } catch {}
  };

  // 1. Discount Memo
  const discountResult = useMemo(() => {
    return calculateDiscount({
      originalPrice: parseFloat(origPrice) || 0,
      discountPercent: parseFloat(discPercent) || 0,
      taxPercent: parseFloat(taxPercent) || 0,
    });
  }, [origPrice, discPercent, taxPercent]);

  const profitResult = useMemo(() => {
    return calculateProfitLoss({
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      quantity: parseFloat(quantity) || 1,
    });
  }, [costPrice, sellingPrice, quantity]);

  // 2. Converted Memo
  const convertedResult = useMemo(() => {
    const val = parseFloat(convertVal) || 0;
    return convertUnits(unitCategory, val, fromUnit, toUnit, currencyRates);
  }, [unitCategory, convertVal, fromUnit, toUnit, currencyRates]);

  // 3. Age Memo
  const ageResult = useMemo(() => calculateAge(birthDate, asOfDate), [birthDate, asOfDate]);

  // 4. BMI Memo
  const bmiResult = useMemo(() => {
    let h = parseFloat(heightCm) || 0;
    let w = parseFloat(weightKg) || 0;
    if (bmiUnitSystem === 'imperial') {
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      h = (feet * 12 + inches) * 2.54;
      w = (parseFloat(weightLbs) || 0) * 0.453592;
    }
    return calculateBmi({
      heightCm: h,
      weightKg: w,
      age: parseInt(bmiAge, 10) || 25,
      gender: bmiGender,
    });
  }, [bmiUnitSystem, heightCm, weightKg, heightFeet, heightInches, weightLbs, bmiAge, bmiGender]);

  // 5. Khata Totals
  const khataTotals = useMemo(() => {
    let totalGiven = 0; // Credit / Udhar Diya (+)
    let totalGot = 0; // Debit / Wasool Hua (-)
    transactions.forEach((tx) => {
      if (tx.type === 'give') totalGiven += tx.amount;
      else totalGot += tx.amount;
    });
    return {
      totalGiven,
      totalGot,
      balance: totalGiven - totalGot, // Positive = You are owed, Negative = You owe
    };
  }, [transactions]);

  // 6. Loan & Zakat Memo
  const loanResult = useMemo(() => {
    return calculateLoanEmi({
      principal: parseFloat(loanPrincipal) || 0,
      annualInterestRate: parseFloat(loanRate) || 0,
      tenureMonths: parseInt(loanTenureMonths, 10) || 1,
    });
  }, [loanPrincipal, loanRate, loanTenureMonths]);

  const zakatResult = useMemo(() => {
    return calculateZakat({
      cashInHandBank: parseFloat(zakatCash) || 0,
      goldValue: parseFloat(zakatGold) || 0,
      silverValue: parseFloat(zakatSilver) || 0,
      businessInventory: parseFloat(zakatStock) || 0,
      debtsLiabilities: parseFloat(zakatDebts) || 0,
    });
  }, [zakatCash, zakatGold, zakatSilver, zakatStock, zakatDebts]);

  // 7. Student GPA Memo
  const gpaResult = useMemo(() => calculateMarksAndGpa(subjects), [subjects]);

  // 8. Bill Split Memo
  const billSplitResult = useMemo(() => {
    return calculateBillSplit({
      billAmount: parseFloat(splitBill) || 0,
      tipPercent: parseFloat(splitTipPct) || 0,
      taxPercent: parseFloat(splitTaxPct) || 0,
      numberOfPeople: parseInt(splitPeople, 10) || 1,
    });
  }, [splitBill, splitTipPct, splitTaxPct, splitPeople]);

  // Khata Add Transaction
  const handleAddKhata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khataCustName.trim() || !khataAmount) return;
    playFeedback('equals');
    const newTx: KhataTransaction = {
      id: 'tx_' + Date.now(),
      customerId: khataCustName.toLowerCase().replace(/\s+/g, '_'),
      customerName: khataCustName.trim(),
      type: khataType,
      amount: parseFloat(khataAmount) || 0,
      note: khataNote.trim() || (khataType === 'give' ? 'Udhar Diya' : 'Wasool Hua'),
      date: Date.now(),
    };
    const updated = [newTx, ...transactions];
    saveKhataTxs(updated);
    setKhataAmount('');
    setKhataNote('');
  };

  const handleDeleteKhata = (id: string) => {
    playFeedback('clear');
    saveKhataTxs(transactions.filter((t) => t.id !== id));
  };

  // Student Marks Add
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubObtained) return;
    playFeedback('equals');
    const newSub: SubjectMarks = {
      id: 'sub_' + Date.now(),
      name: newSubName.trim(),
      obtained: parseFloat(newSubObtained) || 0,
      total: parseFloat(newSubTotal) || 100,
      creditHours: 3,
    };
    saveSubjectsList([...subjects, newSub]);
    setNewSubName('');
    setNewSubObtained('');
  };

  const handleDeleteSubject = (id: string) => {
    playFeedback('clear');
    saveSubjectsList(subjects.filter((s) => s.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-3 py-2 overflow-y-auto">
      {/* 8 Tool Selector Grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          { id: 'discount', label: 'Discount', icon: <Tag className="w-3.5 h-3.5" /> },
          { id: 'converter', label: 'Units & FX', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
          { id: 'age', label: 'Age & Date', icon: <Calendar className="w-3.5 h-3.5" /> },
          { id: 'bmi', label: 'BMI Health', icon: <Heart className="w-3.5 h-3.5" /> },
          { id: 'khata', label: 'Khata Book', icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'loan_zakat', label: 'Loan / Zakat', icon: <Landmark className="w-3.5 h-3.5 text-emerald-400" /> },
          { id: 'student_gpa', label: 'Marks & GPA', icon: <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> },
          { id: 'bill_split', label: 'Split Bill', icon: <Users className="w-3.5 h-3.5 text-purple-400" /> },
        ].map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                playFeedback('click');
                setActiveTool(t.id as ToolType);
              }}
              className={`p-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all text-center ${
                isActive
                  ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md'
                  : `bg-white/5 ${theme.textSecondary} ${theme.cardBorder} hover:bg-white/10`
              }`}
            >
              {t.icon}
              <span className="text-[9px] leading-tight font-semibold truncate w-full">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TOOL 1: DISCOUNT & P/L */}
      {activeTool === 'discount' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className={`grid grid-cols-2 p-1 rounded-xl border ${theme.cardBg} ${theme.cardBorder}`}>
            <button
              onClick={() => setDiscMode('discount')}
              className={`py-1.5 rounded-lg text-xs font-bold ${
                discMode === 'discount' ? 'bg-emerald-500 text-black font-extrabold' : theme.textSecondary
              }`}
            >
              Discount & Sale
            </button>
            <button
              onClick={() => setDiscMode('profit')}
              className={`py-1.5 rounded-lg text-xs font-bold ${
                discMode === 'profit' ? 'bg-emerald-500 text-black font-extrabold' : theme.textSecondary
              }`}
            >
              Profit & Loss
            </button>
          </div>

          {discMode === 'discount' ? (
            <div className={`p-4 rounded-2xl border space-y-3.5 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Original Price ($)</label>
                <input
                  type="number"
                  value={origPrice}
                  onChange={(e) => setOrigPrice(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-base outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Discount (%)</label>
                <input
                  type="number"
                  value={discPercent}
                  onChange={(e) => setDiscPercent(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-base outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-bold uppercase">Final Price to Pay</span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  ${discountResult.finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border space-y-3.5 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Cost Price (CP)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Selling Price (SP)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${profitResult.isProfit ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-rose-500/15 border-rose-500/30'} flex items-center justify-between`}>
                <span className={`text-xs font-bold uppercase ${profitResult.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitResult.isProfit ? 'Net Profit' : 'Net Loss'}
                </span>
                <span className={`text-2xl font-mono font-black ${profitResult.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${profitResult.netProfitLoss.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: CURRENCY & UNITS (Includes PKR, INR, SAR, AED, etc.) */}
      {activeTool === 'converter' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className={`p-4 rounded-2xl border space-y-3.5 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Amount to Convert</label>
              <input
                type="number"
                value={convertVal}
                onChange={(e) => setConvertVal(e.target.value)}
                className={`w-full p-3 rounded-xl border font-mono font-bold text-xl outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 text-zinc-400">From</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none bg-zinc-900 ${theme.cardBorder} ${theme.textPrimary}`}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFromUnit(toUnit);
                  setToUnit(fromUnit);
                }}
                className="p-2.5 mt-4 rounded-xl border border-zinc-700 bg-white/5 text-emerald-400"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 text-zinc-400">To</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none bg-zinc-900 ${theme.cardBorder} ${theme.textPrimary}`}
                >
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Converted Value
              </span>
              <div className="text-2xl font-mono font-black text-emerald-300 mt-1">
                {convertedResult.toLocaleString('en-US', { maximumFractionDigits: 2 })} {toUnit}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: AGE & DATE */}
      {activeTool === 'age' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className={`p-4 rounded-2xl border space-y-3.5 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Date of Birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold outline-none bg-zinc-900 ${theme.cardBorder} ${theme.textPrimary}`}
              />
            </div>

            {ageResult && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Exact Living Age</span>
                <div className="text-xl font-mono font-black text-emerald-300">
                  {ageResult.years} Yrs, {ageResult.months} Mos, {ageResult.days} Days
                </div>
                <div className="text-xs text-zinc-400">Total Days: {ageResult.totalDays.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 4: BMI HEALTH */}
      {activeTool === 'bmi' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className={`p-4 rounded-2xl border space-y-3.5 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-zinc-900 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-zinc-900 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>
            </div>

            {bmiResult && (
              <div className="p-4 rounded-xl bg-black/30 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Body Mass Index (BMI)</span>
                  <div className="text-2xl font-mono font-black text-white">{bmiResult.bmi}</div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {bmiResult.category}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 5: KHATA / LEDGER BOOK */}
      {activeTool === 'khata' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          {/* Summary Balance Card */}
          <div className="p-3.5 rounded-2xl border bg-black/30 border-zinc-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-zinc-400 block">Udhar Diya (+)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                ${khataTotals.totalGiven.toFixed(2)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] text-zinc-400 block">Wasool Hua (-)</span>
              <span className="text-xs font-mono font-bold text-rose-400">
                ${khataTotals.totalGot.toFixed(2)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">Baaqi Balance</span>
              <span
                className={`text-xs font-mono font-bold ${
                  khataTotals.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                ${khataTotals.balance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Add Entry Form */}
          <form onSubmit={handleAddKhata} className={`p-4 rounded-2xl border space-y-2.5 ${theme.cardBg} ${theme.cardBorder}`}>
            <h4 className={`text-xs font-bold flex items-center gap-1.5 ${theme.textPrimary}`}>
              <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Nayi Khata Entry
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Customer / Dost Name"
                value={khataCustName}
                onChange={(e) => setKhataCustName(e.target.value)}
                className={`w-full p-2 rounded-xl border text-xs outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
              <input
                type="number"
                placeholder="Raqam / Amount"
                value={khataAmount}
                onChange={(e) => setKhataAmount(e.target.value)}
                className={`w-full p-2 rounded-xl border text-xs font-mono outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKhataType('give')}
                className={`py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  khataType === 'give'
                    ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold'
                    : 'bg-white/5 border-zinc-800 text-zinc-300'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Maine Diya (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setKhataType('got')}
                className={`py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  khataType === 'got'
                    ? 'bg-rose-500 text-white border-rose-400 font-extrabold'
                    : 'bg-white/5 border-zinc-800 text-zinc-300'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
                <span>Mujhe Mila (-)</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-sm active:scale-95"
            >
              Khata Me Save Karo
            </button>
          </form>

          {/* Transactions List */}
          <div className="space-y-1.5">
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">No khata records yet. Add a customer above.</div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-zinc-800/80 bg-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-zinc-100">{tx.customerName}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(tx.date).toLocaleDateString()} • {tx.note}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.type === 'give' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'give' ? '+ ' : '- '}${tx.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteKhata(tx.id)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TOOL 6: LOAN EMI & ZAKAT */}
      {activeTool === 'loan_zakat' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className={`grid grid-cols-2 p-1 rounded-xl border ${theme.cardBg} ${theme.cardBorder}`}>
            <button
              onClick={() => setLoanZakatTab('loan')}
              className={`py-1.5 rounded-lg text-xs font-bold ${
                loanZakatTab === 'loan' ? 'bg-emerald-500 text-black font-extrabold' : theme.textSecondary
              }`}
            >
              Loan / EMI Calculator
            </button>
            <button
              onClick={() => setLoanZakatTab('zakat')}
              className={`py-1.5 rounded-lg text-xs font-bold ${
                loanZakatTab === 'zakat' ? 'bg-emerald-500 text-black font-extrabold' : theme.textSecondary
              }`}
            >
              Islamic Zakat (2.5%)
            </button>
          </div>

          {loanZakatTab === 'loan' ? (
            <div className={`p-4 rounded-2xl border space-y-3 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Loan Amount ($)</label>
                <input
                  type="number"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Annual Interest %</label>
                  <input
                    type="number"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Tenure (Months)</label>
                  <input
                    type="number"
                    value={loanTenureMonths}
                    onChange={(e) => setLoanTenureMonths(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Monthly EMI Installment</span>
                <div className="text-2xl font-mono font-black text-emerald-300 mt-0.5">
                  ${loanResult.monthlyEmi.toFixed(2)} / mo
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Total Interest: ${loanResult.totalInterest.toFixed(2)} • Total Payment: ${loanResult.totalPayment.toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border space-y-2.5 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Cash in Hand / Bank</label>
                  <input
                    type="number"
                    value={zakatCash}
                    onChange={(e) => setZakatCash(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-mono font-bold outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Gold Assets Value</label>
                  <input
                    type="number"
                    value={zakatGold}
                    onChange={(e) => setZakatGold(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-mono font-bold outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Business Stock / Goods</label>
                  <input
                    type="number"
                    value={zakatStock}
                    onChange={(e) => setZakatStock(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-mono font-bold outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Debts & Liabilities (-)</label>
                  <input
                    type="number"
                    value={zakatDebts}
                    onChange={(e) => setZakatDebts(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-mono font-bold outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Zakat Due (2.5%)</span>
                <div className="text-2xl font-mono font-black text-emerald-300 mt-0.5">
                  ${zakatResult.zakatDue.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Net Zakatable Wealth: ${zakatResult.netZakatableWealth.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 7: STUDENT MARKS & GPA */}
      {activeTool === 'student_gpa' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          {/* GPA Result Card */}
          <div className="p-4 rounded-2xl border bg-black/30 border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Overall Percentage</span>
              <div className="text-2xl font-mono font-black text-emerald-400">{gpaResult.percentage}%</div>
              <div className="text-xs text-zinc-400 font-medium">{gpaResult.remarks}</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Grade: {gpaResult.letterGrade}
              </span>
              <div className="text-xs font-mono font-bold text-amber-300 mt-1">GPA: {gpaResult.gpa} / 4.0</div>
            </div>
          </div>

          {/* Add Subject */}
          <form onSubmit={handleAddSubject} className={`p-3.5 rounded-2xl border space-y-2 ${theme.cardBg} ${theme.cardBorder}`}>
            <div className="grid grid-cols-[1.5fr,1fr,1fr] gap-1.5">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className={`p-2 rounded-xl border text-xs outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
              <input
                type="number"
                placeholder="Obt Marks"
                value={newSubObtained}
                onChange={(e) => setNewSubObtained(e.target.value)}
                className={`p-2 rounded-xl border text-xs font-mono outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
              <input
                type="number"
                placeholder="Total (100)"
                value={newSubTotal}
                onChange={(e) => setNewSubTotal(e.target.value)}
                className={`p-2 rounded-xl border text-xs font-mono outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-xl text-xs font-bold bg-sky-500 text-black hover:bg-sky-400"
            >
              + Add Subject Marks
            </button>
          </form>

          {/* Subjects Table */}
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-white/5 overflow-hidden">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-2.5 px-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-zinc-100">{sub.name}</div>
                  <div className="text-[10px] text-zinc-400">
                    {sub.obtained} / {sub.total} ({((sub.obtained / sub.total) * 100).toFixed(0)}%)
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSubject(sub.id)}
                  className="p-1 rounded text-zinc-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOOL 8: BILL SPLITTER & TIP */}
      {activeTool === 'bill_split' && (
        <div className="space-y-3 pb-6 animate-fadeIn">
          <div className={`p-4 rounded-2xl border space-y-3 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Total Bill Amount ($)</label>
              <input
                type="number"
                value={splitBill}
                onChange={(e) => setSplitBill(e.target.value)}
                className={`w-full p-3 rounded-xl border font-mono font-bold text-xl outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Tip Percentage (%)</label>
                <input
                  type="number"
                  value={splitTipPct}
                  onChange={(e) => setSplitTipPct(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondary}`}>Number of Friends</label>
                <input
                  type="number"
                  value={splitPeople}
                  onChange={(e) => setSplitPeople(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono font-bold text-sm outline-none bg-black/25 ${theme.cardBorder} ${theme.textPrimary}`}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/15 border border-purple-500/30 text-center space-y-1">
              <span className="text-[10px] text-purple-300 font-bold uppercase block">Each Person Pays</span>
              <div className="text-3xl font-mono font-black text-purple-300">
                ${billSplitResult.perPersonTotal.toFixed(2)}
              </div>
              <div className="text-xs text-zinc-400">
                Grand Total: ${billSplitResult.grandTotal.toFixed(2)} (Bill: ${billSplitResult.billAmount} + Tip: ${billSplitResult.tipAmount.toFixed(2)})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
