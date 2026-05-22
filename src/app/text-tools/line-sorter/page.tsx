"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, Settings } from "lucide-react";

export default function LineSorterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortType, setSortType] = useState<"alpha" | "numeric">("alpha");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);

  useEffect(() => {
    recordRecentTool("text-line-sorter");
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    let lines = input.split(/\r?\n/);

    if (trimLines) {
      lines = lines.map((line) => line.trim());
    }

    lines.sort((a, b) => {
      if (sortType === "numeric") {
        const numA = parseFloat(a.replace(/[^0-9.-]/g, "")) || 0;
        const numB = parseFloat(b.replace(/[^0-9.-]/g, "")) || 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      } else {
        const result = a.localeCompare(b, undefined, {
          sensitivity: caseSensitive ? "variant" : "base",
          numeric: true, // handles basic embedded numbers cleanly
        });
        return sortDirection === "asc" ? result : -result;
      }
    });

    setOutput(lines.join("\n"));
  }, [input, sortDirection, sortType, caseSensitive, trimLines]);

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
    a.download = "mysofttools-sorted-list.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "How does the numerical sorting filter operate?",
      answer: "When 'Numerical Sort' is checked, the script parses numerical sequences out of each line. Rows are then ordered by their actual floating point numbers instead of standard alphabetical order.",
    },
    {
      question: "Will formatting preserve empty lines?",
      answer: "Yes, though empty lines will gather at either the top or bottom of the list depending on your sorting direction (ascending vs descending).",
    },
    {
      question: "What is case sensitivity in sorting?",
      answer: "If Case Sensitive is checked, uppercase letters are sorted separately from lowercase letters (usually uppercase strings come first in UTF-8 code sequences). Otherwise, the comparison treats uppercase and lowercase characters identically.",
    },
  ];

  return (
    <ToolLayout toolId="text-line-sorter">
      <div className="space-y-8">
        {/* Settings panel */}
        <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
            <Settings className="w-4 h-4 text-primary" /> Sorting Settings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Direction</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSortDirection("asc")}
                  className={`py-1.5 rounded-lg border text-xs font-semibold ${
                    sortDirection === "asc" ? "bg-primary text-white border-primary" : "border-border bg-card text-foreground"
                  }`}
                >
                  Ascending (A-Z)
                </button>
                <button
                  onClick={() => setSortDirection("desc")}
                  className={`py-1.5 rounded-lg border text-xs font-semibold ${
                    sortDirection === "desc" ? "bg-primary text-white border-primary" : "border-border bg-card text-foreground"
                  }`}
                >
                  Descending (Z-A)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSortType("alpha")}
                  className={`py-1.5 rounded-lg border text-xs font-semibold ${
                    sortType === "alpha" ? "bg-primary text-white border-primary" : "border-border bg-card text-foreground"
                  }`}
                >
                  Alphabetical
                </button>
                <button
                  onClick={() => setSortType("numeric")}
                  className={`py-1.5 rounded-lg border text-xs font-semibold ${
                    sortType === "numeric" ? "bg-primary text-white border-primary" : "border-border bg-card text-foreground"
                  }`}
                >
                  Numerical
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2 pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  disabled={sortType === "numeric"}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 disabled:opacity-40"
                />
                <span className="text-xs font-semibold text-foreground">Case Sensitive</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trimLines}
                  onChange={(e) => setTrimLines(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                />
                <span className="text-xs font-semibold text-foreground">Trim Lines</span>
              </label>
            </div>
          </div>
        </div>

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original Text List</span>
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
                placeholder="Enter text strings, one line per item, to sort..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Sorted Result List</span>
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
                placeholder="Sorted lines will show up here automatically..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Line Sorter"
          explanation="Our free online Line Sorter organizes textual items in alphabetical or numerical lists. Perfect for cleaning up code config blocks, spreadsheet row indexes, or list arrays locally."
          howToUse={[
            "Paste your unsorted items (separated by newline splits) in the Left Input panel.",
            "Adjust parameters: toggle sorting directions (ascending A-Z, descending Z-A), sort mode (alphabetical or numerical), trim spaces, or case sensitivity rules.",
            "Copy your freshly ordered list from the Output panel or save it as a file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
