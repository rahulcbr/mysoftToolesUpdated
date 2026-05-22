"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Calculator, Key } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface SEOContentProps {
  title: string;
  subtitle?: string;
  howToUse: string[];
  formula?: string;
  formulaDescription?: string;
  explanation: string;
  faqs: FAQItem[];
}

export default function SEOContent({
  title,
  subtitle,
  howToUse,
  formula,
  formulaDescription,
  explanation,
  faqs,
}: SEOContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Compile JSON-LD schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <section className="mt-12 md:mt-20 border-t border-border/60 pt-10 space-y-12">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Main SEO Explanation */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          About {title}
        </h2>
        {subtitle && <p className="text-sm font-semibold text-primary">{subtitle}</p>}
        <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-3">
          <p>{explanation}</p>
        </div>
      </div>

      {/* How to Use Block */}
      <div className="p-6 md:p-8 rounded-3xl bg-muted/30 border border-border/50 space-y-4">
        <h3 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> How to use {title}
        </h3>
        <ol className="list-decimal pl-5 space-y-2.5 text-sm md:text-base text-muted-foreground">
          {howToUse.map((step, idx) => (
            <li key={idx} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Formula block if available */}
      {formula && (
        <div className="p-6 md:p-8 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
          <h3 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" /> Mathematical Formula & Logic
          </h3>
          <div className="bg-background border border-border/80 rounded-2xl p-4 md:p-6 text-center font-mono text-base md:text-lg text-primary select-all overflow-x-auto shadow-sm">
            {formula}
          </div>
          {formulaDescription && (
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {formulaDescription}
            </p>
          )}
        </div>
      )}

      {/* FAQ Accordion Block */}
      <div className="space-y-4">
        <h3 className="text-lg md:text-xl font-extrabold text-foreground flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-border/50 rounded-2xl overflow-hidden bg-card hover:border-border transition-colors duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm md:text-base text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1.5 text-sm md:text-base text-muted-foreground leading-relaxed border-t border-border/30 bg-muted/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
