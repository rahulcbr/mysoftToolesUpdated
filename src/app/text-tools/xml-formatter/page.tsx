"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, CheckCircle, XCircle } from "lucide-react";

export default function XmlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [validation, setValidation] = useState<{ isValid: boolean | null; error: string | null }>({
    isValid: null,
    error: null,
  });

  useEffect(() => {
    recordRecentTool("text-xml-formatter");
  }, []);

  const formatXmlString = (xml: string, tabChar: string) => {
    // Basic regex-based XML formatter
    let formatted = "";
    let reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, "$1\r\n$2$3");
    let pad = 0;
    
    xml.split("\r\n").forEach((node) => {
      let indentLevel = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indentLevel = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indentLevel = 1;
      } else {
        indentLevel = 0;
      }

      let padding = "";
      for (let i = 0; i < pad; i++) {
        padding += tabChar;
      }

      formatted += padding + node + "\r\n";
      pad += indentLevel;
    });

    return formatted.trim();
  };

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setValidation({ isValid: null, error: null });
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "application/xml");
      const parserError = xmlDoc.getElementsByTagName("parsererror");

      if (parserError.length > 0) {
        throw new Error(parserError[0].textContent || "Syntax error detected in XML tags.");
      }

      const tabChar = indent === "tab" ? "\t" : " ".repeat(parseInt(indent));
      // Pre-minify slightly to normalize structure before formatting
      const minified = input.replace(/>\s+</g, "><").trim();
      const formatted = formatXmlString(minified, tabChar);

      setOutput(formatted);
      setValidation({ isValid: true, error: null });
    } catch (err: any) {
      setOutput("");
      setValidation({
        isValid: false,
        error: err.message || "Invalid XML tags structure.",
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
    const blob = new Blob([output || input], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mysofttools-formatted.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      question: "How does the XML validation work?",
      answer: "The page compiles inputs using the browser's standard native `DOMParser` API. If it finds unclosed tags, malformed nodes, or mismatched structures, it triggers a parsererror tag which we read and present in the status console.",
    },
    {
      question: "Will comments or CDATA blocks be preserved?",
      answer: "Yes. Comments, script nodes, and CDATA boundaries are preserved in the formatting stream.",
    },
    {
      question: "Is there a file size limit?",
      answer: "No strict limits, but formatting very large XML files (e.g. over 15MB database backups) might cause temporary browser stuttering as JavaScript string matrices are processed.",
    },
  ];

  return (
    <ToolLayout toolId="text-xml-formatter">
      <div className="space-y-8">
        {/* Settings and Status Bar */}
        <div className="p-4 rounded-2xl border border-border bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Spacing Indent</span>
            <div className="flex gap-1 bg-card border border-border p-1 rounded-xl">
              {(["2", "4", "tab"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIndent(opt)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    indent === opt
                      ? "bg-primary text-white shadow-sm"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {opt === "tab" ? "Tabs" : `${opt} Spaces`}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Banner */}
          {validation.isValid !== null && (
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-500">
                  <CheckCircle className="w-4 h-4" /> Valid XML
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-500">
                  <XCircle className="w-4 h-4" /> Invalid XML
                </span>
              )}
            </div>
          )}
        </div>

        {/* Validation Error Box */}
        {validation.error && (
          <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/5 text-xs text-red-500 font-mono">
            <strong>Parsing Error:</strong> {validation.error}
          </div>
        )}

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Raw XML Input</span>
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
                placeholder="Paste your raw XML markup here..."
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
                placeholder="Formatted XML will print here automatically when input is valid..."
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="XML Formatter"
          explanation="Our free online XML Formatter reads your raw tags layout, verifies structure syntax using local DOM parsers, and formats nested alignments. Running 100% clientside, your files remain private."
          howToUse={[
            "Paste your unformatted XML tags into the Raw XML Input area.",
            "Choose your indent spacing (2 spaces, 4 spaces, or tabs).",
            "Ensure the validation tag shows 'Valid XML'.",
            "Copy your beautifully indented XML layout or save it as a text file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
