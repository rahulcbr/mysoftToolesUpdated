"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Search, Eye, AlertCircle, ListCollapse } from "lucide-react";

interface MatchItem {
  text: string;
  index: number;
  groups: string[];
}

export default function RegexToolPage() {
  const [pattern, setPattern] = useState("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");
  const [flags, setFlags] = useState({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
  });
  const [subject, setSubject] = useState(
    "Hello! You can reach us at info@mysofttools.com or support.team@mysofttools.org. For general inquiries, email contact@mysofttools.com."
  );
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  useEffect(() => {
    recordRecentTool("text-regex");
  }, []);

  const handleFlagToggle = (flagKey: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [flagKey]: !prev[flagKey] }));
  };

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      setHighlightedHtml(subject);
      return;
    }

    try {
      const activeFlags = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key)
        .join("");

      const regex = new RegExp(pattern, activeFlags);
      setError(null);

      const foundMatches: MatchItem[] = [];
      let tempHtml = "";

      // Perform matching and construct highlighted HTML safely
      if (regex.global) {
        let match;
        let lastIndex = 0;
        const escapedSubject = subject
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        // Re-compile regex for HTML parsing to locate original boundaries
        const htmlRegex = new RegExp(pattern, activeFlags);
        let htmlMatch;

        while ((htmlMatch = htmlRegex.exec(escapedSubject)) !== null) {
          // Safeguard against infinite loops with zero-width matches (like \b)
          if (htmlMatch.index === htmlRegex.lastIndex) {
            htmlRegex.lastIndex++;
          }
          foundMatches.push({
            text: htmlMatch[0],
            index: htmlMatch.index,
            groups: Array.from(htmlMatch).slice(1) as string[],
          });
        }

        // Generate highlighted HTML
        let outputHtml = "";
        let currentPos = 0;
        const plainRegex = new RegExp(pattern, activeFlags);
        let m;
        while ((m = plainRegex.exec(subject)) !== null) {
          const matchText = m[0];
          const matchIndex = m.index;

          outputHtml += subject.slice(currentPos, matchIndex)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          outputHtml += `<mark class="bg-yellow-500/30 border border-yellow-500/40 text-foreground px-0.5 rounded font-semibold">${matchText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</mark>`;

          currentPos = plainRegex.lastIndex;
          if (m.index === plainRegex.lastIndex) {
            plainRegex.lastIndex++;
          }
        }
        outputHtml += subject.slice(currentPos)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        setHighlightedHtml(outputHtml);
      } else {
        // Single match mode
        const m = regex.exec(subject);
        if (m) {
          foundMatches.push({
            text: m[0],
            index: m.index,
            groups: Array.from(m).slice(1) as string[],
          });

          const matchText = m[0];
          const matchIndex = m.index;
          let outputHtml = subject.slice(0, matchIndex)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          outputHtml += `<mark class="bg-yellow-500/30 border border-yellow-500/40 text-foreground px-0.5 rounded font-semibold">${matchText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</mark>`;
          outputHtml += subject.slice(matchIndex + matchText.length)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          setHighlightedHtml(outputHtml);
        } else {
          setHighlightedHtml(
            subject
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
          );
        }
      }

      setMatches(foundMatches);
    } catch (err: any) {
      setMatches([]);
      setError(err.message || "Invalid regular expression pattern syntax.");
      setHighlightedHtml(
        subject
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      );
    }
  }, [pattern, flags, subject]);

  const faqs = [
    {
      question: "What flags are supported in the Regex Tester?",
      answer: "We support 'g' (global matching), 'i' (case-insensitive), 'm' (multiline matching, anchors ^ and $ match line boundaries), 's' (dotAll, dot matches newlines), and 'u' (Unicode matching for emojis/symbols).",
    },
    {
      question: "How does the tester protect against browser crashes?",
      answer: "Our loop parser enforces a safety safeguard: if a regular expression makes a zero-width match (e.g. matching a boundary or empty space without consuming characters), the engine advances `lastIndex` manually to prevent the Javascript engine from locking up in an infinite loop.",
    },
    {
      question: "Is my text data stored or tracked?",
      answer: "No. All regular expression compilation and match evaluations are executed instantly inside your local browser tab. Your pattern strings and test subjects remain completely private.",
    },
  ];

  return (
    <ToolLayout toolId="text-regex">
      <div className="space-y-8">
        {/* Pattern & Flags Settings Panel */}
        <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Search className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Regex Expression</h2>
          </div>

          <div className="space-y-4">
            {/* Pattern Input Row */}
            <div className="flex items-center gap-2 bg-muted/20 border border-border/60 rounded-xl px-3 py-2 font-mono">
              <span className="text-muted-foreground text-sm font-semibold select-none">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern here (e.g. [a-z]+)"
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-foreground"
              />
              <span className="text-muted-foreground text-sm font-semibold select-none">/</span>
              <span className="text-primary text-xs font-bold select-none">
                {Object.entries(flags)
                  .filter(([_, enabled]) => enabled)
                  .map(([key]) => key)
                  .join("")}
              </span>
            </div>

            {/* Flags Options */}
            <div className="flex flex-wrap gap-3">
              {(Object.keys(flags) as Array<keyof typeof flags>).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFlagToggle(f)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    flags[f]
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "bg-muted/10 border-border/60 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {f === "g" && "g (global)"}
                  {f === "i" && "i (case-insensitive)"}
                  {f === "m" && "m (multiline)"}
                  {f === "s" && "s (dotAll)"}
                  {f === "u" && "u (unicode)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compile Error Warning */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/5 text-xs text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono"><strong>Syntax Error:</strong> {error}</span>
          </div>
        )}

        {/* Double Pane Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Text Input */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Test Subject Input
            </span>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <textarea
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-80 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Type or paste text to match against the regex pattern..."
              />
            </div>
          </div>

          {/* Highlighted Match Visualizer */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Highlighted Preview
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                matches.length > 0
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
              }`}>
                {matches.length} {matches.length === 1 ? "match" : "matches"} found
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-muted/10 h-80 p-4 overflow-y-auto whitespace-pre-wrap break-all text-sm leading-relaxed font-mono"
              dangerouslySetInnerHTML={{ __html: highlightedHtml || "No matches to display" }}
            />
          </div>
        </div>

        {/* Match Breakdown Table */}
        {matches.length > 0 && (
          <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <ListCollapse className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Matches List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground font-bold">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Match</th>
                    <th className="py-2 px-3">Index</th>
                    <th className="py-2 px-3">Groups</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-mono">
                  {matches.slice(0, 100).map((m, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="py-2 px-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-primary">{m.text}</td>
                      <td className="py-2 px-3 text-muted-foreground">{m.index}</td>
                      <td className="py-2 px-3 text-[10px] text-muted-foreground">
                        {m.groups.length > 0 ? JSON.stringify(m.groups) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length > 100 && (
                <div className="text-[10px] text-muted-foreground p-3 text-center border-t border-border/20">
                  Showing first 100 matches only.
                </div>
              )}
            </div>
          </div>
        )}

        <SEOContent
          title="Online Regex Tester"
          explanation="Our free online Regex Tester is a client-side utility to validate regular expressions and inspect matched strings in real-time. Highlights group captures, lists coordinates, and prevents infinite loops on zero-width match tokens."
          howToUse={[
            "Input your regular expression inside the slash fields. Toggle matching flags (global, case-insensitive, etc.).",
            "Write or paste target copy inside the 'Test Subject Input' text area.",
            "Inspect the highlighted text block for exact position highlights and view the breakdown table below for group index statistics."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
