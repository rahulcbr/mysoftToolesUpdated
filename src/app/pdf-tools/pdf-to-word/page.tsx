"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(0);
  
  const workerInitialized = useRef(false);

  useEffect(() => {
    recordRecentTool("pdf-to-word");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      setExtractedText("");
      setPageCount(0);
      extractText(files[0]);
    }
  };

  const extractText = async (pdfFile: File) => {
    setIsProcessing(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      if (!workerInitialized.current) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        workerInitialized.current = true;
      }

      const fileBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: fileBuffer });
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY = -1;
        let pageText = "";

        // Sort items by position to extract readable lines
        const items: any[] = textContent.items;
        items.sort((a, b) => {
          if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
            return a.transform[4] - b.transform[4]; // Sort left to right
          }
          return b.transform[5] - a.transform[5]; // Sort top to bottom
        });

        for (const item of items) {
          const currentY = item.transform[5];
          if (lastY !== -1 && Math.abs(currentY - lastY) > 8) {
            pageText += "\n";
          }
          pageText += item.str + " ";
          lastY = currentY;
        }

        fullText += `<!-- PAGE ${i} -->\n${pageText.trim()}\n\n`;
      }

      setExtractedText(fullText.trim());
    } catch (err) {
      console.error("Text extraction failed:", err);
      alert("Could not extract text. Make sure the document is not password protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadWord = () => {
    if (!extractedText) return;

    // Build Word-compatible HTML file
    const paragraphs = extractedText
      .split("\n\n")
      .map((p) => {
        if (p.startsWith("<!-- PAGE")) {
          return `<p style="color:#6366f1; font-weight:bold; border-bottom:1px solid #e2e8f0; margin-top:20px; font-family:Arial, sans-serif;">${p.replace("<!-- ", "").replace(" -->", "")}</p>`;
        }
        return `<p style="margin-bottom:12px; line-height:1.5; font-family:Georgia, serif; font-size:11pt; text-align:justify;">${p.replace(/\n/g, "<br />")}</p>`;
      })
      .join("");

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Extracted PDF Document</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
      </head>
      <body style="padding:40px; max-width:800px; margin:0 auto;">
        ${paragraphs}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + htmlContent], {
      type: "application/msword;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = file ? file.name.substring(0, file.name.lastIndexOf(".")) : "document";
    a.download = `mysofttools-converted-${baseName}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      question: "How does the PDF to Word converter work?",
      answer: "The converter reads the PDF vector elements in your browser, parses the individual coordinate text blocks page-by-page, reconstructs standard paragraphs, and creates a Microsoft Word compatible document (.doc) that you can open and edit in Word, Google Docs, or Pages.",
    },
    {
      question: "Are scanned PDFs or images converted to text?",
      answer: "This is a layout text extractor. It reads structured text elements within standard vector PDFs. It does not run high-latency server OCR (Optical Character Recognition) on scanned images or raw photograph PDFs.",
    },
    {
      question: "Will the original document styling be preserved?",
      answer: "While it extracts all paragraphs, line breaks, and page boundaries, complex multi-column grids or custom graphics won't map exactly to Word's layout models. Basic text and paragraphs are fully preserved.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-to-word">
      <div className="space-y-8">
        {!file ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload your PDF file to convert to editable Word format"
          />
        ) : (
          <div className="space-y-6">
            {/* File info bar */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Original Pages: {pageCount} | Size: {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setExtractedText("");
                  setPageCount(0);
                }}
                className="text-xs text-muted-foreground hover:text-red-500 font-semibold"
              >
                Clear
              </button>
            </div>

            {isProcessing && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-semibold">
                  Extracting text layout from PDF pages...
                </p>
              </div>
            )}

            {!isProcessing && extractedText && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    Extracted Text Preview
                  </h3>
                  <button
                    onClick={handleDownloadWord}
                    className="px-5 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/25"
                  >
                    <Download className="w-4 h-4" /> Download Word Doc
                  </button>
                </div>

                <div className="w-full rounded-2xl border border-border bg-card overflow-hidden">
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full h-80 p-5 text-sm font-mono text-foreground bg-transparent focus:outline-none resize-none leading-relaxed"
                    placeholder="Extracted text will appear here..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <SEOContent
          title="PDF to Word Converter"
          explanation="Our client-side PDF to Word converter parses text layers from PDF files locally, reconstructing readable text paragraphs and formatting them into a standard Word-compatible document template. Since all routines run inside the browser memory sandbox, absolute privacy is guaranteed for your digital documents."
          howToUse={[
            "Select and upload the PDF file you wish to convert.",
            "Wait for the client-side parser to extract text strings from page layers.",
            "Review the extracted text preview inside the text window.",
            "Click 'Download Word Doc' to save your text as a standard editable Word (.doc) file."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
