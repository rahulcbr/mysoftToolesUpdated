"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Trash2, Clipboard, Download, ArrowLeftRight } from "lucide-react";

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recordRecentTool("text-base64");
  }, []);

  // Safe UTF-8 Base64 encode/decode
  const utf8Btoa = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str);
      const binString = String.fromCodePoint(...bytes);
      return btoa(binString);
    } catch (_) {
      return btoa(str);
    }
  };

  const utf8Atob = (base64: string) => {
    try {
      // Normalize base64 padding and remove whitespace
      const normalized = base64.replace(/\s/g, "");
      const binString = atob(normalized);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
      return new TextDecoder().decode(bytes);
    } catch (_) {
      return atob(base64);
    }
  };

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      setError(null);
      if (mode === "encode") {
        setOutput(utf8Btoa(input));
      } else {
        setOutput(utf8Atob(input));
      }
    } catch (err: any) {
      setOutput("");
      setError("Malformed Base64 payload. Could not decode.");
    }
  }, [input, mode]);

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
    a.download = mode === "encode" ? "mysofttools-base64-encoded.txt" : "mysofttools-base64-decoded.txt";
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
      question: "How does the Base64 tool handle Unicode or emojis?",
      answer: "Standard JavaScript `btoa()` and `atob()` functions fail on non-ASCII characters. Our tool uses binary `TextEncoder` arrays to pre-convert characters to UTF-8 buffers before encoding, ensuring emojis, Chinese symbols, or Spanish accents are fully supported.",
    },
    {
      question: "What is Base64 encoding used for?",
      answer: "Base64 represents binary data in an ASCII string format. It is widely used to embed images inside CSS/HTML, transmit credentials in HTTP headers, or transfer binary data through text-only mediums.",
    },
    {
      question: "Are my strings transmitted to any servers?",
      answer: "No. The encoding and decoding actions run instantly inside your browser RAM. Your data stays entirely private on your device.",
    },
  ];

  return (
    <ToolLayout toolId="text-base64">
      <div className="space-y-8">
        {/* Toggle Mode Bar */}
        <div className="flex justify-between items-center p-3 bg-muted/20 border border-border/60 rounded-2xl">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "encode" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Encode Text
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "decode" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Decode Base64
            </button>
          </div>

          <button
            onClick={toggleMode}
            className="p-2 rounded-xl border border-border hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
            title="Swap input and output"
          >
            <ArrowLeftRight className="w-4 h-4" /> Swap
          </button>
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
                {mode === "encode" ? "Raw Text Input" : "Base64 Code Input"}
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
                placeholder={mode === "encode" ? "Type or paste standard text here..." : "Paste your Base64 encoded string here..."}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {mode === "encode" ? "Base64 Code Output" : "Decoded Text Output"}
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
                placeholder={mode === "encode" ? "Encoded Base64 output will appear here..." : "Decoded text output will appear here..."}
              />
            </div>
          </div>
        </div>

        <SEOContent
          title="Base64 Encoder & Decoder"
          explanation="Our free online Base64 Encoder & Decoder wraps and unwraps text arrays locally in browser memory. Using text-encoding layouts, it fully supports UTF-8 Unicode characters (like emojis and accents) without exceptions."
          howToUse={[
            "Select 'Encode Text' to transform plain text to Base64 code, or 'Decode Base64' to extract text.",
            "Type or paste your content in the Left Input panel.",
            "The output panel updates in real-time. Click 'Copy' or 'Download' to save the output."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
