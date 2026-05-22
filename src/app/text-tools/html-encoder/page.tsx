"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, ArrowLeftRight } from "lucide-react";

export default function HtmlEncoderToolPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");
  const [escapeAll, setEscapeAll] = useState(false);

  useEffect(() => {
    recordRecentTool("text-html-encoder");
  }, []);

  const escapeHtml = (text: string) => {
    if (escapeAll) {
      // Escape everything except standard alphanumeric characters into numeric entities
      return Array.from(text)
        .map((c) => {
          const code = c.codePointAt(0);
          if (code && ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122))) {
            return c;
          }
          return `&#${code};`;
        })
        .join("");
    }
    // Standard HTML tags escape
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const unescapeHtml = (html: string) => {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.documentElement.textContent || html;
    } catch (_) {
      // Fallback manual replace if DOMParser fails or is in SSR mode
      return html
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)));
    }
  };

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    if (mode === "escape") {
      setOutput(escapeHtml(input));
    } else {
      setOutput(unescapeHtml(input));
    }
  }, [input, mode, escapeAll]);

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
    a.download = mode === "escape" ? "mysofttools-html-escaped.txt" : "mysofttools-html-unescaped.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "escape" ? "unescape" : "escape"));
    setInput(output);
    setOutput(input);
  };

  const faqs = [
    {
      question: "What is HTML escaping?",
      answer: "HTML escaping converts special markup characters (like <, >, &) that represent tags or directives in HTML syntax into their respective safe character entity representations (like &lt;, &gt;, &amp;). This prevents the browser from rendering the string as actual HTML layout code or executing cross-site scripts (XSS).",
    },
    {
      question: "What is the difference between standard and strict escaping?",
      answer: "Standard escaping converts only the 5 essential HTML markup characters: &, <, >, \", and '. Strict escaping converts all non-alphanumeric characters (including punctuation, symbols, and letters with accents) to their corresponding decimal unicode entity entities (e.g. &#123;), which is safer when nesting string variables inside script attributes.",
    },
    {
      question: "How does the decoder handle entity variations?",
      answer: "Our decoder uses the browser's native HTML parser engine (`DOMParser`), meaning it resolves named characters (like &eacute; or &mdash;) as well as hexadecimal (&#x...) and decimal (&#...) entity codes perfectly.",
    },
  ];

  return (
    <ToolLayout toolId="text-html-encoder">
      <div className="space-y-8">
        {/* Toggle Mode Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3 bg-muted/20 border border-border/60 rounded-2xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("escape")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "escape" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Escape HTML Entities
            </button>
            <button
              onClick={() => setMode("unescape")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "unescape" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Unescape HTML Entities
            </button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {mode === "escape" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={escapeAll}
                  onChange={(e) => setEscapeAll(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-muted-foreground select-none">
                  Escape All Non-Alphanumeric
                </span>
              </label>
            )}

            <button
              onClick={toggleMode}
              className="p-2 rounded-xl border border-border hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Swap input and output"
            >
              <ArrowLeftRight className="w-4 h-4" /> Swap
            </button>
          </div>
        </div>

        {/* Double Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {mode === "escape" ? "Plain / Code Text Input" : "HTML Entities Code Input"}
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
                placeholder={mode === "escape" ? "Type code like <h1>Hello & Welcome!</h1>..." : "Paste escaped entities like &lt;h1&gt;Hello &amp; Welcome!&lt;/h1&gt;..."}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {mode === "escape" ? "HTML Entities Output" : "Unescaped Plain Text"}
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
                placeholder={mode === "escape" ? "Escaped HTML entities will appear here..." : "Decoded text will appear here..."}
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="HTML Entities Encoder & Decoder"
          explanation="Our free, online HTML Entities Encoder & Decoder offers client-side protection by escaping XML/HTML markup tags or resolving encoded glyph entity strings instantly. Perfect for debugging markup text blocks securely."
          howToUse={[
            "Select whether you want to Escape (convert tags to entity codes) or Unescape (convert entity codes to tags).",
            "Under Escape mode, toggle the 'Escape All Non-Alphanumeric' switch if you need full numeric unicode masking.",
            "Type or paste your text in the left input panel to get the real-time conversion on the right."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
