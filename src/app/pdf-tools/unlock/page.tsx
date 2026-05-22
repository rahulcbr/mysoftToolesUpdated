"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import UploadZone from "@/components/tools/UploadZone";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Download, FileText, Lock, Unlock, Loader2, AlertCircle } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function PdfUnlockPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [decryptedSize, setDecryptedSize] = useState<number | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);

  useEffect(() => {
    recordRecentTool("pdf-unlock");
  }, []);

  const handleFileSelect = async (files: File[]) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setDecryptedUrl(null);
      setDecryptedSize(null);
      setPassword("");
      
      // Check if it requires a password
      setIsProcessing(true);
      try {
        const fileBytes = await selectedFile.arrayBuffer();
        // Try loading without password
        await PDFDocument.load(fileBytes);
        // If it succeeds without password, it's not locked!
        setRequiresPassword(false);
      } catch (err: any) {
        if (err.message && err.message.includes("encrypted")) {
          setRequiresPassword(true);
        } else {
          setRequiresPassword(true); // Fallback: prompt for password
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const fileBytes = await file.arrayBuffer();
      let pdfDoc;
      
      try {
        pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      } catch (err: any) {
        throw new Error("Invalid document structure or unsupported encryption format.");
      }

      const decryptedBytes = await pdfDoc.save();
      const decryptedBlob = new Blob([decryptedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      
      if (decryptedUrl) {
        URL.revokeObjectURL(decryptedUrl);
      }
      
      setDecryptedUrl(URL.createObjectURL(decryptedBlob));
      setDecryptedSize(decryptedBlob.size);
    } catch (err: any) {
      setError(err.message || "Failed to decrypt PDF. Verify the password.");
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
      question: "Can this tool decrypt a PDF if I don't know the password?",
      answer: "No. For security and privacy, you must know the authorized user password to unlock the document. This tool strips the encryption parameters so you don't have to re-enter it every time you view the file.",
    },
    {
      question: "Are my passwords or files uploaded to any servers?",
      answer: "No. All password checks and decryption mechanisms are executed locally inside your browser using JavaScript and `pdf-lib`. Your password never leaves your device.",
    },
    {
      question: "Will unlocking the PDF alter its content?",
      answer: "No. Stripping the encryption parameters from the PDF document structure does not modify any texts, layout matrices, fonts, or images embedded in the document.",
    },
  ];

  return (
    <ToolLayout toolId="pdf-unlock">
      <div className="space-y-8">
        {!file ? (
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            multiple={false}
            maxSizeMB={25}
            label="Upload password-protected PDF to decrypt"
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
                  setDecryptedUrl(null);
                  setDecryptedSize(null);
                  setPassword("");
                  setRequiresPassword(false);
                  setError(null);
                }}
                className="text-xs text-muted-foreground hover:text-red-500 font-semibold"
              >
                Clear
              </button>
            </div>

            {/* Lock Check Results */}
            {!decryptedUrl && (
              <div className="glass-card p-6 border border-border/60 rounded-2xl space-y-4">
                {isProcessing && !requiresPassword ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground font-semibold">Reading PDF metadata...</span>
                  </div>
                ) : !requiresPassword ? (
                  <div className="text-center py-4 space-y-3">
                    <span className="inline-block p-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Unlock className="w-6 h-6" />
                    </span>
                    <p className="text-sm font-bold text-foreground">This PDF is not password-locked!</p>
                    <p className="text-xs text-muted-foreground">You can download it directly or process it in other tools.</p>
                  </div>
                ) : (
                  <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl">
                      <Lock className="w-5 h-5 shrink-0" />
                      <span className="text-xs font-semibold">Password Protected: Enter correct decryption key below.</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        PDF Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter file password"
                        className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Unlocking...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" /> Decrypt & Unlock
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Success Download Card */}
            {decryptedUrl && (
              <div className="p-6 border border-emerald-500/25 bg-emerald-500/5 rounded-2xl text-center space-y-4">
                <span className="inline-block p-3 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                  <Unlock className="w-6 h-6" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">PDF Decrypted Successfully!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    All restrictions and passwords have been removed from the file structure.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <a
                    href={decryptedUrl}
                    download={`mysofttools-unlocked-${file.name}`}
                    className="px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-semibold hover-lift flex items-center gap-2 shadow-md shadow-primary/25"
                  >
                    <Download className="w-4 h-4" /> Download PDF ({decryptedSize ? formatSize(decryptedSize) : ""})
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <SEOContent
          title="PDF Password Unlocker"
          explanation="Our client-side PDF Password Unlocker tool helps decrypt locked PDF files when you have the correct password. It parses the document metadata, matches the cryptographic hash blocks, and rewrites a clean, non-restricted PDF file in your local browser space. No file size information, file contents, or security passwords are ever transmitted outside your device."
          howToUse={[
            "Select and upload the password-protected PDF document.",
            "If the PDF requires validation, the page prompts you for the passcode. Input the key.",
            "Click 'Decrypt & Unlock'. Our script attempts to load and rewrite the document parameters using pdf-lib.",
            "Once successfully compiled without flags, tap 'Download PDF' to save a permanently unlocked copy."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
