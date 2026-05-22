"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Type, Sparkles, Loader2, Sliders, Palette, Layout } from "lucide-react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

type PositionType = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "grid";
type ColorType = "gray" | "red" | "blue" | "black" | "white";

export default function PdfWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [rotation, setRotation] = useState(-45);
  const [position, setPosition] = useState<PositionType>("center");
  const [color, setColor] = useState<ColorType>("gray");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  const [watermarkedSize, setWatermarkedSize] = useState<number | null>(null);

  useEffect(() => {
    recordRecentTool("pdf-watermark");
  }, []);

  const handleFileSelect = (files: File[]) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      setWatermarkedUrl(null);
      setWatermarkedSize(null);
    }
  };

  const handleApplyWatermark = async () => {
    if (!file || !text) return;
    setIsProcessing(true);

    try {
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      // Resolve color
      let colorValue = rgb(0.5, 0.5, 0.5);
      if (color === "red") colorValue = rgb(0.9, 0.1, 0.1);
      else if (color === "blue") colorValue = rgb(0.1, 0.3, 0.9);
      else if (color === "black") colorValue = rgb(0.0, 0.0, 0.0);
      else if (color === "white") colorValue = rgb(1.0, 1.0, 1.0);

      // Loop through all pages to apply the watermark
      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize;

        const drawTextAt = (x: number, y: number) => {
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font: helveticaFont,
            color: colorValue,
            opacity: opacity,
            rotate: degrees(rotation),
          });
        };

        if (position === "center") {
          // Center calculations
          const x = (width - textWidth) / 2;
          const y = (height - textHeight) / 2;
          drawTextAt(x, y);
        } else if (position === "top-left") {
          drawTextAt(40, height - 60);
        } else if (position === "top-right") {
          drawTextAt(width - textWidth - 40, height - 60);
        } else if (position === "bottom-left") {
          drawTextAt(40, 60);
        } else if (position === "bottom-right") {
          drawTextAt(width - textWidth - 40, 60);
        } else if (position === "grid") {
          // Repeat in a grid pattern
          const xStep = Math.max(textWidth * 1.5, 200);
          const yStep = Math.max(fontSize * 3.5, 150);

          for (let x = 50; x < width; x += xStep) {
            for (let y = 50; y < height; y += yStep) {
              drawTextAt(x, y);
            }
          }
        }
      }

      const watermarkedBytes = await pdfDoc.save();
      const watermarkedBlob = new Blob([watermarkedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (watermarkedUrl) {
        URL.revokeObjectURL(watermarkedUrl);
      }

      setWatermarkedUrl(URL.createObjectURL(watermarkedBlob));
      setWatermarkedSize(watermarkedBlob.size);
    } catch (error) {
      console.error("PDF Watermarking failed:", error);
      alert("Error occurred during client-side PDF watermarking.");
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
      question: "Will the watermarks display on mobile PDF viewers?",
      answer: "Yes. The text overlays are drawn directly into the page content stream of the PDF file structure using standard vector parameters. They render natively on all systems, including iOS, Android, and web browsers.",
    },
    {
      question: "Can I use logos or graphic watermarks instead of text?",
      answer: "This tool currently supports text-based watermarks with customizable opacity, rotation, and colors, which is standard for confidential stamps. For logo watermarks, you can print watermarks on image formats and convert them back to PDF.",
    },
    {
      question: "Are my secure PDFs or text inputs uploaded?",
      answer: "No. The entire watermarking process takes place in your browser memory via clientside JavaScript libraries. Your private documents are never transmitted to any external networks.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-watermark">
      <div className="space-y-8">
        {!file ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload your PDF file to add watermark"
          />
        ) : (
          <div className="space-y-6">
            {/* File info card */}
            <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Original Size: {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setWatermarkedUrl(null);
                  setWatermarkedSize(null);
                }}
                className="text-xs text-muted-foreground hover:text-red-500 font-semibold"
              >
                Clear
              </button>
            </div>

            {/* Config & Controls */}
            {!watermarkedUrl && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Text Settings */}
                <div className="glass-card p-6 border border-border/60 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" /> Watermark Style
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. DRAFT, CONFIDENTIAL"
                      className="w-full px-4 py-2 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Font Size</span>
                      <span className="text-primary font-mono">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Rotation Angle</span>
                      <span className="text-primary font-mono">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Opacity</span>
                      <span className="text-primary font-mono">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={Math.round(opacity * 100)}
                      onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* Placement & Colors */}
                <div className="glass-card p-6 border border-border/60 rounded-2xl space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Layout className="w-4 h-4 text-primary" /> Layout & Position
                    </h3>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Alignment Position
                      </label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value as PositionType)}
                        className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none"
                      >
                        <option value="center">Center of Page</option>
                        <option value="top-left">Top Left Corner</option>
                        <option value="top-right">Top Right Corner</option>
                        <option value="bottom-left">Bottom Left Corner</option>
                        <option value="bottom-right">Bottom Right Corner</option>
                        <option value="grid">Tile Grid Pattern</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" /> Stamp Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {(["gray", "red", "blue", "black", "white"] as ColorType[]).map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                              color === c
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-border hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleApplyWatermark}
                    disabled={isProcessing || !text}
                    className="w-full mt-4 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Apply Watermark
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success Download Card */}
            {watermarkedUrl && (
              <div className="p-6 border border-emerald-500/25 bg-emerald-500/5 rounded-2xl text-center space-y-4">
                <span className="inline-block p-3 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                  <Type className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">PDF Watermarked Successfully!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your custom text stamp has been applied across all document pages locally.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setWatermarkedUrl(null);
                      setWatermarkedSize(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                  >
                    Watermark Again
                  </button>
                  <a
                    href={watermarkedUrl}
                    download={`mysofttools-watermarked-${file.name}`}
                    className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/25"
                  >
                    <Download className="w-4 h-4" /> Download PDF ({watermarkedSize ? formatSize(watermarkedSize) : ""})
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <SEOContent
          title="PDF Watermark Tool"
          explanation="Our client-side PDF Watermark Tool lets you overlay security stamps like 'CONFIDENTIAL', 'DRAFT', or 'DO NOT COPY' onto your documents. You can customize font sizes, rotation angles, opacities, stamp colors, and position alignment (including repeating grid tiles). Running entirely on the client, your files never touch a server, keeping your legal papers or billing invoices 100% private."
          howToUse={[
            "Select and upload the PDF file you wish to protect.",
            "Type in your watermark text, and modify style parameters like font size, tilt angle, or transparency.",
            "Choose a position alignment (like Center, Corner placement, or Tile Grid).",
            "Pick a color for the text overlay.",
            "Click 'Apply Watermark' to write vector overlays on all pages using pdf-lib.",
            "Tap 'Download PDF' to save your watermarked document."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
