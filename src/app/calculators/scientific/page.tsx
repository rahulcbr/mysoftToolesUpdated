"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Calculator, Clock, RotateCcw, HelpCircle, ShieldCheck } from "lucide-react";

export default function ScientificCalculatorPage() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [isRad, setIsRad] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState(0);
  const expressionEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recordRecentTool("calc-scientific");
    // Load history from localStorage
    const saved = localStorage.getItem("calc_scientific_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveHistory = (newHistory: string[]) => {
    setHistory(newHistory);
    localStorage.setItem("calc_scientific_history", JSON.stringify(newHistory));
  };

  const factorial = (num: number): number => {
    if (num < 0 || !Number.isInteger(num)) return NaN;
    if (num === 0 || num === 1) return 1;
    let val = 1;
    for (let i = 2; i <= Math.min(170, num); i++) {
      val *= i;
    }
    return val;
  };

  const calculate = (expr: string) => {
    if (!expr) return "0";
    try {
      // 1. Replace symbols with standard javascript Math
      let parsed = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/\^/g, "**")
        .replace(/sin\(/g, isRad ? "Math.sin(" : "Math.sin(Math.PI/180*")
        .replace(/cos\(/g, isRad ? "Math.cos(" : "Math.cos(Math.PI/180*")
        .replace(/tan\(/g, isRad ? "Math.tan(" : "Math.tan(Math.PI/180*")
        .replace(/asin\(/g, isRad ? "Math.asin(" : "180/Math.PI*Math.asin(")
        .replace(/acos\(/g, isRad ? "Math.acos(" : "180/Math.PI*Math.acos(")
        .replace(/atan\(/g, isRad ? "Math.atan(" : "180/Math.PI*Math.atan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/cbrt\(/g, "Math.cbrt(")
        .replace(/fact\(/g, "factorial(");

      // Balance parentheses automatically
      const openBrackets = (parsed.match(/\(/g) || []).length;
      const closeBrackets = (parsed.match(/\)/g) || []).length;
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        parsed += ")";
      }

      // Check for division by zero before evaluation
      if (/\/0(?!\d|\.\d)/.test(parsed)) {
        return "Error: Divide by 0";
      }

      // Evaluate safely
      const evalFunc = new Function("factorial", `return (${parsed})`);
      const val = evalFunc(factorial);

      if (val === undefined || isNaN(val) || !isFinite(val)) {
        return "Error";
      }

      // Precision control
      return Number(val.toFixed(10)).toString();
    } catch (e) {
      return "Error";
    }
  };

  const handleBtnClick = (val: string) => {
    if (val === "=") {
      if (!expression) return;
      const res = calculate(expression);
      if (res !== "Error" && !res.startsWith("Error:")) {
        saveHistory([`${expression} = ${res}`, ...history.slice(0, 19)]);
      }
      setResult(res);
    } else if (val === "AC") {
      setExpression("");
      setResult("0");
    } else if (val === "C") {
      setExpression((prev) => prev.slice(0, -1));
    } else if (val === "MC") {
      setMemory(0);
    } else if (val === "MR") {
      setExpression((prev) => prev + memory.toString());
    } else if (val === "M+") {
      const activeVal = Number(result);
      if (!isNaN(activeVal)) {
        setMemory((prev) => prev + activeVal);
      }
    } else if (val === "M-") {
      const activeVal = Number(result);
      if (!isNaN(activeVal)) {
        setMemory((prev) => prev - activeVal);
      }
    } else {
      // Append symbol to input
      setExpression((prev) => prev + val);
    }
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const appendHistoryToExpression = (item: string) => {
    const parts = item.split(" = ");
    if (parts.length > 0) {
      setExpression(parts[0]);
    }
  };

  const scientificKeys = [
    { label: "DEG/RAD", action: () => setIsRad(!isRad), status: isRad ? "RAD" : "DEG" },
    { label: "MC", action: () => handleBtnClick("MC") },
    { label: "MR", action: () => handleBtnClick("MR") },
    { label: "M+", action: () => handleBtnClick("M+") },
    { label: "M-", action: () => handleBtnClick("M-") },
    { label: "sin", action: () => handleBtnClick("sin(") },
    { label: "cos", action: () => handleBtnClick("cos(") },
    { label: "tan", action: () => handleBtnClick("tan(") },
    { label: "ln", action: () => handleBtnClick("ln(") },
    { label: "log", action: () => handleBtnClick("log(") },
    { label: "asin", action: () => handleBtnClick("asin(") },
    { label: "acos", action: () => handleBtnClick("acos(") },
    { label: "atan", action: () => handleBtnClick("atan(") },
    { label: "x!", action: () => handleBtnClick("fact(") },
    { label: "π", action: () => handleBtnClick("π") },
    { label: "xʸ", action: () => handleBtnClick("^") },
    { label: "x²", action: () => handleBtnClick("^2") },
    { label: "√", action: () => handleBtnClick("sqrt(") },
    { label: "³√", action: () => handleBtnClick("cbrt(") },
    { label: "e", action: () => handleBtnClick("e") },
  ];

  const standardKeys = [
    { label: "(", action: () => handleBtnClick("(") },
    { label: ")", action: () => handleBtnClick(")") },
    { label: "C", action: () => handleBtnClick("C"), className: "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" },
    { label: "AC", action: () => handleBtnClick("AC"), className: "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 font-bold" },
    
    { label: "7", action: () => handleBtnClick("7") },
    { label: "8", action: () => handleBtnClick("8") },
    { label: "9", action: () => handleBtnClick("9") },
    { label: "÷", action: () => handleBtnClick("÷"), className: "text-primary bg-primary/10" },
    
    { label: "4", action: () => handleBtnClick("4") },
    { label: "5", action: () => handleBtnClick("5") },
    { label: "6", action: () => handleBtnClick("6") },
    { label: "×", action: () => handleBtnClick("×"), className: "text-primary bg-primary/10" },
    
    { label: "1", action: () => handleBtnClick("1") },
    { label: "2", action: () => handleBtnClick("2") },
    { label: "3", action: () => handleBtnClick("3") },
    { label: "-", action: () => handleBtnClick("-"), className: "text-primary bg-primary/10" },
    
    { label: "0", action: () => handleBtnClick("0") },
    { label: ".", action: () => handleBtnClick(".") },
    { label: "=", action: () => handleBtnClick("="), className: "col-span-2 bg-primary text-primary-foreground font-bold hover:opacity-90" },
    { label: "+", action: () => handleBtnClick("+"), className: "text-primary bg-primary/10" },
  ];

  const faqs = [
    {
      question: "What is the difference between DEG and RAD modes?",
      answer: "DEG (Degrees) and RAD (Radians) represent two different units of measurement for angles. Trigonometric functions (sin, cos, tan) yield different values depending on the mode: for example, sin(90) in degrees is 1, whereas sin(90) in radians is approximately 0.893.",
    },
    {
      question: "How do parenthetical brackets help in evaluations?",
      answer: "Brackets override standard operator precedence rules (PEMDAS). For example, 2 * 3 + 4 evaluates to 10, whereas 2 * (3 + 4) forces the addition first, yielding 14. If you leave bracket pairs open, the calculator balances them automatically upon evaluation.",
    },
    {
      question: "Does the calculator support large factorials?",
      answer: "Yes, factorials are calculated iteratively. However, because javascript uses floating-point precision, factorials above 170 exceed numerical limits (Infinity). Values up to 170 are computed accurately.",
    },
  ];

  return (
    <ToolLayout toolId="calc-scientific">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Calculator Pad (Left) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 bg-card border border-border rounded-3xl shadow-lg space-y-4">
              {/* Screen Display */}
              <div className="p-5 bg-muted/30 border border-border/60 rounded-2xl flex flex-col items-end gap-1.5 min-h-[110px] justify-between relative overflow-hidden font-mono select-all">
                <div className="text-sm text-muted-foreground w-full text-right whitespace-nowrap overflow-x-auto scrollbar-thin">
                  {expression || "\u00A0"}
                </div>
                <div className="text-3xl font-extrabold text-primary w-full text-right whitespace-nowrap overflow-x-auto scrollbar-thin">
                  {result}
                </div>
                {/* Mode Indicator Overlay */}
                <div className="absolute top-2 left-3 text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full border border-border/40">
                  {isRad ? "RAD Mode" : "DEG Mode"}
                </div>
              </div>

              {/* Pad Layout: Grid with Scientific keys + Standard keys */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Scientific Function Keys (Left) */}
                <div className="md:col-span-5 grid grid-cols-5 md:grid-cols-2 gap-2 text-xs font-semibold">
                  {scientificKeys.map((key, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={key.action}
                      className={`py-3 rounded-xl border border-border/40 hover:bg-muted/10 transition-colors ${
                        key.label === "DEG/RAD" ? "bg-primary/5 text-primary" : "text-foreground"
                      }`}
                    >
                      {key.label === "DEG/RAD" ? key.status : key.label}
                    </button>
                  ))}
                </div>

                {/* Standard Math Keys (Right) */}
                <div className="md:col-span-7 grid grid-cols-4 gap-2 text-sm font-semibold">
                  {standardKeys.map((key, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={key.action}
                      className={`py-3 rounded-xl border border-border/40 transition-colors hover:bg-muted/10 ${
                        key.className || "text-foreground"
                      }`}
                    >
                      {key.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History Panel (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl shadow-sm flex flex-col h-full min-h-[350px] justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" /> Calculation History
                  </span>
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-[10px] text-rose-500 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <div className="flex flex-col justify-center items-center text-center py-12 text-muted-foreground gap-2">
                      <Calculator className="w-8 h-8 opacity-40 text-primary" />
                      <span className="text-xs">No recent calculations</span>
                    </div>
                  ) : (
                    history.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => appendHistoryToExpression(item)}
                        className="p-2.5 bg-muted/10 border border-border/40 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors text-right font-mono text-xs text-foreground group relative"
                        title="Click to load expression"
                      >
                        <div className="text-[10px] text-muted-foreground truncate group-hover:pr-6 transition-all">
                          {item.split(" = ")[0]}
                        </div>
                        <div className="font-bold text-primary text-sm mt-0.5">
                          {item.split(" = ")[1]}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5 mt-4">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-normal">
                  Our scientific calculator runs <strong>100% locally</strong> in your web browser. Expressions are evaluated securely using client-side mathematical parsers.
                </div>
              </div>
            </div>
          </div>
        </div>

        <SEOContent
          title="Online Scientific Calculator - Advanced Mathematical System"
          explanation="Solve trigonometric, exponential, parenthetical, and logarithmic equations with our full-featured scientific calculator. Instantly switch modes, clear buffers, review memory caches, and audit calculations."
          howToUse={[
            "Click DEG/RAD to toggle your mathematical angle mode.",
            "Use the standard numeric buttons and operations for basic arithmetic.",
            "Utilize the left scientific columns for advanced trigonometry (sin, cos, asin), logs (ln, log), powers, roots, or factorials.",
            "Click '=' to calculate, and tap any calculation item in the right log panel to reload it."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
