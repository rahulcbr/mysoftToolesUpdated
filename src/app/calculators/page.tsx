import React from "react";
import { Metadata } from "next";
import CategoryPage from "@/components/tools/CategoryPage";

export const metadata: Metadata = {
  title: "Online Calculators - Finance, Health, SIP & EMI Math",
  description:
    "Free calculators for finance, health, and math. Calculate home loan EMIs, GST tax rates, mutual fund SIP growths, body mass indices (BMI), and ages instantly.",
  alternates: {
    canonical: "/calculators",
  },
};

export default function CalculatorsCategory() {
  const aboutText =
    "Our comprehensive calculator system is designed to provide quick, reliable answers for financial planning, fitness tracking, and everyday mathematics. Whether you are budgeting a home loan using our EMI calculator, forecasting wealth gains using the compound interest SIP tool, checking health ratings with the BMI index, or working on complex math with the scientific calculator, MySoftTools delivers instant, formula-backed results. Each tool includes step-by-step mathematical breakdowns, standard equations, and worked examples to make calculations transparent and easy to understand.";

  const howToUse = [
    "Select the calculator of your choice from the categories list above.",
    "Fill in the input parameters (such as interest rates, principal sums, heights, or dates) using the sliders or numerical inputs.",
    "View instant results and breakdown charts that update automatically as you adjust inputs.",
    "Review the detailed explanation sections below the tool to understand the equations and formulas used.",
  ];

  const faqs = [
    {
      question: "Are the loan amortization schedules accurate?",
      answer:
        "Yes, our EMI and Loan calculators use standard bank amortization formulas to compute monthly repayments, total interest, and final balances. They match calculations used by financial institutions.",
    },
    {
      question: "How is BMI calculated?",
      answer:
        "The Body Mass Index is calculated by dividing your weight in kilograms by the square of your height in meters (or standard imperial units). The calculator classifies results based on World Health Organization guidelines.",
    },
    {
      question: "Can I print or save the amortization chart?",
      answer:
        "Yes, you can copy the computed tables or print the page directly using your browser's print options to save a PDF of the results.",
    },
  ];

  return (
    <CategoryPage
      categoryKey="calculator"
      aboutText={aboutText}
      howToUse={howToUse}
      faqs={faqs}
    />
  );
}
