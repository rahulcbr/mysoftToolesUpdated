"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, Brush } from "lucide-react";

export default function RemoveSpacesToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [cleanMode, setCleanMode] = useState<"extra" | "all" | "trim" | "strip-lines" | "tabs-spaces">("extra");
  const [tabSize, setTabSize] = useState(4);

  useEffect(() => {
    recordRecentTool("text-remove-spaces");
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    let result = input;

    if (cleanMode === "extra") {
      // Replace multiple consecutive spaces with a single space (excluding newlines)
      result = input.replace(/[ \t]+/g, " ");
      // Clean multiple consecutive spaces on individual lines
      result = result.split("\n").map(line => line.replace(/ +/g, " ")).join("\n");
    } else if (cleanMode === "all") {
      // Remove all whitespaces completely (spaces, tabs, newlines)
      result = input.replace(/\s+/g, "");
    } else if (cleanMode === "trim") {
      // Trim leading/trailing whitespaces from each line
      result = input
        .split("\n")
        .map((line) => line.trim())
        .join("\n");
    } else if (cleanMode === "strip-lines") {
      // Remove all blank or empty lines
      result = input
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n");
    } else if (cleanMode === "tabs-spaces") {
      // Convert tabs to custom number of spaces
      const spaces = " ".repeat(tabSize);
      result = input.replace(/\t/g, spaces);
    }

    setOutput(result);
  }, [input, cleanMode, tabSize]);

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
    a.download = "mysofttools-clean-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "What does the 'Remove Extra Spaces' mode do?",
      answer: "It shrinks multiple consecutive spaces or tabs down to a single space character, helping clean up accidental spacing inside sentences without altering line boundaries or paragraph breaks.",
    },
    {
      question: "How does the tabs-to-spaces converter work?",
      answer: "It scans your input for tab escape tokens (`\\t`) and replaces each of them with a matching block of spaces. You can customize the replacement width between 2, 4, or 8 spaces using the width slider.",
    },
    {
      question: "Is this tool safe for coding or formatted scripts?",
      answer: "Yes, provided you select the correct mode. If you are cleaning up indentation in files like Python, choose 'Remove Extra Spaces' or 'Trim Ends' selectively rather than 'Remove All Spaces' which would strip essential formatting.",
    },
  ];

  return (
    <ToolLayout toolId="text-remove-spaces">
      <div className="space-y-8">
        {/* Cleaner Mode Controls */}
        <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Brush className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Whitespace Cleanup Options</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Cleaner type buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCleanMode("extra")}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  cleanMode === "extra"
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-muted/10 border-border/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                Collapse Extra Spaces
              </button>
              <button
                onClick={() => setCleanMode("trim")}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  cleanMode === "trim"
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-muted/10 border-border/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                Trim Line Borders
              </button>
              <button
                onClick={() => setCleanMode("strip-lines")}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  cleanMode === "strip-lines"
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-muted/10 border-border/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                Strip Empty Lines
              </button>
              <button
                onClick={() => setCleanMode("tabs-spaces")}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  cleanMode === "tabs-spaces"
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-muted/10 border-border/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                Tabs to Spaces
              </button>
              <button
                onClick={() => setCleanMode("all")}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  cleanMode === "all"
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-muted/10 border-border/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                Remove All Whitespaces
              </button>
            </div>

            {/* Tab size slider (if tabs-spaces active) */}
            {cleanMode === "tabs-spaces" && (
              <div className="flex items-center gap-3 w-full sm:w-auto p-2 bg-muted/20 border border-border/60 rounded-xl">
                <span className="text-xs font-bold text-muted-foreground">Spaces:</span>
                <select
                  value={tabSize}
                  onChange={(e) => setTabSize(Number(e.target.value))}
                  className="bg-card border border-border rounded-lg text-xs font-semibold px-2 py-1 focus:outline-none"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>
            )}
          </div>
        </div>

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
                placeholder="Type or paste messy text spacing here..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Cleaned Output Text
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
                placeholder="Cleaned text will appear here..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Online Extra Spaces Remover"
          explanation="Our free online Remove Extra Spaces tool helps you clean messy whitespaces, tabs, double spacing, and empty lines instantly. Computations run locally inside your browser memory, keeping your documents 100% private."
          howToUse={[
            "Paste your target text inside the 'Original Text Input' panel.",
            "Choose your cleanup option: Collapse Extra Spaces, Trim Line Borders, Strip Empty Lines, Tabs to Spaces, or Remove All Whitespaces.",
            "Review the real-time sanitized output in the right panel, then click Copy or Download."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
