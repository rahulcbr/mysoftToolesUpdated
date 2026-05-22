"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, CheckCircle, XCircle } from "lucide-react";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<"2" | "4" | "tab" | "minify">("2");
  const [validation, setValidation] = useState<{ isValid: boolean | null; error: string | null }>({
    isValid: null,
    error: null,
  });

  useEffect(() => {
    recordRecentTool("text-json-formatter");
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setValidation({ isValid: null, error: null });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      let formatted = "";

      if (indent === "minify") {
        formatted = JSON.stringify(parsed);
      } else {
        const space = indent === "tab" ? "\t" : parseInt(indent);
        formatted = JSON.stringify(parsed, null, space);
      }

      setOutput(formatted);
      setValidation({ isValid: true, error: null });
    } catch (err: any) {
      setOutput("");
      setValidation({
        isValid: false,
        error: err.message || "Invalid JSON syntax structure.",
      });
    }
  }, [input, indent]);

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
    const blob = new Blob([output || input], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = indent === "minify" ? "mysofttools-min.json" : "mysofttools-formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "How does the JSON validation parser function?",
      answer: "The formatter attempts to read your text string using browser standard `JSON.parse()`. If it encounters a malformed layout (e.g. unquoted keys, trailing commas, or unbalanced curly brackets), the JavaScript compiler throws an error sequence containing the syntax position which we display.",
    },
    {
      question: "What does minifying a JSON do?",
      answer: "Minification strips all formatting whitespace, tabs, and newline line breaks from the JSON document. This reduces the file's disk size (ideal for payload transmissions across network APIs).",
    },
    {
      question: "Are my JSON datasets secure?",
      answer: "Yes. All validation, formatting, and minify calculations occur strictly inside your local browser memory space. Your private datasets never reach any servers.",
    },
  ];

  return (
    <ToolLayout toolId="text-json-formatter">
      <div className="space-y-8">
        {/* Settings and Status Bar */}
        <div className="p-4 rounded-2xl border border-border bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Spacing Indent</span>
            <div className="flex gap-1 bg-card border border-border p-1 rounded-xl">
              {(["2", "4", "tab", "minify"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIndent(opt)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    indent === opt
                      ? "bg-primary text-white shadow-sm"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {opt === "minify" ? "Minify" : opt === "tab" ? "Tabs" : `${opt} Spaces`}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Banner */}
          {validation.isValid !== null && (
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-500">
                  <CheckCircle className="w-4 h-4" /> Valid JSON
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-500">
                  <XCircle className="w-4 h-4" /> Invalid JSON
                </span>
              )}
            </div>
          )}
        </div>

        {/* Validation Error Box */}
        {validation.error && (
          <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/5 text-xs text-red-500 font-mono">
            <strong>Syntax Error:</strong> {validation.error}
          </div>
        )}

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Raw JSON Input</span>
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
                className="w-full h-96 p-4 text-xs font-mono text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Paste your raw JSON string here..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Formatted Output</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!output && !input}
                  className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!output && !input}
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
                className="w-full h-96 p-4 text-xs font-mono text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Formatted JSON will print here automatically when input is valid..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="JSON Formatter & Validator"
          explanation="Our free online JSON Formatter & Validator prettifies raw nested JSON documents for easy reading, formats indentation parameters, and minifies files. The real-time checker points out syntax errors with line specifications locally."
          howToUse={[
            "Paste your raw JSON string in the Input box.",
            "Choose your indent size (2 spaces, 4 spaces, tabs, or minify script).",
            "Check the validation label (Valid JSON vs Error details).",
            "Copy your beautifully indented JSON layout or save it as a .json file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
