"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, Type } from "lucide-react";

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeCase, setActiveCase] = useState<string>("sentence");

  useEffect(() => {
    recordRecentTool("text-case-converter");
  }, []);

  const convertCase = (text: string, style: string) => {
    if (!text) return "";
    switch (style) {
      case "upper":
        return text.toUpperCase();
      case "lower":
        return text.toLowerCase();
      case "sentence":
        return text
          .toLowerCase()
          .replace(/(^\s*|[.!?]\s+)([a-z])/g, (m) => m.toUpperCase());
      case "title":
        return text
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      case "camel":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
          .replace(/^[A-Z]/, (m) => m.toLowerCase());
      case "snake":
        return text
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");
      case "kebab":
        return text
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-]/g, "");
      default:
        return text;
    }
  };

  useEffect(() => {
    setOutput(convertCase(input, activeCase));
  }, [input, activeCase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setInput(clipboardText);
    } catch (_) {}
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mysofttools-${activeCase}case.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "How does the Sentence Case converter work?",
      answer: "The Sentence Case formatter splits your input paragraphs based on terminal punctuation marks (. ! ?) and capitalizes the first alphabetical character of each parsed sentence sequence, converting all other letters to lowercase.",
    },
    {
      question: "What is camelCase or kebab-case format used for?",
      answer: "These are programming casing standards. camelCase removes spaces and capitalizes each word boundary except the first (good for JavaScript variables). kebab-case joins lowercase terms with hyphens (ideal for URL slugs and CSS classnames). snake_case uses underscores.",
    },
    {
      question: "Will formatting preserve paragraphs and line breaks?",
      answer: "Yes, standard string spacing and page carriage returns are fully preserved across UPPER, lower, Sentence, and Title case formatting operations.",
    },
  ];

  const caseButtons = [
    { id: "sentence", label: "Sentence case" },
    { id: "lower", label: "lower case" },
    { id: "upper", label: "UPPER CASE" },
    { id: "title", label: "Title Case" },
    { id: "camel", label: "camelCase" },
    { id: "snake", label: "snake_case" },
    { id: "kebab", label: "kebab-case" },
  ];

  return (
    <ToolLayout toolId="text-case-converter">
      <div className="space-y-8">
        {/* Case Selector Buttons */}
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border border-border/50 rounded-2xl">
          {caseButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveCase(btn.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCase === btn.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "border border-border bg-card hover:bg-muted text-foreground"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Input Text</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors"
                >
                  <Clipboard className="w-3 h-3" /> Paste
                </button>
                <button
                  onClick={() => setInput("")}
                  className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-80 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Type or paste your text to transform casing..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Transformed Output</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
              <textarea
                readOnly
                value={output}
                className="w-full h-80 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="The casing-transformed text will appear here automatically..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Text Case Converter"
          explanation="Our free online Text Case Converter instantly shifts writing layouts between sentence case, UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case. Running client-side directly in browser memory, your pasted articles, code files, or variable labels are kept entirely safe."
          howToUse={[
            "Paste or type your text into the Input panel.",
            "Choose a formatting preset button on the top menu (e.g. Title Case, UPPER CASE, or camelCase).",
            "Copy the resulting string from the Output panel or download it as a text file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
