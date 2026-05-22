"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { DollarSign, Landmark, Calendar, Percent, BookOpen, Clock, ShieldCheck } from "lucide-react";

export default function LoanCalculatorPage() {
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenure, setTenure] = useState(30);
  const [tenureType, setTenureType] = useState<"years" | "months">("years");
  const [extraPayment, setExtraPayment] = useState(0);

  const [standardEmi, setStandardEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [actualTenureMonths, setActualTenureMonths] = useState(0);
  const [monthsSaved, setMonthsSaved] = useState(0);
  const [interestSaved, setInterestSaved] = useState(0);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    recordRecentTool("calc-loan");
  }, []);

  useEffect(() => {
    const P = principal;
    const annualRate = interestRate;
    const N = tenureType === "years" ? tenure * 12 : tenure;

    if (P <= 0 || annualRate <= 0 || N <= 0) {
      setStandardEmi(0);
      setTotalInterest(0);
      setTotalPayment(0);
      setActualTenureMonths(0);
      setMonthsSaved(0);
      setInterestSaved(0);
      setSchedule([]);
      return;
    }

    const r = annualRate / 12 / 100;
    
    // Standard Monthly EMI Calculation
    const emiCalc = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    setStandardEmi(emiCalc);

    // Amortization Schedule simulation (incorporating extra monthly payments)
    let balance = P;
    let totalIntPaid = 0;
    let totalPaid = 0;
    let currentMonth = 0;
    
    // Also track standard run (no extra payments) to calculate savings
    let standardBalance = P;
    let standardTotalInt = 0;
    for (let m = 1; m <= N; m++) {
      const stdInterest = standardBalance * r;
      const stdPrincipal = Math.min(standardBalance, emiCalc - stdInterest);
      standardTotalInt += stdInterest;
      standardBalance -= stdPrincipal;
    }

    const yearlySchedule: any[] = [];
    let accumPrincipal = 0;
    let accumInterest = 0;
    let accumExtra = 0;

    while (balance > 0.01 && currentMonth < 600) { // Limit to 50 years to prevent infinite loops
      currentMonth++;
      const interestPaid = balance * r;
      let principalPaid = emiCalc - interestPaid;
      
      if (principalPaid > balance) {
        principalPaid = balance;
      }
      
      balance = Math.max(0, balance - principalPaid);
      
      let actualExtraPaid = 0;
      if (balance > 0 && extraPayment > 0) {
        actualExtraPaid = Math.min(balance, extraPayment);
        balance = Math.max(0, balance - actualExtraPaid);
      }

      accumPrincipal += principalPaid;
      accumInterest += interestPaid;
      accumExtra += actualExtraPaid;
      totalIntPaid += interestPaid;
      totalPaid += principalPaid + actualExtraPaid;

      // Group by year (every 12 months) or at payoff
      if (currentMonth % 12 === 0 || balance <= 0.01) {
        const yearNum = Math.ceil(currentMonth / 12);
        yearlySchedule.push({
          year: yearNum,
          principalPaid: accumPrincipal,
          interestPaid: accumInterest,
          extraPaid: accumExtra,
          totalPaid: accumPrincipal + accumInterest + accumExtra,
          remainingBalance: balance,
        });
        accumPrincipal = 0;
        accumInterest = 0;
        accumExtra = 0;
      }
    }

    setActualTenureMonths(currentMonth);
    setTotalInterest(totalIntPaid);
    setTotalPayment(totalPaid);
    setSchedule(yearlySchedule);

    if (extraPayment > 0) {
      setMonthsSaved(Math.max(0, N - currentMonth));
      setInterestSaved(Math.max(0, standardTotalInt - totalIntPaid));
    } else {
      setMonthsSaved(0);
      setInterestSaved(0);
    }
  }, [principal, interestRate, tenure, tenureType, extraPayment]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Chart Angles
  const interestRatio = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const principalRatio = 100 - interestRatio;
  const strokeDasharray = `${principalRatio} ${interestRatio}`;

  const faqs = [
    {
      question: "How does this Loan Calculator differ from the EMI Calculator?",
      answer: "While the EMI calculator computes standard payments, our Loan Calculator allows you to add 'Extra Monthly Payments' to see how prepayments shorten your loan tenure and reduce the total interest paid over the life of the loan.",
    },
    {
      question: "What are the benefits of making extra monthly payments?",
      answer: "Even small extra monthly payments go directly toward reducing the loan principal. This shrinks the outstanding balance faster, which in turn reduces the compound interest charged in all subsequent months, potentially saving thousands of dollars and years of repayments.",
    },
    {
      question: "Can I use this for home, car, or student loans?",
      answer: "Yes, this calculator works for any standard amortized loan, including home mortgages, auto loans, personal loans, and student loans, using standard compounding monthly interest.",
    },
  ];

  return (
    <ToolLayout toolId="calc-loan">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders Input Panel (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Landmark className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Loan & Prepayment Parameters</h2>
              </div>

              {/* Principal Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Loan Amount (Principal)</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                      className="w-20 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="2000000"
                  step="5000"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$5,000</span>
                  <span>$2,000,000</span>
                </div>
              </div>

              {/* Interest Rate Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Interest Rate (p.a.)</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                      className="w-12 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                    <Percent className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Tenure Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Loan Tenure</span>
                  <div className="flex items-center gap-1.5 bg-muted/20 border border-border px-2 py-0.5 rounded-xl font-mono font-bold">
                    <input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                      className="w-10 bg-transparent border-none outline-none focus:ring-0 text-right p-0 text-primary"
                    />
                    <select
                      value={tenureType}
                      onChange={(e) => {
                        setTenureType(e.target.value as "years" | "months");
                        setTenure(e.target.value === "years" ? 30 : 360);
                      }}
                      className="bg-transparent border-none focus:ring-0 outline-none text-[10px] text-muted-foreground p-0 cursor-pointer font-sans"
                    >
                      <option value="years">Years</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max={tenureType === "years" ? 40 : 480}
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1 {tenureType}</span>
                  <span>{tenureType === "years" ? 40 : 480} {tenureType}</span>
                </div>
              </div>

              {/* Extra Payment Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Extra Monthly Payment</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    <input
                      type="number"
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$0</span>
                  <span>$5,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary & Graphics (Right) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Metrics Cards */}
              <div className="space-y-4">
                {/* Standard Monthly Payment */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Standard Monthly Payment
                  </div>
                  <div className="text-2xl font-extrabold text-primary mt-1">
                    {formatCurrency(standardEmi)}
                  </div>
                </div>

                {/* Total Interest & Cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Interest</div>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {formatCurrency(totalInterest)}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Repayments</div>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {formatCurrency(totalPayment)}
                    </div>
                  </div>
                </div>

                {/* Savings highlights if extra payment */}
                {extraPayment > 0 ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Early Payoff Savings
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Interest Saved</span>
                        <span className="font-extrabold text-emerald-500 text-base">{formatCurrency(interestSaved)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Time Saved</span>
                        <span className="font-extrabold text-emerald-500 text-base">
                          {Math.floor(monthsSaved / 12)} yrs {monthsSaved % 12} mos
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/10 border border-border/40 rounded-2xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground leading-snug">
                      Add an <strong>Extra Monthly Payment</strong> to see how much interest and repayment years you save!
                    </div>
                  </div>
                )}
              </div>

              {/* Pie Chart Display */}
              <div className="p-5 bg-card border border-border rounded-3xl flex flex-col justify-center items-center gap-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3.2"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Principal</span>
                    <span className="text-sm font-extrabold text-primary">{principalRatio.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[10px] font-bold w-full">
                  <div className="flex items-center justify-between text-primary">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      <span>Principal Amount</span>
                    </div>
                    <span>{formatCurrency(principal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-muted rounded-full" />
                      <span>Interest Cost</span>
                    </div>
                    <span>{formatCurrency(totalInterest)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Table */}
            {schedule.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Yearly Loan Amortization Schedule
                </span>

                <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-card border-b border-border/80 text-muted-foreground font-bold z-10">
                      <tr>
                        <th className="py-2.5 px-4">Year</th>
                        <th className="py-2.5 px-4">Principal Paid</th>
                        <th className="py-2.5 px-4">Extra Prepayments</th>
                        <th className="py-2.5 px-4">Interest Paid</th>
                        <th className="py-2.5 px-4">Total Paid</th>
                        <th className="py-2.5 px-4">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 font-mono">
                      {schedule.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                          <td className="py-2.5 px-4 text-foreground font-semibold">Year {row.year}</td>
                          <td className="py-2.5 px-4 text-primary">{formatCurrency(row.principalPaid)}</td>
                          <td className="py-2.5 px-4 text-emerald-500 font-semibold">{formatCurrency(row.extraPaid)}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{formatCurrency(row.interestPaid)}</td>
                          <td className="py-2.5 px-4 text-foreground">{formatCurrency(row.totalPaid)}</td>
                          <td className="py-2.5 px-4 text-foreground font-semibold">{formatCurrency(row.remainingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <SEOContent
          title="Loan Calculator with Extra Payments - Amortization Planner"
          explanation="Analyze home, auto, or student loan balances dynamically. Our advanced loan calculator integrates standard amortization modeling with prepayment tracking, allowing users to test monthly extra payments and review total interest savings instantly."
          howToUse={[
            "Adjust the 'Loan Amount' slider to input your starting principal value.",
            "Choose standard interest rate percentages and specify the tenure duration in years or months.",
            "Slide the 'Extra Monthly Payment' controller to test how additional principal prepayments reduce your total interest and shorten your term.",
            "Review the generated yearly breakdown and savings analysis dynamically."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
