"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, Type, Sparkles } from "lucide-react";

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const [metrics, setMetrics] = useState({
    words: 0,
    chars: 0,
    charsNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
  });

  useEffect(() => {
    recordRecentTool("text-word-counter");
  }, []);

  useEffect(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    
    // Words count: split by spaces, filter empty
    const wordsArr = text.trim().split(/\s+/);
    const words = text.trim() === "" ? 0 : wordsArr.length;

    // Sentences count: match terminal punctuation (. ! ?)
    const sentencesArr = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentences = sentencesArr.length;

    // Paragraphs count: split by double newlines or single newlines containing text
    const paragraphsArr = text.split(/\n+/).filter(p => p.trim().length > 0);
    const paragraphs = paragraphsArr.length;

    // Reading time: average 200 words per minute
    const readingTime = Math.ceil(words / 200);

    setMetrics({
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime,
    });
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (_) {}
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mysofttools-wordcounter.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "How is reading time calculated?",
      answer: "Reading time is estimated based on an average adult reading speed of 200 words per minute. If your text contains 400 words, it will display a reading index of 2 minutes.",
    },
    {
      question: "Are carriage returns or tabs counted as characters?",
      answer: "Yes. The standard 'Character Count' records all byte sequences in the editor, including tabs, spacebar clicks, and line breaks. The 'Characters (No Spaces)' metric filters all whitespace parameters out.",
    },
    {
      question: "Is there a limit on how much text I can paste?",
      answer: "No. Since execution runs locally in your browser memory, you can paste full chapters or long research articles without hitting upload limits or network timeout errors.",
    },
  ];

  return (
    <ToolLayout toolId="text-word-counter">
      <div className="space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Words", value: metrics.words, color: "text-primary" },
            { label: "Characters", value: metrics.chars, color: "text-indigo-500" },
            { label: "Chars (no space)", value: metrics.charsNoSpaces, color: "text-emerald-500" },
            { label: "Sentences", value: metrics.sentences, color: "text-pink-500" },
            { label: "Paragraphs", value: metrics.paragraphs, color: "text-amber-500" },
            { label: "Reading Time", value: `${metrics.readingTime} min`, color: "text-rose-500" },
          ].map((item, index) => (
            <div key={index} className="p-4 rounded-2xl border border-border bg-muted/20 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{item.label}</span>
              <p className={`text-xl md:text-2xl font-extrabold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Text Area Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Type className="w-4 h-4 text-primary" /> Text Input Area
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePaste}
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5" /> Paste
              </button>
              <button
                onClick={handleCopy}
                disabled={!text}
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" /> Copy All
              </button>
              <button
                onClick={handleDownload}
                disabled={!text}
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button
                onClick={() => setText("")}
                disabled={!text}
                className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold text-red-500 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-80 p-5 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
              placeholder="Start typing or paste your text content here to calculate details..."
            />
          </div>
        </div>

        <SEOContent
          title="Word & Character Counter"
          explanation="Our free online Word & Character Counter tool analyzes your text strings in real-time, outputting total words, characters (with and without space spacing), sentences, paragraphs, and reading times. Run entirely inside your web browser, this tool ensures complete confidentiality for sensitive logs, content drafts, or school essays."
          howToUse={[
            "Paste your text directly into the input area or type it manually.",
            "Inspect the top metrics grid showing real-time tallies for character counts, words, sentences, and paragraphs.",
            "Use the 'Copy All' button to copy your text to your clipboard, or 'Download' to save it as a text file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
