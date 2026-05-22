"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { DollarSign, Landmark, Percent, Receipt, ShieldCheck } from "lucide-react";

export default function GstCalculatorPage() {
  const [baseAmount, setBaseAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const [action, setAction] = useState<"add" | "remove">("add");

  const [netAmount, setNetAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [grossAmount, setGrossAmount] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);

  useEffect(() => {
    recordRecentTool("calc-gst");
  }, []);

  useEffect(() => {
    const amt = baseAmount;
    const rate = gstRate;

    if (amt <= 0 || rate < 0) {
      setNetAmount(0);
      setGstAmount(0);
      setGrossAmount(0);
      setCgst(0);
      setSgst(0);
      return;
    }

    if (action === "add") {
      const calcGst = amt * (rate / 100);
      const gross = amt + calcGst;
      setNetAmount(amt);
      setGstAmount(calcGst);
      setGrossAmount(gross);
      setCgst(calcGst / 2);
      setSgst(calcGst / 2);
    } else {
      // Remove GST (amt is the gross amount containing GST)
      const net = amt / (1 + rate / 100);
      const calcGst = amt - net;
      setNetAmount(net);
      setGstAmount(calcGst);
      setGrossAmount(amt);
      setCgst(calcGst / 2);
      setSgst(calcGst / 2);
    }
  }, [baseAmount, gstRate, action]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const presetRates = [5, 12, 18, 28];

  const faqs = [
    {
      question: "What is the difference between adding and removing GST?",
      answer: "Adding GST calculates tax on top of your base price (Base + GST = Gross). Removing GST assumes your input price already includes the tax and works backwards to find the original pre-tax value (Gross / (1 + GST Rate) = Net Price).",
    },
    {
      question: "What are CGST and SGST?",
      answer: "In dual-GST tax structures (like India), the overall tax is divided equally between the Central Government (CGST - Central Goods and Services Tax) and the State Government (SGST - State Goods and Services Tax). Each receives exactly half of the total GST amount collected.",
    },
    {
      question: "How do I calculate GST manually?",
      answer: "To add GST: Multiply the net price by (GST % / 100) to find the tax, then add it to the net. To remove GST: Divide the gross price by (1 + GST % / 100) to find the net price, then subtract the net price from the gross price to get the tax amount.",
    },
  ];

  return (
    <ToolLayout toolId="calc-gst">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Receipt className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">GST Parameters</h2>
              </div>

              {/* Add vs Remove GST Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Tax Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/40">
                  <button
                    type="button"
                    onClick={() => setAction("add")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      action === "add"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    Add GST
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction("remove")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      action === "remove"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    Remove GST
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">
                    {action === "add" ? "Net Amount (Pre-Tax)" : "Gross Amount (Post-Tax)"}
                  </span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    <input
                      type="number"
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(Math.max(0, Number(e.target.value)))}
                      className="w-20 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50000"
                  step="50"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$10</span>
                  <span>$50,000</span>
                </div>
              </div>

              {/* GST Rate Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">GST rate (%)</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <input
                      type="number"
                      step="0.1"
                      value={gstRate}
                      onChange={(e) => setGstRate(Math.max(0, Number(e.target.value)))}
                      className="w-12 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                    <Percent className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {presetRates.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setGstRate(rate)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        gstRate === rate
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border/60 hover:bg-muted/10 text-muted-foreground"
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0%</span>
                  <span>40%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary (Right) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase">Detailed Invoice Breakdown</span>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full font-mono">
                  {gstRate}% GST Rate
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Net Amount Card */}
                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Net Amount</div>
                  <div className="text-lg font-extrabold text-foreground mt-1">
                    {formatCurrency(netAmount)}
                  </div>
                </div>

                {/* GST Amount Card */}
                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">GST Tax Owed</div>
                  <div className="text-lg font-extrabold text-primary mt-1">
                    {formatCurrency(gstAmount)}
                  </div>
                </div>

                {/* Gross Amount Card */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Gross Total</div>
                  <div className="text-lg font-extrabold text-primary mt-1">
                    {formatCurrency(grossAmount)}
                  </div>
                </div>
              </div>

              {/* CGST / SGST split details */}
              <div className="p-4 bg-card border border-border/60 rounded-2xl space-y-3 font-mono text-xs">
                <span className="font-sans font-bold text-foreground block">Federal & State Splits (50/50):</span>
                <div className="flex justify-between py-1.5 border-b border-border/20">
                  <span className="text-muted-foreground">Central GST (CGST)</span>
                  <span className="text-foreground font-semibold">{formatCurrency(cgst)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">State GST (SGST)</span>
                  <span className="text-foreground font-semibold">{formatCurrency(sgst)}</span>
                </div>
              </div>

              {/* Tax Formula Explanation Card */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-normal space-y-1">
                  <span className="font-bold text-foreground block">How it was calculated:</span>
                  {action === "add" ? (
                    <p>
                      GST of {gstRate}% was added to {formatCurrency(netAmount)}. <br />
                      Formula: <code className="bg-black/20 px-1 py-0.5 rounded text-foreground font-mono">{formatCurrency(netAmount)} * ({gstRate}/100) = {formatCurrency(gstAmount)}</code>.
                    </p>
                  ) : (
                    <p>
                      GST of {gstRate}% was extracted from {formatCurrency(grossAmount)}. <br />
                      Formula: <code className="bg-black/20 px-1 py-0.5 rounded text-foreground font-mono">{formatCurrency(grossAmount)} / (1 + {gstRate}/100) = {formatCurrency(netAmount)}</code>.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SEOContent
          title="Online GST Calculator - Add & Remove Tax Fractions"
          explanation="Quickly calculate net totals, tax components, and gross values using our Goods and Services Tax (GST) calculator. Toggle between adding or removing tax values, specify custom rates, and inspect CGST/SGST government splits."
          howToUse={[
            "Choose whether you want to 'Add GST' (tax additions) or 'Remove GST' (tax extractions).",
            "Input the base price sum in the invoice value range bar.",
            "Select standard preset tax percentages (5%, 12%, 18%, 28%) or drag the customized rate controller to view computed net totals, gross totals, and tax ratios."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
