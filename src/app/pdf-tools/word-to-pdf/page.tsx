"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Settings, Sparkles, Loader2 } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function WordToPdfPage() {
  const [docTitle, setDocTitle] = useState("My Soft Document");
  const [textContent, setTextContent] = useState(
    "Type or paste your document content here...\n\nThis converter supports standard plain text paragraphs, headings, list breaks, and will automatically calculate page margins and page breaks to output a clean PDF document."
  );
  
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState<number | null>(null);

  useEffect(() => {
    recordRecentTool("word-to-pdf");
  }, []);

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Determine dimensions (in points)
      const isA4 = pageSize === "a4";
      const pageWidth = isA4 ? 595.27 : 612;
      const pageHeight = isA4 ? 841.89 : 792;
      const margin = 50;

      const usableWidth = pageWidth - 2 * margin;
      const usableHeight = pageHeight - 2 * margin;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Add document title
      if (docTitle) {
        currentPage.drawText(docTitle, {
          x: margin,
          y: currentY - 10,
          size: 20,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        currentY -= 45;
      }

      // Helper to wrap text into lines based on width
      const wrapText = (text: string, width: number, font: any, fontSize: number) => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > width) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines;
      };

      // Split user text into paragraph blocks
      const paragraphs = textContent.split("\n");

      for (const p of paragraphs) {
        const isHeader = p.startsWith("# ");
        const cleanText = isHeader ? p.substring(2) : p;
        const fontSize = isHeader ? 14 : 10.5;
        const lineSpacing = isHeader ? 22 : 15;
        const font = isHeader ? boldFont : helveticaFont;
        const color = isHeader ? rgb(0.15, 0.15, 0.15) : rgb(0.25, 0.25, 0.25);

        // Skip blank paragraphs, but leave visual spacing
        if (cleanText.trim() === "") {
          currentY -= 10;
          continue;
        }

        const lines = wrapText(cleanText, usableWidth, font, fontSize);

        for (const line of lines) {
          if (currentY - lineSpacing < margin) {
            // Create a new page and reset Y coordinate
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          currentPage.drawText(line, {
            x: margin,
            y: currentY - fontSize,
            size: fontSize,
            font,
            color,
          });

          currentY -= lineSpacing;
        }

        // Space after paragraphs
        currentY -= 8;
      }

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(URL.createObjectURL(pdfBlob));
      setPdfSize(pdfBlob.size);
    } catch (error) {
      console.error("PDF construction failed:", error);
      alert("Error compiling text to PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const faqs = [
    {
      question: "Can I add headings to my document?",
      answer: "Yes. Start any line with '# ' (a hash followed by a space) to turn it into a bold document heading. Paragraph text is written in standard Helvetica.",
    },
    {
      question: "Does it support long documents with page breaks?",
      answer: "Absolutely. Our compiler computes page margins dynamically. If your text overflows the page boundaries, it automatically constructs subsequent pages (Page 2, 3, etc.) and keeps writing.",
    },
    {
      question: "Are my entries secure?",
      answer: "Yes, completely. No database or cloud server holds your written texts. All PDF formatting algorithms execute inside temporary browser memory variables.",
    },
  ];

  return (
    <ToolLayout toolId="word-to-pdf">
      <div className="space-y-8">
        <div className="space-y-6">
          {/* Document configuration controls */}
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Header Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="My Document"
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Page Format</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="a4">A4 (Standard paper format)</option>
                <option value="letter">Letter (US paper format)</option>
              </select>
            </div>
          </div>

          {/* Core editor text panel */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground flex justify-between">
              <span>Document Workspace</span>
              <span className="text-xs text-muted-foreground">Start lines with &quot;# &quot; for bold headers</span>
            </label>
            <div className="w-full rounded-3xl border border-border bg-card overflow-hidden">
              <textarea
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  setPdfUrl(null);
                  setPdfSize(null);
                }}
                className="w-full h-96 p-6 text-sm text-foreground bg-transparent focus:outline-none resize-none leading-relaxed font-sans"
                placeholder="Type your document paragraphs here..."
              />
            </div>
          </div>

          {/* Processing / Download Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border/40 pt-6">
            <button
              onClick={() => {
                setTextContent("");
                setPdfUrl(null);
                setPdfSize(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
            >
              Clear Editor
            </button>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-primary hover:bg-primary/5 text-primary text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Compiling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Compile PDF
                  </>
                )}
              </button>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={`${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.pdf`}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Download PDF ({pdfSize ? formatSize(pdfSize) : ""})
                </a>
              )}
            </div>
          </div>
        </div>

        <SEOContent
          title="Word to PDF Converter"
          explanation="Our client-side Word to PDF generator lets you convert text entries or digital drafts into a clean, multi-page PDF document. Using standard programmatic typography layouts (Helvetica) and margin-wrapping mathematical coordinates, the compiler writes pages directly in your local browser sandbox, securing absolute data privacy."
          howToUse={[
            "Input a custom document header title.",
            "Write or paste your text copy inside the document workspace editor. Prefix lines with '# ' to format headings.",
            "Choose your page format (A4 or US Letter size).",
            "Click 'Compile PDF' to run the client-side formatting compiler.",
            "Review and tap 'Download PDF' to save your file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
