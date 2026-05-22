"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, Check, Settings } from "lucide-react";

export default function RemoveDuplicatesPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortLines, setSortLines] = useState(false);
  const [stats, setStats] = useState({ original: 0, unique: 0, removed: 0 });

  useEffect(() => {
    recordRecentTool("text-remove-duplicates");
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput("");
      setStats({ original: 0, unique: 0, removed: 0 });
      return;
    }

    const lines = input.split(/\r?\n/);
    const originalCount = lines.length;

    // Process lines
    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (let line of lines) {
      let processed = line;
      if (trimLines) {
        processed = processed.trim();
      }

      if (removeEmpty && processed === "") {
        continue;
      }

      const matchKey = caseSensitive ? processed : processed.toLowerCase();

      if (!seen.has(matchKey)) {
        seen.add(matchKey);
        uniqueLines.push(line); // keep original casing in output
      }
    }

    if (sortLines) {
      uniqueLines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: caseSensitive ? "variant" : "base" }));
    }

    setOutput(uniqueLines.join("\n"));
    setStats({
      original: originalCount,
      unique: uniqueLines.length,
      removed: originalCount - uniqueLines.length,
    });
  }, [input, caseSensitive, trimLines, removeEmpty, sortLines]);

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
    a.download = "mysofttools-unique-list.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "How are duplicate rows evaluated?",
      answer: "The algorithm splits your text input by newline parameters, checks each line sequence, and drops matching strings. You can toggle case sensitivity (distinguish 'Word' from 'word') and spaces stripping.",
    },
    {
      question: "Will empty lines be preserved in the output?",
      answer: "By default, the 'Remove Empty Lines' flag is enabled, which filters out blank lines. You can toggle this setting to preserve blank rows in your list.",
    },
    {
      question: "Is my list content safe?",
      answer: "Yes, 100%. The duplicate filter evaluates list elements directly inside your browser memory cache. Nothing is sent to external servers.",
    },
  ];

  return (
    <ToolLayout toolId="text-remove-duplicates">
      <div className="space-y-8">
        {/* Settings Bar */}
        <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
            <Settings className="w-4 h-4 text-primary" /> Adjustment Filters
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
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
              <span className="text-xs font-semibold text-foreground">Trim Whitespace</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
              <span className="text-xs font-semibold text-foreground">Remove Empty Lines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sortLines}
                onChange={(e) => setSortLines(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
              <span className="text-xs font-semibold text-foreground">Sort Alphabetically</span>
            </label>
          </div>
        </div>

        {/* Stats Grid */}
        {input && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl border border-border bg-card text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Original Lines</span>
              <p className="text-lg font-extrabold text-foreground">{stats.original}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Unique Lines</span>
              <p className="text-lg font-extrabold text-emerald-500">{stats.unique}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
              <span className="text-[10px] font-bold text-red-500 uppercase">Duplicates Removed</span>
              <p className="text-lg font-extrabold text-red-500">{stats.removed}</p>
            </div>
          </div>
        )}

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original List Input</span>
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
                placeholder="Paste lists containing duplicates, one item per line..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Filtered Unique List</span>
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
                placeholder="Filtered list containing unique elements will display here..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Duplicate Line Remover"
          explanation="Our free online Duplicate Line Remover scans your text list files and cleans repeating line row parameters in milliseconds. Ideal for database row audits, email queue sorting, or duplicate keyword removal."
          howToUse={[
            "Paste your text list (separated by line breaks) into the Original List Input pane.",
            "Tweak adjustment parameters: toggle case-sensitive keys, strip outer padding spacing, sort results, or filter blank lines.",
            "Copy the resulting unique list from the Output panel or save it as a text file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
