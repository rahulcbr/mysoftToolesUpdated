"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Copy, Clipboard, Eye, Edit3, FileCode } from "lucide-react";

export default function MarkdownToolPage() {
  const [input, setInput] = useState(
    `# Markdown Live Previewer

Welcome to **MySoftTools** Markdown editor! This tool compiles your markdown text in real-time.

## Key Features
* **100% Client-Side**: Safe, secure, and fast.
* **Instant Feedback**: View formatted changes side-by-side.
* **Styled Elements**: Fully supports headers, lists, code, and links.

### Code Block Example:
\`\`\`javascript
const greeting = "Hello World!";
console.log(greeting);
\`\`\`

> "Simplicity is the ultimate sophistication."
> — Leonardo da Vinci

Here is a [link to MySoftTools](https://mysofttools.com) website.`
  );
  const [htmlOutput, setHtmlOutput] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");

  useEffect(() => {
    recordRecentTool("text-markdown");
  }, []);

  // Simple, elegant, secure client-side Markdown to HTML renderer
  const parseMarkdownToHtml = (md: string): string => {
    let html = md;

    // Escape raw HTML tags first to prevent XSS injection
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code Blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
      return `<pre class="bg-muted p-4 rounded-xl font-mono text-xs overflow-x-auto border border-border my-4 block whitespace-pre"><code class="text-primary">${code.trim()}</code></pre>`;
    });

    // Inline Code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-pink-500 border border-border">$1</code>');

    // Bold (**text** or __text__)
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Italic (*text* or _text_)
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Blockquotes (> text)
    html = html.replace(/^\s*>\s+(.+)$/gm, '<blockquote class="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-3 rounded-r-lg text-muted-foreground italic">$1</blockquote>');

    // Headers (# to ######)
    html = html.replace(/^\s*######\s+(.+)$/gm, '<h6 class="text-sm font-bold text-foreground mt-4 mb-2">$1</h6>');
    html = html.replace(/^\s*#####\s+(.+)$/gm, '<h5 class="text-base font-bold text-foreground mt-4 mb-2">$1</h5>');
    html = html.replace(/^\s*####\s+(.+)$/gm, '<h4 class="text-lg font-bold text-foreground mt-5 mb-2">$1</h4>');
    html = html.replace(/^\s*###\s+(.+)$/gm, '<h3 class="text-xl font-bold text-foreground mt-5 mb-2">$1</h3>');
    html = html.replace(/^\s*##\s+(.+)$/gm, '<h2 class="text-2xl font-bold text-foreground border-b border-border/40 pb-1 mt-6 mb-3">$1</h2>');
    html = html.replace(/^\s*#\s+(.+)$/gm, '<h1 class="text-3xl font-extrabold text-foreground border-b border-border pb-2 mt-8 mb-4">$1</h1>');

    // Horizontal Rules
    html = html.replace(/^\s*(---\s*|\*\*\*\s*)$/gm, '<hr class="border-border/60 my-6" />');

    // Bullet Lists (* or - or + item)
    html = html.replace(/^\s*[*+-]\s+(.+)$/gm, '<li class="list-disc ml-6 py-0.5 text-foreground">$1</li>');

    // Ordered Lists (1. item)
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="list-decimal ml-6 py-0.5 text-foreground">$1</li>');

    // Links ([text](url))
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">$1</a>');

    // Paragraphs: split by double newlines and wrap remaining plain lines in <p>
    const lines = html.split("\n\n");
    const parsedLines = lines.map((line) => {
      const trimmed = line.trim();
      // Skip wrapping if it's already wrapped in block elements
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<hr") ||
        !trimmed
      ) {
        return trimmed;
      }
      // Replace single newlines with <br> inside paragraphs
      return `<p class="text-sm text-foreground/80 leading-relaxed mb-3">${trimmed.replace(/\n/g, "<br>")}</p>`;
    });

    return parsedLines.join("\n");
  };

  useEffect(() => {
    setHtmlOutput(parseMarkdownToHtml(input));
  }, [input]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlOutput);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setInput(clipboardText);
    } catch (_) {}
  };

  const faqs = [
    {
      question: "Is this Markdown editor secure?",
      answer: "Yes, 100%. Before parsing, the editor automatically escapes all raw HTML input tags (`<` and `>`), shielding against XSS vulnerabilities or external script injections.",
    },
    {
      question: "What Markdown features are supported?",
      answer: "We support classic Markdown tokens: Headers (# to ######), bold/italics, blockquotes, unordered/ordered lists, block code formatting, inline highlight backticks, horizontal rules, and hyperlinks.",
    },
    {
      question: "Can I copy the compiled HTML output?",
      answer: "Yes, you can click the 'Copy HTML' button at the top of the preview panel to copy the exact rendered HTML string to your clipboard for deployment in email templates, CMS, or website code.",
    },
  ];

  return (
    <ToolLayout toolId="text-markdown">
      <div className="space-y-8">
        {/* View Mode Bar */}
        <div className="flex justify-between items-center p-3 bg-muted/20 border border-border/60 rounded-2xl">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("split")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "split" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Side-by-Side Split
            </button>
            <button
              onClick={() => setViewMode("editor")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "editor" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Editor Only
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "preview" ? "bg-primary text-white shadow-md" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Preview Only
            </button>
          </div>

          {viewMode !== "editor" && (
            <button
              onClick={handleCopyHtml}
              className="p-2 rounded-xl border border-border hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Copy compiled HTML tags"
            >
              <FileCode className="w-4 h-4" /> Copy HTML
            </button>
          )}
        </div>

        {/* Panes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Markdown Panel */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div className={`space-y-3 ${viewMode === "editor" ? "col-span-2" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Markdown Editor
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePaste}
                    className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground flex items-center gap-1 transition-colors"
                  >
                    Paste
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
                  className="w-full h-[500px] p-5 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-mono"
                  placeholder="Type or paste markdown code here..."
                />
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={`space-y-3 ${viewMode === "preview" ? "col-span-2" : ""}`}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Rich Visualizer Preview
              </span>
              <div className="rounded-2xl border border-border bg-card overflow-hidden h-[500px] p-5 overflow-y-auto">
                {/* Visualizer content renders compiled HTML with proper CSS variables */}
                <div
                  className="markdown-preview space-y-4 text-foreground/90 font-sans"
                  dangerouslySetInnerHTML={{ __html: htmlOutput || "<p class='text-muted-foreground text-xs italic'>Preview will appear here</p>" }}
                />
              </div>
            </div>
          )}
        </div>

        <SEOContent
          title="Markdown Live Previewer"
          explanation="Our free online Markdown Live Previewer is a browser-based parser to edit Markdown scripts and preview structured layouts instantly. Perfect for generating clean email content, blog posts, or README updates."
          howToUse={[
            "Select your view mode: Split screen, Editor only, or Preview only.",
            "Write or paste Markdown notation inside the Editor text field.",
            "Inspect the styled visual representation in the Preview block and copy the compiled HTML output if needed."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
