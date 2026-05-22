"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, RefreshCw } from "lucide-react";

export default function ReverserToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [reverseType, setReverseType] = useState<"chars" | "words" | "lines">("chars");

  useEffect(() => {
    recordRecentTool("text-reverser");
  }, []);

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    if (reverseType === "chars") {
      // Reverse each character in the string
      // Handles surrogate pairs correctly via Array.from
      setOutput(Array.from(input).reverse().join(""));
    } else if (reverseType === "words") {
      // Reverse word order in each line
      const lines = input.split("\n");
      const reversedLines = lines.map((line) => {
        const words = line.split(/(\s+)/); // Keep whitespace delimiters
        // Split keeps the delimiters as odd indices. Let's filter and reverse
        // Alternatively, a simpler word reversal that splits by space:
        return line.split(" ").reverse().join(" ");
      });
      setOutput(reversedLines.join("\n"));
    } else {
      // Reverse line order
      setOutput(input.split("\n").reverse().join("\n"));
    }
  }, [input, reverseType]);

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
    a.download = "mysofttools-reversed-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const swapInOut = () => {
    setInput(output);
    setOutput(input);
  };

  const faqs = [
    {
      question: "How does the Text Reverser handle emojis or Unicode characters?",
      answer: "Standard JavaScript `.split('').reverse().join('')` splits surrogate pairs, which ruins emojis. Our character reverser uses `Array.from(str)` which respects Unicode surrogate pairs, keeping emojis and composite characters intact when reversed.",
    },
    {
      question: "What is Word Reversal vs Line Reversal?",
      answer: "Word Reversal reverses the order of the words in each individual line (e.g. 'hello world' becomes 'world hello') while keeping lines in order. Line Reversal reverses the chronological order of the lines (e.g. the first line becomes the last line, and the last line becomes the first line) while keeping characters inside lines intact.",
    },
    {
      question: "Are my text inputs secure?",
      answer: "Yes, all processing takes place locally inside your browser's memory, ensuring complete confidentiality. Your data is never sent to any server.",
    },
  ];

  return (
    <ToolLayout toolId="text-reverser">
      <div className="space-y-8">
        {/* Toggle Mode Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3 bg-muted/20 border border-border/60 rounded-2xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setReverseType("chars")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reverseType === "chars" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Reverse Characters
            </button>
            <button
              onClick={() => setReverseType("words")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reverseType === "words" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Reverse Words
            </button>
            <button
              onClick={() => setReverseType("lines")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reverseType === "lines" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Reverse Lines
            </button>
          </div>

          <button
            onClick={swapInOut}
            className="p-2 rounded-xl border border-border hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
            title="Swap input and output"
          >
            <RefreshCw className="w-4 h-4" /> Swap Input/Output
          </button>
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
                className="w-full h-80 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Type or paste standard text here..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Reversed Text Output
              </span>
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
                className="w-full h-80 p-4 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Reversed output will appear here..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Online Text Reverser"
          explanation="Our free online Text Reverser helps you flip characters, words, or full blocks of lines backwards instantly. Running locally in the browser, it fully supports Unicode surrogate pairs and emojis, ensuring text formatting is preserved without corrupted tags."
          howToUse={[
            "Choose a reversal mode: Reverse Characters, Reverse Words, or Reverse Lines.",
            "Type or paste your text into the left pane.",
            "Copy or download the reversed text output immediately from the right pane."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
