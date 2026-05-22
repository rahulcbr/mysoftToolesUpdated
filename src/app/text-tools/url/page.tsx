"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, ArrowLeftRight } from "lucide-react";

export default function UrlToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeMode, setEncodeMode] = useState<"component" | "uri">("component");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recordRecentTool("text-url");
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      setError(null);
      if (mode === "encode") {
        if (encodeMode === "component") {
          setOutput(encodeURIComponent(input));
        } else {
          setOutput(encodeURI(input));
        }
      } else {
        if (encodeMode === "component") {
          setOutput(decodeURIComponent(input));
        } else {
          setOutput(decodeURI(input));
        }
      }
    } catch (err: any) {
      setOutput("");
      setError("Malformed URL payload. Could not decode percent-encoded tokens.");
    }
  }, [input, mode, encodeMode]);

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
    a.download = mode === "encode" ? "mysofttools-url-encoded.txt" : "mysofttools-url-decoded.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput(input);
  };

  const faqs = [
    {
      question: "What is the difference between encodeURIComponent and encodeURI?",
      answer: "encodeURIComponent encodes all non-standard characters, including punctuation marks like slashes (/), question marks (?), and ampersands (&). It is best for encoding query parameters. encodeURI ignores characters that have functional meaning in a full URL (like protocol, domain, and query structural tokens), making it ideal for encoding a full, valid URL address.",
    },
    {
      question: "What does URL encoding do?",
      answer: "URL encoding (also known as percent-encoding) converts characters that are unsafe or reserved in URLs into a % symbol followed by two hexadecimal digits. This allows safe transmission of special characters and non-ASCII glyphs across the web.",
    },
    {
      question: "Is my text data stored or shared?",
      answer: "No. The entire conversion process is executed locally inside your web browser using vanilla JavaScript. No data is ever sent to our servers.",
    },
  ];

  return (
    <ToolLayout toolId="text-url">
      <div className="space-y-8">
        {/* Toggle Mode and Option Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3 bg-muted/20 border border-border/60 rounded-2xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "encode" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Encode URL
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "decode" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Decode URL
            </button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Scope:</span>
              <select
                value={encodeMode}
                onChange={(e) => setEncodeMode(e.target.value as "component" | "uri")}
                className="bg-card border border-border rounded-lg text-xs font-semibold px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="component">Query Component (Strict)</option>
                <option value="uri">Full URL (Lenient)</option>
              </select>
            </div>

            <button
              onClick={toggleMode}
              className="p-2 rounded-xl border border-border hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Swap input and output"
            >
              <ArrowLeftRight className="w-4 h-4" /> Swap
            </button>
          </div>
        </div>

        {/* Decode Error Warning */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/5 text-xs text-red-500 font-mono">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {mode === "encode" ? "Raw Text / URL Input" : "Percent-Encoded Input"}
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
                placeholder={mode === "encode" ? "Type or paste text/URL here..." : "Paste your percent-encoded URL string here..."}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {mode === "encode" ? "Percent-Encoded Output" : "Decoded URL Output"}
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
                placeholder={mode === "encode" ? "Encoded output will appear here..." : "Decoded output will appear here..."}
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="URL Encoder & Decoder"
          explanation="Our free online URL Encoder & Decoder is a privacy-first web utility to encode or decode text and URL addresses. Using native client-side parsing, it instantly resolves query variables and handles percent-encoded string formatting."
          howToUse={[
            "Select whether you want to encode or decode your URL text.",
            "Choose either 'Query Component' (for parameters) or 'Full URL' (for addressing scope).",
            "Type or paste your text in the input pane to view the live translation on the right."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
