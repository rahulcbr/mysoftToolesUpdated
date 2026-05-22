"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Clipboard, Download, Settings } from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
  "est", "laborum", "et", "harum", "quidem", "rerum", "facilis", "est", "et",
  "expedita", "distinctio", "nam", "libero", "tempore", "cum", "soluta", "nobis",
  "est", "eligendi", "optio", "cumque", "nihil", "impedit", "quo", "minus", "id",
  "quod", "maxime", "placeat", "facere", "possimus", "omnis", "voluptas", "assumenda",
  "est", "omnis", "dolor", "repellendus", "temporibus", "autem", "quibusdam", "et",
  "aut", "consequatur", "vel", "illum", "qui", "dolorem", "eum", "fugiat", "quo",
  "voluptas", "nulla", "pariatur"
];

export default function LoremIpsumToolPage() {
  const [count, setCount] = useState(5);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words" | "lists">("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");

  useEffect(() => {
    recordRecentTool("text-lorem-ipsum");
  }, []);

  const getRandomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

  const generateSentence = () => {
    const wordCount = Math.floor(Math.random() * 8) + 8; // 8-15 words
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(getRandomWord());
    }
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };

  const generateParagraph = (isFirst = false) => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4; // 4-7 sentences
    const sentences: string[] = [];
    
    if (isFirst && startWithLorem) {
      sentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
    }
    
    for (let i = sentences.length; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(" ");
  };

  const generateContent = () => {
    let result = "";
    if (type === "paragraphs") {
      const paras: string[] = [];
      for (let i = 0; i < count; i++) {
        paras.push(generateParagraph(i === 0));
      }
      result = paras.join("\n\n");
    } else if (type === "sentences") {
      const sents: string[] = [];
      if (startWithLorem) {
        sents.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
      }
      for (let i = sents.length; i < count; i++) {
        sents.push(generateSentence());
      }
      result = sents.join(" ");
    } else if (type === "words") {
      const words: string[] = [];
      if (startWithLorem && count >= 5) {
        words.push("lorem", "ipsum", "dolor", "sit", "amet");
      }
      for (let i = words.length; i < count; i++) {
        words.push(getRandomWord());
      }
      result = words.slice(0, count).join(" ");
      result = result.charAt(0).toUpperCase() + result.slice(1);
    } else if (type === "lists") {
      const items: string[] = [];
      for (let i = 0; i < count; i++) {
        const words: string[] = [];
        const wordCount = Math.floor(Math.random() * 4) + 3; // 3-6 words
        for (let j = 0; j < wordCount; j++) {
          words.push(getRandomWord());
        }
        const itemText = words.join(" ");
        items.push(`* ${itemText.charAt(0).toUpperCase() + itemText.slice(1)}`);
      }
      result = items.join("\n");
    }
    setOutput(result);
  };

  useEffect(() => {
    generateContent();
  }, [count, type, startWithLorem]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mysofttools-lorem-ipsum.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "What is Lorem Ipsum?",
      answer: "Lorem Ipsum is standard dummy placeholder text used in typography, publishing, graphic design, and web design. It is derived from a Latin passage by Cicero in 45 BC, with the words altered to render them meaningless, thereby focusing viewer attention on the layout and visual presentation rather than the actual copy content.",
    },
    {
      question: "Can I customize the generated text length?",
      answer: "Yes, you can generate custom paragraphs, sentences, words, or lists. Simply adjust the count slider or inputs to generate the precise volume of mock copy required.",
    },
    {
      question: "Is there an option to exclude 'Lorem ipsum' at the start?",
      answer: "Yes, you can check or uncheck the 'Start with Lorem Ipsum' setting to generate completely random pseudo-Latin text streams.",
    },
  ];

  return (
    <ToolLayout toolId="text-lorem-ipsum">
      <div className="space-y-8">
        {/* Controls Panel */}
        <div className="p-5 bg-card/45 border border-border/80 rounded-3xl backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Settings className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Generator Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Count Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Count: <span className="text-primary">{count}</span>
              </label>
              <input
                type="range"
                min="1"
                max={type === "words" ? 500 : 50}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>1</span>
                <span>{type === "words" ? 500 : 50}</span>
              </div>
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Unit Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["paragraphs", "sentences", "words", "lists"] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => {
                      setType(unit);
                      if (unit === "words" && count > 500) setCount(100);
                      if (unit !== "words" && count > 50) setCount(5);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      type === unit
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-muted/10 border-border/60 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer p-2 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all border border-border/50">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-foreground select-none">
                  Start with &quot;Lorem ipsum...&quot;
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Generated Dummy Text
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-inner overflow-hidden">
            <textarea
              readOnly
              value={output}
              className="w-full h-96 p-5 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
              placeholder="Your dummy lorem ipsum text will appear here..."
            />
          </div>
        </div>

        <SEOContent
          title="Lorem Ipsum Generator"
          explanation="Our free, online Lorem Ipsum Generator provides custom mock paragraphs, lists, sentences, and words instantly. Running entirely inside browser memory, it supports designers, layout mockups, and developers with clean, formatted Latin copy streams."
          howToUse={[
            "Adjust the count range slider to specify how many units to create.",
            "Choose your desired output type: Paragraphs, Sentences, Words, or Bulleted List Items.",
            "Optionally select whether the generated text should begin with the traditional 'Lorem ipsum dolor sit amet...' string.",
            "Copy the resulting block or download it as a plain-text document."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
