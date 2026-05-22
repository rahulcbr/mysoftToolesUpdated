"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { DollarSign, Tag, Percent, Receipt, ShieldCheck } from "lucide-react";

export default function DiscountCalculatorPage() {
  const [originalPrice, setOriginalPrice] = useState(100);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [stackedDiscount, setStackedDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(8);

  const [salePrice, setSalePrice] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    recordRecentTool("calc-discount");
  }, []);

  useEffect(() => {
    const orig = originalPrice;
    const disc1 = discountPercent;
    const disc2 = stackedDiscount;
    const tax = taxRate;

    if (orig <= 0) {
      setSalePrice(0);
      setSavingsAmount(0);
      setTaxAmount(0);
      setFinalPrice(0);
      return;
    }

    // Apply first discount
    const priceAfterDisc1 = orig * (1 - disc1 / 100);
    
    // Apply second stacked discount if present
    const priceAfterDisc2 = priceAfterDisc1 * (1 - disc2 / 100);

    // Calculate tax
    const calcTax = priceAfterDisc2 * (tax / 100);
    const final = priceAfterDisc2 + calcTax;
    const savings = orig - priceAfterDisc2;

    setSalePrice(priceAfterDisc2);
    setSavingsAmount(savings);
    setTaxAmount(calcTax);
    setFinalPrice(final);
  }, [originalPrice, discountPercent, stackedDiscount, taxRate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const savingsPercent = originalPrice > 0 ? (savingsAmount / originalPrice) * 100 : 0;
  const finalPercent = originalPrice > 0 ? (finalPrice / originalPrice) * 100 : 0;

  const faqs = [
    {
      question: "How do stacked or double discounts work?",
      answer: "Stacked discounts do not simply add up. If a product is '20% off plus an extra 10% off', the first 20% discount is applied to the original price, and then the 10% discount is applied to that new, lower discounted price. This is standard retail practice.",
    },
    {
      question: "Why is sales tax calculated after the discount?",
      answer: "In almost all jurisdictions, sales tax is legally calculated on the final transaction amount (the actual sale price paid by the customer) rather than the manufacturer's suggested retail price (MSRP) before discounts.",
    },
    {
      question: "What is the formula to calculate a discount?",
      answer: "The simple formula is: Sale Price = Original Price - (Original Price * (Discount Rate / 100)). To find the final price including tax: Final Price = Sale Price * (1 + (Tax Rate / 100)).",
    },
  ];

  return (
    <ToolLayout toolId="calc-discount">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Tag className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Discount & Sale Parameters</h2>
              </div>

              {/* Original Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Original Price</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10000"
                  step="5"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$5</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Discount (%)</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                      className="w-10 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                    <Percent className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Stacked Discount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Additional Discount (% stacked)</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <input
                      type="number"
                      value={stackedDiscount}
                      onChange={(e) => setStackedDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-10 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                    <Percent className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={stackedDiscount}
                  onChange={(e) => setStackedDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0% (None)</span>
                  <span>90%</span>
                </div>
              </div>

              {/* Tax Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Tax Rate (%)</span>
                  <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))}
                      className="w-10 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                    />
                    <Percent className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0%</span>
                  <span>25%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary (Right) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase">Final Checkout Price</span>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full font-mono">
                  Save {savingsPercent.toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sale Price Card */}
                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Sale Price (Pre-Tax)</div>
                  <div className="text-xl font-extrabold text-foreground mt-1">
                    {formatCurrency(salePrice)}
                  </div>
                </div>

                {/* Savings Card */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase">You Save (Total)</div>
                  <div className="text-xl font-extrabold text-emerald-500 mt-1">
                    {formatCurrency(savingsAmount)}
                  </div>
                </div>

                {/* Tax Amount Card */}
                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Sales Tax ({taxRate}%)</div>
                  <div className="text-xl font-extrabold text-foreground mt-1">
                    {formatCurrency(taxAmount)}
                  </div>
                </div>

                {/* Final Price Card */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="text-[10px] font-bold text-primary uppercase">Final Checkout Cost</div>
                  <div className="text-xl font-extrabold text-primary mt-1">
                    {formatCurrency(finalPrice)}
                  </div>
                </div>
              </div>

              {/* Price visual progress compare */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Sale Price: {formatCurrency(finalPrice)}</span>
                  <span>Original Price: {formatCurrency(originalPrice)}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.max(5, Math.min(100, finalPercent))}%` }}
                    className="bg-primary h-full transition-all duration-300"
                  />
                  <div
                    style={{ width: `${Math.max(0, Math.min(100, savingsPercent))}%` }}
                    className="bg-emerald-500/40 h-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Dynamic discount logic explanation */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-normal space-y-1">
                  <span className="font-bold text-foreground block">How it was calculated:</span>
                  <p>
                    Original Price of {formatCurrency(originalPrice)} was reduced by {discountPercent}%.
                    {stackedDiscount > 0 && ` Then, an additional stacked discount of ${stackedDiscount}% was applied to the sale price of ${formatCurrency(originalPrice * (1 - discountPercent / 100))}.`}
                    {taxRate > 0 && ` Lastly, ${taxRate}% sales tax (${formatCurrency(taxAmount)}) was added to the final price.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SEOContent
          title="Discount & Savings Calculator - Checkout Estimator"
          explanation="Quickly calculate retail markdowns, savings values, double discount promotions, and checkout sales taxes with our interactive discount calculator. Easily visualize discount proportions on comparison bars."
          howToUse={[
            "Input the sticker original value of the item.",
            "Adjust the primary discount slider rate to reflect the store markdown percentage.",
            "Use the stacked additional discount rate for clearance bonuses or loyalty coupon stacks.",
            "Add local sales taxes to view your total checkout price, total discount savings, and tax proportions."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
