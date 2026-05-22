import React from "react";
import { Metadata } from "next";
import CategoryPage from "@/components/tools/CategoryPage";

export const metadata: Metadata = {
  title: "Online Text Tools - Formatters, Validators, Diff & Counters",
  description:
    "Free, instant text tools for developers and editors. JSON formatter, regex tester, word counter, diff checker, base64 encoder, line sorter, and slugify.",
  alternates: {
    canonical: "/text-tools",
  },
};

export default function TextToolsCategory() {
  const aboutText =
    "Our Text Tools section offers an extensive toolset for developers, copywriters, and system administrators. Instead of opening terminal scripts or pasting sensitive logs into unreliable websites, you can format JSON files, run regex pattern checks, count words, decode Base64 hashes, and inspect line differences locally. Every tool outputs results instantly as you type, and features a click-to-copy button to speed up your workflow.";

  const howToUse = [
    "Browse the tools grid and select the text utility you need.",
    "Paste your raw string or load text documents directly into the left input panel.",
    "The output updates in real-time on the right pane as you modify settings (like sorting filters or character conversions).",
    "Click the copy button to save the output text directly to your clipboard, or click download to save it as a text file.",
  ];

  const faqs = [
    {
      question: "Are my text logs, passwords, or code inputs secure?",
      answer:
        "Yes, 100%. All formatting, encoding, and sorting logic are processed purely on the client side. Your inputs are never transmitted, logged, or cached online.",
    },
    {
      question: "Does the JSON Formatter validate syntax errors?",
      answer:
        "Yes, our JSON Formatter parses your input and validates it against standard JSON syntax rules. If an error is detected, it highlights the exact line number and character range with a detailed error statement.",
    },
    {
      question: "How does the Diff Checker compare lines?",
      answer:
        "The Diff Checker uses a clean line-by-line comparing algorithm. It highlights added characters in green overlays and deleted rows in red overlays so you can track structural changes instantly.",
    },
    {
      question: "Is there a word count limit for the density checker?",
      answer:
        "No. You can paste full chapters or long articles. The keyword density checker will analyze the entire string and output a sorted table showing frequency counts and percentages.",
    },
  ];

  return (
    <CategoryPage
      categoryKey="text"
      aboutText={aboutText}
      howToUse={howToUse}
      faqs={faqs}
    />
  );
}
