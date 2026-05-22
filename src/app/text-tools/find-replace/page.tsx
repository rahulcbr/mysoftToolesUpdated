"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, Search } from "lucide-react";

export default function FindReplaceToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWords, setWholeWords] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recordRecentTool("text-find-replace");
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput("");
      setError(null);
      return;
    }

    if (!findText) {
      setOutput(input);
      setError(null);
      return;
    }

    try {
      setError(null);
      let result = "";

      if (useRegex) {
        // Regex Search Mode
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(findText, flags);
        result = input.replace(regex, replaceText);
      } else {
        // Standard String Search Mode
        let searchPattern = findText;
        if (wholeWords) {
          // Escape regex characters for exact string matching inside word boundaries
          const escaped = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          searchPattern = `\\b${escaped}\\b`;
          const flags = caseSensitive ? "g" : "gi";
          const regex = new RegExp(searchPattern, flags);
          result = input.replace(regex, replaceText);
        } else {
          // Standard string replacement
          if (caseSensitive) {
            result = input.replaceAll(searchPattern, replaceText);
          } else {
            // Case-insensitive non-regex replacement using RegExp
            const escaped = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            const regex = new RegExp(escaped, "gi");
            result = input.replace(regex, replaceText);
          }
        }
      }

      setOutput(result);
    } catch (err: any) {
      setOutput("");
      setError(err.message || "Invalid regular expression pattern.");
    }
  }, [input, findText, replaceText, caseSensitive, wholeWords, useRegex]);

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
    a.download = "mysofttools-replaced-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "What is Case-Sensitive matching?",
      answer: "Case-sensitive matching ensures that only strings that exactly match the lowercase and uppercase letters of your 'Find' search query are replaced (e.g. searching 'apple' will not match or replace 'Apple').",
    },
    {
      question: "What does 'Whole Words Only' do?",
      answer: "Whole words matching wraps the search query in word boundaries (\\b) so that it only replaces standalone words. For example, finding 'cat' with whole words enabled will replace 'cat' but leave words like 'category' or 'concatenate' completely untouched.",
    },
    {
      question: "How does the Regular Expression replacement mode work?",
      answer: "If 'Use Regular Expression' is checked, the 'Find' field is parsed as a regular expression pattern. This allows you to perform complex structural replacements (e.g. using `\\s+` to replace multiple whitespaces or matching specific digits). Capture groups can also be referenced in the 'Replace' input using `$1`, `$2` symbols.",
    },
  ];

  return (
    <ToolLayout toolId="text-find-replace">
      <div className="space-y-8">
        {/* Find & Replace Controls Box */}
        <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Search className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Search & Replace Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Find input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Find Text</label>
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder={useRegex ? "Regex pattern (e.g. \\d+)" : "String to find..."}
                className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {/* Replace input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Replace With</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Text to replace it with..."
                className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Settings checkboxes */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-border/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground select-none">
                Case Sensitive
              </span>
            </label>

            {!useRegex && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wholeWords}
                  onChange={(e) => setWholeWords(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-muted-foreground select-none">
                  Whole Words Only
                </span>
              </label>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground select-none">
                Use Regular Expressions
              </span>
            </label>
          </div>
        </div>

        {/* Regular Expression Error warning */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/5 text-xs text-red-500 font-mono">
            <strong>Regex Error:</strong> {error}
          </div>
        )}

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Original Text Input
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
                className="w-full h-80 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Type or paste target text here..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Replaced Text Output
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
                className="w-full h-80 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Replaced output text will appear here..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Online Find & Replace Tool"
          explanation="Our free online Find & Replace tool scans your text inputs to substitute matching terms and strings instantly. Featuring regex parsing, case-sensitivity toggles, and word-boundary filters, it computes replacements completely in-browser."
          howToUse={[
            "Paste your target text inside the 'Original Text Input' panel.",
            "Write the term you want to locate in the 'Find Text' box and the new string in the 'Replace With' box.",
            "Configure case-sensitivity, whole word boundaries, or regular expression matching as desired.",
            "The output panel updates in real-time. Copy or download the results instantly."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
