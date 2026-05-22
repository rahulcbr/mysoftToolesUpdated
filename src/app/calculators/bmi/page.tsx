"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Scale, Heart, ShieldCheck, Activity } from "lucide-react";

export default function BmiCalculatorPage() {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  
  // Metric state
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);

  // Imperial state
  const [weightLbs, setWeightLbs] = useState(154);
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(9);

  const [bmi, setBmi] = useState(0);
  const [category, setCategory] = useState("");
  const [categoryColor, setCategoryColor] = useState("");
  const [categoryAdvice, setCategoryAdvice] = useState("");

  useEffect(() => {
    recordRecentTool("calc-bmi");
  }, []);

  useEffect(() => {
    let calculatedBmi = 0;

    if (unitSystem === "metric") {
      const heightMeters = heightCm / 100;
      if (heightMeters > 0 && weightKg > 0) {
        calculatedBmi = weightKg / (heightMeters * heightMeters);
      }
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      if (totalInches > 0 && weightLbs > 0) {
        calculatedBmi = (weightLbs * 703) / (totalInches * totalInches);
      }
    }

    setBmi(calculatedBmi);

    // WHO Standard Classifications
    if (calculatedBmi <= 0) {
      setCategory("");
      setCategoryColor("");
      setCategoryAdvice("");
    } else if (calculatedBmi < 18.5) {
      setCategory("Underweight");
      setCategoryColor("text-sky-500 bg-sky-500/10 border-sky-500/20");
      setCategoryAdvice("A BMI below 18.5 indicates that you may be underweight. It is recommended to consult a healthcare provider to check for nutritional balance or underlying factors.");
    } else if (calculatedBmi < 25) {
      setCategory("Normal Weight");
      setCategoryColor("text-emerald-500 bg-emerald-500/10 border-emerald-500/20");
      setCategoryAdvice("Your BMI falls in the ideal range of 18.5 to 24.9. Maintaining this level through a balanced diet and regular physical activity reduces cardiovascular risks.");
    } else if (calculatedBmi < 30) {
      setCategory("Overweight");
      setCategoryColor("text-amber-500 bg-amber-500/10 border-amber-500/20");
      setCategoryAdvice("A BMI between 25.0 and 29.9 is classified as overweight. Incorporating healthy portion controls and routine aerobic exercises can help guide your index back toward standard levels.");
    } else {
      setCategory("Obese");
      setCategoryColor("text-rose-500 bg-rose-500/10 border-rose-500/20");
      setCategoryAdvice("A BMI of 30 or greater is classified as obese. Consulting a general practitioner or nutritionist for personalized wellness programs is highly recommended.");
    }
  }, [unitSystem, weightKg, heightCm, weightLbs, heightFeet, heightInches]);

  // Sync weight & heights between systems for user convenience
  const handleSystemToggle = (sys: "metric" | "imperial") => {
    if (sys === unitSystem) return;

    if (sys === "imperial") {
      // Metric to Imperial conversions
      const lbs = Math.round(weightKg * 2.20462);
      const totalInches = heightCm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);

      setWeightLbs(lbs);
      setHeightFeet(ft);
      setHeightInches(inches);
    } else {
      // Imperial to Metric conversions
      const totalInches = heightFeet * 12 + heightInches;
      const kg = Math.round(weightLbs / 2.20462);
      const cm = Math.round(totalInches * 2.54);

      setWeightKg(kg);
      setHeightCm(cm);
    }
    setUnitSystem(sys);
  };

  // Convert BMI value to percentage on a visual scale (BMI 15 to 40)
  const getGaugePercentage = () => {
    const minBmi = 15;
    const maxBmi = 40;
    const pct = ((bmi - minBmi) / (maxBmi - minBmi)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const faqs = [
    {
      question: "Is BMI a reliable indicator of health?",
      answer: "BMI is a quick screening tool that measures weight relative to height. While it correlates well with body fat and metabolic risk factors for most people, it does have limitations: it cannot differentiate between muscle weight and fat weight, making it less accurate for professional athletes or bodybuilders.",
    },
    {
      question: "What is the standard weight classification scale?",
      answer: "Based on WHO metrics: Underweight is below 18.5, Normal weight is 18.5–24.9, Overweight is 25.0–29.9, and Obese is 30.0 and above.",
    },
    {
      question: "How can I calculate BMI manually?",
      answer: "In Metric: BMI = Weight (kg) / Height² (meters). In Imperial: BMI = [Weight (lbs) * 703] / Height² (inches).",
    },
  ];

  return (
    <ToolLayout toolId="calc-bmi">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Scale className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Body Metrics</h2>
              </div>

              {/* Unit System Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Unit System</label>
                <div className="grid grid-cols-2 gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/40">
                  <button
                    type="button"
                    onClick={() => handleSystemToggle("metric")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      unitSystem === "metric"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    Metric (kg / cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSystemToggle("imperial")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      unitSystem === "imperial"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    Imperial (lbs / ft-in)
                  </button>
                </div>
              </div>

              {/* Height Inputs */}
              {unitSystem === "metric" ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground uppercase">Height (cm)</span>
                    <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value)))}
                        className="w-12 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                      />
                      <span className="ml-1 font-normal text-muted-foreground">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    step="1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>100 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase block">Height</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center bg-muted/20 border border-border px-2.5 py-1.5 rounded-xl font-mono font-bold">
                        <span className="text-[10px] text-muted-foreground uppercase">Feet</span>
                        <input
                          type="number"
                          value={heightFeet}
                          onChange={(e) => setHeightFeet(Math.max(1, Number(e.target.value)))}
                          className="w-8 bg-transparent border-none outline-none focus:ring-0 text-right p-0 text-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center bg-muted/20 border border-border px-2.5 py-1.5 rounded-xl font-mono font-bold">
                        <span className="text-[10px] text-muted-foreground uppercase">Inches</span>
                        <input
                          type="number"
                          value={heightInches}
                          onChange={(e) => setHeightInches(Math.max(0, Math.min(11, Number(e.target.value))))}
                          className="w-8 bg-transparent border-none outline-none focus:ring-0 text-right p-0 text-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Weight Inputs */}
              {unitSystem === "metric" ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground uppercase">Weight (kg)</span>
                    <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                      <input
                        type="number"
                        value={weightKg}
                        onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
                        className="w-12 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                      />
                      <span className="ml-1 font-normal text-muted-foreground">kg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>30 kg</span>
                    <span>180 kg</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground uppercase">Weight (lbs)</span>
                    <div className="flex items-center bg-muted/20 border border-border px-2.5 py-1 rounded-xl font-mono font-bold text-primary">
                      <input
                        type="number"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(Math.max(1, Number(e.target.value)))}
                        className="w-12 bg-transparent border-none outline-none focus:ring-0 text-right p-0"
                      />
                      <span className="ml-1 font-normal text-muted-foreground">lbs</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="400"
                    step="1"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>60 lbs</span>
                    <span>400 lbs</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary & Gauge (Right) */}
          <div className="lg:col-span-7 space-y-6 font-sans">
            <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase">BMI Evaluation Results</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-primary bg-primary/10">
                  <Activity className="w-3.5 h-3.5" /> Healthy Index
                </span>
              </div>

              {/* BMI score card & classification */}
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="p-5 bg-muted/20 border border-border/60 rounded-3xl flex flex-col justify-center items-center text-center w-40 shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Your BMI score</span>
                  <span className="text-4xl font-extrabold text-primary mt-1 font-mono">{bmi.toFixed(1)}</span>
                </div>

                <div className="space-y-2">
                  <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-xl border ${categoryColor}`}>
                    {category}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {categoryAdvice}
                  </p>
                </div>
              </div>

              {/* Meter Gauge Slider */}
              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WHO Metric Category Gauge</span>
                
                {/* Horizontal scale */}
                <div className="relative pt-6">
                  {/* Pointer Needle */}
                  <div
                    style={{ left: `${getGaugePercentage()}%` }}
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center gap-0.5 transition-all duration-300 z-10"
                  >
                    <span className="text-[10px] font-mono font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded shadow-md">
                      {bmi.toFixed(1)}
                    </span>
                    <div className="w-0.5 h-6 bg-primary" />
                  </div>

                  {/* Horizontal gauge bar */}
                  <div className="w-full h-4 rounded-full overflow-hidden flex text-[8px] font-bold text-white text-center leading-4 select-none">
                    <div className="w-[14%] bg-sky-500" title="Underweight (<18.5)">
                      &lt;18.5
                    </div>
                    <div className="w-[26%] bg-emerald-500" title="Normal (18.5 - 24.9)">
                      18.5-25
                    </div>
                    <div className="w-[20%] bg-amber-500" title="Overweight (25 - 29.9)">
                      25-30
                    </div>
                    <div className="w-[40%] bg-rose-500" title="Obese (>=30)">
                      &gt;30
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric values breakdown table */}
              <div className="p-4 bg-card border border-border/60 rounded-2xl space-y-2 font-mono text-xs">
                <span className="font-sans font-bold text-foreground block">BMI Reference Classifications:</span>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border/20 text-muted-foreground text-left">
                      <th className="py-1">Classification</th>
                      <th className="py-1">BMI Range (kg/m²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/10">
                      <td className="py-1.5 text-sky-500 font-semibold">Underweight</td>
                      <td className="py-1.5">&lt; 18.5</td>
                    </tr>
                    <tr className="border-b border-border/10">
                      <td className="py-1.5 text-emerald-500 font-semibold">Normal Weight</td>
                      <td className="py-1.5">18.5 – 24.9</td>
                    </tr>
                    <tr className="border-b border-border/10">
                      <td className="py-1.5 text-amber-500 font-semibold">Overweight</td>
                      <td className="py-1.5">25.0 – 29.9</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-rose-500 font-semibold">Obese</td>
                      <td className="py-1.5">&ge; 30.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <SEOContent
          title="Online BMI Calculator - Body Mass Index Evaluation"
          explanation="Compute your Body Mass Index (BMI) using standard WHO guidelines. Toggle between metric (kg/cm) and imperial (lbs/ft-in) parameters to evaluate body ratings instantly with visual health category sliders."
          howToUse={[
            "Choose either Metric or Imperial input modes.",
            "Adjust your height values using sliders or precision manual inputs.",
            "Enter your weight metrics, then review the calculated BMI score, health categorization advice, and needle position on the indicator gauge."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
