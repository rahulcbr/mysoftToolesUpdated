"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { DollarSign, LineChart, Calendar, Percent, BookOpen, TrendingUp, ShieldCheck } from "lucide-react";

export default function SipCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(500);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const [totalInvested, setTotalInvested] = useState(0);
  const [estimatedReturns, setEstimatedReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    recordRecentTool("calc-sip");
  }, []);

  useEffect(() => {
    const P = monthlyInvestment;
    const annualRate = returnRate;
    const years = timePeriod;

    if (P <= 0 || annualRate <= 0 || years <= 0) {
      setTotalInvested(0);
      setEstimatedReturns(0);
      setTotalValue(0);
      setSchedule([]);
      return;
    }

    const i = annualRate / 12 / 100;
    const n = years * 12;

    // SIP Future Value formula
    // FV = P * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
    const fv = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = P * n;
    const returns = fv - invested;

    setTotalInvested(invested);
    setEstimatedReturns(returns);
    setTotalValue(fv);

    // Generate year-on-year schedule
    const yearlySchedule = [];
    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      const yrFv = P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
      const yrInvested = P * months;
      const yrReturns = yrFv - yrInvested;

      yearlySchedule.push({
        year: y,
        invested: yrInvested,
        returns: yrReturns,
        value: yrFv,
      });
    }
    setSchedule(yearlySchedule);
  }, [monthlyInvestment, returnRate, timePeriod]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Pie Chart calculations
  const returnsRatio = totalValue > 0 ? (estimatedReturns / totalValue) * 100 : 0;
  const investedRatio = 100 - returnsRatio;
  const strokeDasharray = `${investedRatio} ${returnsRatio}`;

  const faqs = [
    {
      question: "What is a Systematic Investment Plan (SIP)?",
      answer: "A Systematic Investment Plan (SIP) is an investment route offered by mutual funds where you invest a fixed amount of money regularly (typically monthly) rather than in a lump sum. This leverages dollar-cost averaging and compound interest over time.",
    },
    {
      question: "How does compound interest work in a SIP?",
      answer: "Since you invest monthly, each installment gains returns. Those returns are reinvested and generate further returns in subsequent months. Over longer durations (e.g., 10+ years), compounding causes your wealth to grow exponentially, with return gains often dwarfing your actual invested principal.",
    },
    {
      question: "What returns can I expect from a typical mutual fund SIP?",
      answer: "Historically, equity-based index funds or mutual funds offer long-term average returns of 10% to 15% per annum, though past performance is not a guarantee of future returns. Adjust the rate slider to model conservative (e.g., 8%) or aggressive (e.g., 15%) scenarios.",
    },
  ];

  return (
    <ToolLayout toolId="calc-sip">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders Input Panel (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <LineChart className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">SIP parameters</h2>
              </div>

              {/* Monthly Investment Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Monthly Investment</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    <input
                      type="number"
                      value={monthlyInvestment}
                      onChange={(e) => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="10000"
                  step="50"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$10</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Return Rate Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Expected Return Rate (p.a.)</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <input
                      type="number"
                      step="0.5"
                      value={returnRate}
                      onChange={(e) => setReturnRate(Math.max(1, Number(e.target.value)))}
                      className="w-10 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                    <Percent className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Time Period Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Investment Period</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <input
                      type="number"
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(Math.max(1, Number(e.target.value)))}
                      className="w-10 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                    <span className="text-[10px] text-muted-foreground font-sans ml-1 font-normal">Years</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1 Yr</span>
                  <span>40 Yrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary & Graphics (Right) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Metrics Cards */}
              <div className="space-y-4">
                {/* Total Future Value */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" /> Future Wealth Estimate
                  </div>
                  <div className="text-2xl font-extrabold text-primary mt-1">
                    {formatCurrency(totalValue)}
                  </div>
                </div>

                {/* Invested vs Returns breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Invested</div>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {formatCurrency(totalInvested)}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Returns</div>
                    <div className="text-lg font-bold text-emerald-500 mt-1">
                      {formatCurrency(estimatedReturns)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div className="text-xs text-muted-foreground leading-snug">
                    Over {timePeriod} years, compound interest generates <strong>{formatCurrency(estimatedReturns)}</strong> in returns, making up <strong>{returnsRatio.toFixed(0)}%</strong> of your future wealth!
                  </div>
                </div>
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
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Returns</span>
                    <span className="text-sm font-extrabold text-primary">{returnsRatio.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[10px] font-bold w-full">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-muted rounded-full" />
                      <span>Invested Principal</span>
                    </div>
                    <span>{formatCurrency(totalInvested)}</span>
                  </div>
                  <div className="flex items-center justify-between text-primary">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      <span>Compound Interest</span>
                    </div>
                    <span>{formatCurrency(estimatedReturns)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Table */}
            {schedule.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Year-on-Year SIP Growth Breakdown
                </span>

                <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden max-h-[300px] overflow-y-auto font-mono">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-card border-b border-border/80 text-muted-foreground font-bold z-10 font-sans">
                      <tr>
                        <th className="py-2.5 px-4">Year</th>
                        <th className="py-2.5 px-4">Total Invested</th>
                        <th className="py-2.5 px-4">Estimated Returns</th>
                        <th className="py-2.5 px-4">Total Wealth Accumulation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {schedule.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                          <td className="py-2.5 px-4 text-foreground font-semibold">Year {row.year}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{formatCurrency(row.invested)}</td>
                          <td className="py-2.5 px-4 text-emerald-500">{formatCurrency(row.returns)}</td>
                          <td className="py-2.5 px-4 text-primary font-bold">{formatCurrency(row.value)}</td>
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
          title="SIP Calculator - Compound Interest Wealth Forecaster"
          explanation="Simulate Systematic Investment Plans (SIP) to estimate long-term mutual fund compounding. Instantly compute potential investment growths using variable rates, periodic contributions, and visual asset allocations."
          howToUse={[
            "Select your monthly regular investment amount using the sliders.",
            "Choose a target expected annual return percentage rate (such as 12% for standard index models).",
            "Set the timeframe duration in years and review final capital accumulations, net gains, and future compound values."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
