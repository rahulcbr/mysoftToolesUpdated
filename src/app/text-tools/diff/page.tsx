"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Plus, Minus, Eye, GitCompare, LayoutGrid, LayoutList } from "lucide-react";

interface AlignedLine {
  original: {
    type: "removed" | "empty" | "unchanged";
    text: string;
    lineNum?: number;
  };
  modified: {
    type: "added" | "empty" | "unchanged";
    text: string;
    lineNum?: number;
  };
}

export default function DiffToolPage() {
  const [textA, setTextA] = useState(
    `This is the original text.
It contains some lines of data.
We will edit this line soon.
This line will stay unchanged.
Goodbye original styling!`
  );
  const [textB, setTextB] = useState(
    `This is the modified text.
It contains some lines of data.
We edited this line completely.
This line will stay unchanged.
Hello new glassmorphic styling!
This is a newly added line at the bottom.`
  );

  const [alignedLines, setAlignedLines] = useState<AlignedLine[]>([]);
  const [viewType, setViewType] = useState<"split" | "unified">("split");
  const [diffStats, setDiffStats] = useState({ additions: 0, deletions: 0 });

  useEffect(() => {
    recordRecentTool("text-diff");
  }, []);

  useEffect(() => {
    const original = textA.split("\n");
    const modified = textB.split("\n");
    const n = original.length;
    const m = modified.length;

    // LCS Table formulation
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (original[i - 1] === modified[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const aligned: AlignedLine[] = [];
    let i = n;
    let j = m;
    let additions = 0;
    let deletions = 0;

    // Backtrack to assemble aligned lines
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
        aligned.unshift({
          original: { type: "unchanged", text: original[i - 1], lineNum: i },
          modified: { type: "unchanged", text: modified[j - 1], lineNum: j },
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        aligned.unshift({
          original: { type: "empty", text: "" },
          modified: { type: "added", text: modified[j - 1], lineNum: j },
        });
        additions++;
        j--;
      } else {
        aligned.unshift({
          original: { type: "removed", text: original[i - 1], lineNum: i },
          modified: { type: "empty", text: "" },
        });
        deletions++;
        i--;
      }
    }

    setAlignedLines(aligned);
    setDiffStats({ additions, deletions });
  }, [textA, textB]);

  const faqs = [
    {
      question: "How does the side-by-side split view work?",
      answer: "The side-by-side split view runs a Longest Common Subsequence (LCS) algorithm to map lines in both files. When it finds a deletion, it renders a spacer row in the modified panel; when it finds an addition, it renders a spacer row in the original panel. This keeps matching rows perfectly aligned horizontally.",
    },
    {
      question: "What is the difference between Split and Unified view?",
      answer: "Split view displays the original text on the left and modified text on the right side-by-side. Unified view merges both texts chronologically into a single column, showing deletions with a minus sign (-) and red background, and additions with a plus sign (+) and green background, similar to a Git code patch diff.",
    },
    {
      question: "Is there a limit to the length of text I can compare?",
      answer: "The LCS algorithm runs in quadratic time O(N*M) on the number of lines. It is optimized to support comparisons of files up to 2,000 lines instantly inside the browser memory. Performance may lag slightly on exceptionally massive logs or scripts.",
    },
  ];

  return (
    <ToolLayout toolId="text-diff">
      <div className="space-y-8">
        {/* Input Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Text A */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Original Text (A)
            </label>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <textarea
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                className="w-full h-48 p-4 text-xs text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Paste original string content here..."
              />
            </div>
          </div>

          {/* Modified Text B */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Modified Text (B)
            </label>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <textarea
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                className="w-full h-48 p-4 text-xs text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Paste modified string content here..."
              />
            </div>
          </div>
        </div>

        {/* View Switcher and Statistics */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3 bg-muted/20 border border-border/60 rounded-2xl">
          <div className="flex gap-2">
            <button
              onClick={() => setViewType("split")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewType === "split" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Split View
            </button>
            <button
              onClick={() => setViewType("unified")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewType === "unified" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Unified View
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <Plus className="w-3.5 h-3.5" /> {diffStats.additions} additions
            </span>
            <span className="flex items-center gap-1 text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
              <Minus className="w-3.5 h-3.5" /> {diffStats.deletions} deletions
            </span>
          </div>
        </div>

        {/* Diff Visual Output Panel */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <GitCompare className="w-4 h-4" /> Difference Comparison
          </span>

          <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden max-h-[600px] overflow-y-auto">
            {viewType === "split" ? (
              // Split View Layout
              <div className="grid grid-cols-2 divide-x divide-border font-mono text-[11px] leading-relaxed">
                {/* Left Pane (Original) */}
                <div className="bg-muted/5 divide-y divide-border/20">
                  {alignedLines.map((line, idx) => (
                    <div
                      key={`orig-${idx}`}
                      className={`flex min-h-[24px] px-3 items-center ${
                        line.original.type === "removed"
                          ? "bg-red-500/15 text-red-700 dark:text-red-300 font-medium"
                          : line.original.type === "empty"
                          ? "bg-muted/10 opacity-30 select-none"
                          : "text-foreground"
                      }`}
                    >
                      <span className="w-8 text-muted-foreground/60 select-none text-right pr-2">
                        {line.original.lineNum || ""}
                      </span>
                      <span className="whitespace-pre-wrap break-all">
                        {line.original.type === "removed" && "- "}
                        {line.original.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Right Pane (Modified) */}
                <div className="bg-muted/5 divide-y divide-border/20">
                  {alignedLines.map((line, idx) => (
                    <div
                      key={`mod-${idx}`}
                      className={`flex min-h-[24px] px-3 items-center ${
                        line.modified.type === "added"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium"
                          : line.modified.type === "empty"
                          ? "bg-muted/10 opacity-30 select-none"
                          : "text-foreground"
                      }`}
                    >
                      <span className="w-8 text-muted-foreground/60 select-none text-right pr-2">
                        {line.modified.lineNum || ""}
                      </span>
                      <span className="whitespace-pre-wrap break-all">
                        {line.modified.type === "added" && "+ "}
                        {line.modified.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Unified View Layout
              <div className="bg-muted/5 divide-y divide-border/20 font-mono text-[11px] leading-relaxed">
                {alignedLines.map((line, idx) => {
                  if (line.original.type === "removed") {
                    return (
                      <div
                        key={`uni-orig-${idx}`}
                        className="flex min-h-[24px] px-3 items-center bg-red-500/15 text-red-700 dark:text-red-300 font-medium"
                      >
                        <span className="w-8 text-red-500/60 select-none text-right pr-2">
                          {line.original.lineNum}
                        </span>
                        <span className="w-8 text-muted-foreground/0 select-none text-right pr-2">
                          -
                        </span>
                        <span className="whitespace-pre-wrap break-all">- {line.original.text}</span>
                      </div>
                    );
                  }
                  if (line.modified.type === "added") {
                    return (
                      <div
                        key={`uni-mod-${idx}`}
                        className="flex min-h-[24px] px-3 items-center bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium"
                      >
                        <span className="w-8 text-muted-foreground/0 select-none text-right pr-2">
                          -
                        </span>
                        <span className="w-8 text-emerald-500/60 select-none text-right pr-2">
                          {line.modified.lineNum}
                        </span>
                        <span className="whitespace-pre-wrap break-all">+ {line.modified.text}</span>
                      </div>
                    );
                  }
                  if (line.original.type === "unchanged") {
                    return (
                      <div
                        key={`uni-unch-${idx}`}
                        className="flex min-h-[24px] px-3 items-center text-foreground"
                      >
                        <span className="w-8 text-muted-foreground/60 select-none text-right pr-2">
                          {line.original.lineNum}
                        </span>
                        <span className="w-8 text-muted-foreground/60 select-none text-right pr-2">
                          {line.modified.lineNum}
                        </span>
                        <span className="whitespace-pre-wrap break-all">  {line.original.text}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>

        <SEOContent
          title="Online Diff Checker"
          explanation="Our free online Diff Checker compares two texts (Original vs Modified) and highlights additions in green and deletions in red. It uses the dynamic programming Longest Common Subsequence (LCS) algorithm to align lines side-by-side or in unified Git patch formatting entirely client-side."
          howToUse={[
            "Paste your original document into the 'Original Text (A)' panel.",
            "Paste your edited document into the 'Modified Text (B)' panel.",
            "Choose between 'Split View' (aligned double-column) or 'Unified View' (Git patch styling) to analyze changes."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
