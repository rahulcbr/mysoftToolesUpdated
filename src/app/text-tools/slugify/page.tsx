"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, Link2 } from "lucide-react";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "by", "is", "are", "was", "were", "with", "as", "from"
]);

export default function SlugifyToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removeStops, setRemoveStops] = useState(false);
  const [delimiter, setDelimiter] = useState("-");
  const [lowercase, setLowercase] = useState(true);

  useEffect(() => {
    recordRecentTool("text-slugify");
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    let str = input;
    
    // Normalize diacritics (e.g. Café -> Cafe)
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (lowercase) {
      str = str.toLowerCase();
    }

    // Split into alphanumeric word blocks
    let words = str.split(/[^a-zA-Z0-9]+/i).filter(Boolean);

    // Optionally filter out common stop words
    if (removeStops) {
      words = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
    }

    setOutput(words.join(delimiter));
  }, [input, removeStops, delimiter, lowercase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output || input);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setInput(clipboardText);
    } catch (_) {}
  };

  const handleDownload = () => {
    const blob = new Blob([output || input], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mysofttools-url-slug.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "What is an SEO URL slug?",
      answer: "A slug is the human-readable, search-engine-friendly portion of a URL path that describes a page's content. It is typically lowercase, stripped of accents, and joined by hyphens (e.g. 'how-to-bake-cookies') to make it easy for search bots and users to understand.",
    },
    {
      question: "How does the diacritics stripping work?",
      answer: "Our converter normalizes Unicode strings by separating accents from characters (Decomposition) and then stripping the accent markers. This cleanly converts letters like 'é' to 'e', 'ü' to 'u', and 'ñ' to 'n', preventing garbage or percent-encoded characters from bloating your URLs.",
    },
    {
      question: "Should I remove stop words from my slugs?",
      answer: "It is often recommended for SEO. Removing filler words (like 'the', 'and', 'for') makes slugs shorter, punchier, and focuses search engines entirely on your primary keywords.",
    },
  ];

  return (
    <ToolLayout toolId="text-slugify">
      <div className="space-y-8">
        {/* Slug Options Box */}
        <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Link2 className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Slug Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Delimiter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value="">No Separator (none)</option>
                <option value=" ">Space ( )</option>
              </select>
            </div>

            {/* Checkbox Options */}
            <div className="flex flex-col justify-center space-y-2 sm:col-span-2">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeStops}
                    onChange={(e) => setRemoveStops(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-muted-foreground select-none">
                    Remove Stop Words (the, and, of...)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowercase}
                    onChange={(e) => setLowercase(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-muted-foreground select-none">
                    Force Lowercase
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Original Text / Title Input
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors"
                >
                  Paste
                </button>
                <button
                  onClick={() => setInput("")}
                  className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-red-500 flex items-center gap-1 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-48 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Type your post title here (e.g. 10 Best Tools in 2026!)..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Clean URL Slug Output
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden">
              <textarea
                readOnly
                value={output}
                className="w-full h-48 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Generated URL slug will appear here..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Online Text to Slug Converter"
          explanation="Our free online Text to Slug Converter is a lightweight URL formatter that structures page titles into clean, search-engine-friendly slugs. It cleans accent characters and structures links inside browser RAM."
          howToUse={[
            "Paste your article or page title inside the 'Original Text / Title Input' box.",
            "Toggle settings to remove stop words, modify delimiters, or enable case overrides.",
            "Instantly copy or download the finished slug from the output pane."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
