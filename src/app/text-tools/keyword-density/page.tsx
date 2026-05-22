"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { ListOrdered, CheckCircle2, Clipboard } from "lucide-react";

interface KeywordRow {
  keyword: string;
  count: number;
  density: number;
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "by", "is", "are", "was", "were", "with", "as", "from",
  "it", "this", "that", "these", "those", "then", "there", "their", "them", "they", "i", "you", "he", "she", "we", "us", "our",
  "your", "his", "her", "its", "can", "will", "would", "should", "could", "may", "might", "must", "have", "has", "had", "do", "does",
  "did", "been", "being", "to", "of", "in", "for", "on", "with", "at", "by", "from", "up", "about", "into", "over", "after", "not",
  "be", "so", "no", "if", "out", "about", "than", "then", "up", "down", "more", "most", "some", "any", "other", "all"
]);

export default function KeywordDensityToolPage() {
  const [input, setInput] = useState(
    `SEO is critical for web visibility. When optimizing SEO, keyword density is a metric to track. Keyword density ensures your primary keyword is mentioned in text, but it is important to avoid keyword stuffing. Modern search engines favor readable copy over excessive keyword frequency. Keep your focus keywords balanced and natural inside your web design and layout.`
  );
  const [phraseSize, setPhraseSize] = useState<1 | 2 | 3>(1);
  const [excludeStops, setExcludeStops] = useState(true);
  const [minWordLength, setMinWordLength] = useState(3);
  const [tableData, setTableData] = useState<KeywordRow[]>([]);
  const [stats, setStats] = useState({ totalWords: 0, uniqueCount: 0 });

  useEffect(() => {
    recordRecentTool("text-keyword-density");
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setTableData([]);
      setStats({ totalWords: 0, uniqueCount: 0 });
      return;
    }

    // Clean text and extract lowercase words
    const words = input
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= minWordLength);

    const totalWords = words.length;

    // Count phrases
    const counts: Record<string, number> = {};
    let validPhrasesCount = 0;

    for (let i = 0; i <= words.length - phraseSize; i++) {
      const slice = words.slice(i, i + phraseSize);

      // Stop-word filters
      if (excludeStops) {
        // Skip phrases containing stop words
        if (slice.some((w) => STOP_WORDS.has(w))) {
          continue;
        }
      }

      const phrase = slice.join(" ");
      counts[phrase] = (counts[phrase] || 0) + 1;
      validPhrasesCount++;
    }

    // Convert counts map to sorted rows list
    const rows: KeywordRow[] = Object.entries(counts).map(([phrase, count]) => {
      const density = validPhrasesCount > 0 ? (count / validPhrasesCount) * 100 : 0;
      return { keyword: phrase, count, density };
    });

    // Sort by count descending
    rows.sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword));

    setTableData(rows.slice(0, 50)); // cap at top 50
    setStats({ totalWords, uniqueCount: rows.length });
  }, [input, phraseSize, excludeStops, minWordLength]);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setInput(clipboardText);
    } catch (_) {}
  };

  const faqs = [
    {
      question: "What is Keyword Density?",
      answer: "Keyword density measures the percentage frequency of a specific word or phrase relative to the total number of words in a text block. It is a traditional metric in Search Engine Optimization (SEO) to analyze content relevance for target queries.",
    },
    {
      question: "What is the recommended keyword density for SEO?",
      answer: "Most SEO professionals recommend a density of 1% to 2% for primary keywords. Going above 3% is often flagged by modern search engines like Google as 'keyword stuffing', which can negatively impact a page's ranking.",
    },
    {
      question: "How does the phrase size setting work?",
      answer: "1-word keywords analyze individual words (unigrams). 2-word phrases analyze two consecutive words (bigrams like 'web design'). 3-word phrases analyze three consecutive words (trigrams like 'search engine optimization'). This helps identify complex, long-tail keyphrase patterns.",
    },
  ];

  return (
    <ToolLayout toolId="text-keyword-density">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Article / Copy Input
              </span>
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
                  Clear
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-96 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Type or paste your copy text here to analyze keyword saturation..."
              />
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Words</div>
                <div className="text-xl font-extrabold text-foreground">{stats.totalWords}</div>
              </div>
              <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Unique Keywords</div>
                <div className="text-xl font-extrabold text-primary">{stats.uniqueCount}</div>
              </div>
            </div>
          </div>

          {/* Analysis Results (Right) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Analyzer Settings Bar */}
            <div className="p-4 bg-muted/20 border border-border/60 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                <ListOrdered className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Analysis Filters</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phrase Size */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Phrase Size</span>
                  <div className="flex gap-1.5">
                    {([1, 2, 3] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setPhraseSize(size)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border ${
                          phraseSize === size
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-card border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {size}-Word{size > 1 && "s"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exclude Stop Words & Min word length */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Length & Stops</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeStops}
                        onChange={(e) => setExcludeStops(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-muted-foreground select-none">
                        Filter Stops
                      </span>
                    </label>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Min Len:</span>
                      <select
                        value={minWordLength}
                        onChange={(e) => setMinWordLength(Number(e.target.value))}
                        className="bg-card border border-border rounded-lg text-xs font-semibold px-1 py-0.5"
                      >
                        {[2, 3, 4, 5].map((len) => (
                          <option key={len} value={len}>
                            {len}+
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Density Table */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Keyword Frequency Density List
              </span>

              <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden max-h-[380px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-card border-b border-border/80 text-muted-foreground font-bold z-10">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                      <th className="py-2.5 px-4">Keyword Phrase</th>
                      <th className="py-2.5 px-4 w-20 text-center">Count</th>
                      <th className="py-2.5 px-4 w-28">Density</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {tableData.length > 0 ? (
                      tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                          <td className="py-2.5 px-4 text-center text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-semibold text-foreground font-mono">{row.keyword}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-primary font-mono">{row.count}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-3">
                              <span className="w-10 font-semibold font-mono">{row.density.toFixed(1)}%</span>
                              <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden shrink-0">
                                <div
                                  className="bg-primary h-full rounded-full"
                                  style={{ width: `${Math.min(row.density * 5, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-xs text-muted-foreground italic">
                          No keywords fit the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <SEOContent
          title="Online Keyword Density Checker"
          explanation="Our free online Keyword Density Checker scans your text inputs to highlight keyword frequencies and saturation percentages. Supporting unigram, bigram, and trigram phrases, it ensures SEO-optimized writing without triggering keyword stuffing filters."
          howToUse={[
            "Paste your written copy inside the 'Article / Copy Input' pane.",
            "Adjust analyzer filters on the right: choose keyword phrase sizes (1-word, 2-word, or 3-word), toggle stop word exclusions, and select minimum word lengths.",
            "Review the resulting ranked table of keywords, showing raw occurrence tallies and precise percentage ratios."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
