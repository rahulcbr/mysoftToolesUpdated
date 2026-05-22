"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { DollarSign, Landmark, Calendar, Percent, BookOpen } from "lucide-react";

export default function EmiCalculatorPage() {
  const [principal, setPrincipal] = useState(50000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(15);
  const [tenureType, setTenureType] = useState<"years" | "months">("years");

  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    recordRecentTool("calc-emi");
  }, []);

  useEffect(() => {
    const P = principal;
    const annualRate = interestRate;
    const N = tenureType === "years" ? tenure * 12 : tenure;

    if (P <= 0 || annualRate <= 0 || N <= 0) {
      setEmi(0);
      setTotalInterest(0);
      setTotalPayment(0);
      setSchedule([]);
      return;
    }

    const r = annualRate / 12 / 100;
    
    // Monthly EMI Calculation Formula
    const emiCalc = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    
    const totPay = emiCalc * N;
    const totInt = totPay - P;

    setEmi(emiCalc);
    setTotalInterest(totInt);
    setTotalPayment(totPay);

    // Amortization Schedule (Yearly Consolidation for readability)
    let balance = P;
    const yearlySchedule = [];
    let accumPrincipal = 0;
    let accumInterest = 0;

    for (let month = 1; month <= N; month++) {
      const monthInterest = balance * r;
      const monthPrincipal = emiCalc - monthInterest;
      balance = Math.max(0, balance - monthPrincipal);

      accumPrincipal += monthPrincipal;
      accumInterest += monthInterest;

      // Group by year (every 12 months) or at the end of the tenure
      if (month % 12 === 0 || month === N) {
        const yearNum = Math.ceil(month / 12);
        yearlySchedule.push({
          year: yearNum,
          principalPaid: accumPrincipal,
          interestPaid: accumInterest,
          totalPaid: accumPrincipal + accumInterest,
          remainingBalance: balance,
        });
        accumPrincipal = 0;
        accumInterest = 0;
      }
    }

    setSchedule(yearlySchedule);
  }, [principal, interestRate, tenure, tenureType]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Pie Chart calculations
  const interestRatio = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const principalRatio = 100 - interestRatio;
  const strokeDasharray = `${principalRatio} ${interestRatio}`;

  const faqs = [
    {
      question: "What is the standard EMI calculation formula?",
      answer: "The formula used to calculate Equated Monthly Installments (EMIs) is: EMI = [P x r x (1+r)^n] / [(1+r)^n - 1], where P represents the loan principal, r represents the monthly interest rate (annual interest rate divided by 12 and then divided by 100), and n represents the duration of the loan in months.",
    },
    {
      question: "What is the difference between Loan Principal and Interest?",
      answer: "The Loan Principal is the actual money you borrow from a lender. The Loan Interest is the fee charged by the lender for borrowing that money. Our calculator displays a breakdown showing how much of your total payment is going toward each component.",
    },
    {
      question: "Can I choose between a monthly and yearly amortization view?",
      answer: "To ensure readability across all devices (including mobile), we consolidate the monthly payments into a yearly amortization schedule, displaying how much principal and interest you pay off each calendar year.",
    },
  ];

  return (
    <ToolLayout toolId="calc-emi">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders Input Panel (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Landmark className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Loan Parameters</h2>
              </div>

              {/* Principal Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Loan Amount</span>
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
                  max="1000000"
                  step="5000"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$5,000</span>
                  <span>$1,000,000</span>
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
                        setTenure(e.target.value === "years" ? 15 : 180);
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
            </div>
          </div>

          {/* Results Summary & Pie Chart (Right) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Metrics Cards */}
              <div className="space-y-4">
                {/* Monthly EMI */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Monthly Repayments (EMI)
                  </div>
                  <div className="text-2xl font-extrabold text-primary mt-1">
                    {formatCurrency(emi)}
                  </div>
                </div>

                {/* Total Interest */}
                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Interest Payable</div>
                  <div className="text-xl font-bold text-foreground mt-1">
                    {formatCurrency(totalInterest)}
                  </div>
                </div>

                {/* Total Repayments */}
                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Amount Paid</div>
                  <div className="text-xl font-bold text-foreground mt-1">
                    {formatCurrency(totalPayment)}
                  </div>
                </div>
              </div>

              {/* Pie Chart Display */}
              <div className="p-5 bg-card border border-border rounded-3xl flex flex-col justify-center items-center gap-4">
                <div className="relative w-32 h-32">
                  {/* Clean SVG Donut Chart */}
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3.2"
                      strokeDasharray={`${principalRatio} ${interestRatio}`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Principal</span>
                    <span className="text-sm font-extrabold text-primary">{principalRatio.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-primary">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    <span>Principal: {formatCurrency(principal)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-2.5 h-2.5 bg-muted rounded-full" />
                    <span>Interest: {formatCurrency(totalInterest)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consolidate Amortization Schedule Table */}
            {schedule.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Yearly Repayment Amortization Schedule
                </span>

                <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-card border-b border-border/80 text-muted-foreground font-bold z-10 font-sans">
                      <tr>
                        <th className="py-2.5 px-4">Year</th>
                        <th className="py-2.5 px-4">Principal Paid</th>
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
          title="Online EMI Calculator - Loan Interest Breakdown"
          explanation="Our free online EMI Calculator computes loan interest distributions and amortization schedules instantly. Using sliders for loan metrics, it displays monthly Equated Monthly Installment payments alongside visual asset ratio guides."
          howToUse={[
            "Input your loan value inside the 'Loan Amount' slider.",
            "Adjust the yearly annual interest rate percentages using the sliders or input boxes.",
            "Select the loan tenure in either years or months, then inspect the monthly repayments, total interest owed, and yearly amortization table breakdown."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
