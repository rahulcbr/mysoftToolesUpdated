import React from "react";
import { Metadata } from "next";
import CategoryPage from "@/components/tools/CategoryPage";

export const metadata: Metadata = {
  title: "Online PDF Utilities - Merge, Split, Rotate & Unlock",
  description:
    "Free, client-side PDF tools. Remove PDF password restrictions, combine multiple documents, split pages, and stamp watermarks. 100% secure in-browser PDF manager.",
  alternates: {
    canonical: "/pdf-tools",
  },
};

export default function PDFToolsCategory() {
  const aboutText =
    "Handling PDF documents often involves sensitive personal information, which is why sending files to cloud servers is a major security risk. Our PDF Utilities resolve this by running 100% inside your browser. Using the high-performance 'pdf-lib' library, we let you merge pages, split files, rotate orientations, stamp draft watermarks, and unlock restricted passwords locally. Your documents are read directly into browser memory as byte arrays and are compiled instantly for download without leaving your device.";

  const howToUse = [
    "Select your target utility (e.g., Merge PDF or PDF Password Unlocker) from the options above.",
    "Drag and drop your PDF files into the drag-and-drop workspace, or tap to choose files.",
    "Customize settings: drag files to reorder for merging, type password keys to unlock, or choose page number grids for splitting.",
    "Click the action button to process. A secure, in-memory compilation occurs instantly.",
    "Save the resulting PDF by clicking the download link.",
  ];

  const faqs = [
    {
      question: "Is it safe to upload confidential bank statements or contracts here?",
      answer:
        "Yes, it is entirely safe. Unlike traditional PDF converters, MySoftTools does not upload your files. All parsing and rebuilding occur directly in your browser. Your confidential information is never exposed to the internet.",
    },
    {
      question: "How do I unlock a password-protected PDF?",
      answer:
        "Select the PDF Unlocker tool, select your file, enter the security password, and the script will strip the password encryption to output a clean, unrestricted PDF file.",
    },
    {
      question: "What is the maximum file size supported?",
      answer:
        "To ensure stable local memory usage, we recommend uploading PDF documents that are under 25MB, though modern computers can handle larger files easily.",
    },
    {
      question: "Do I need to install any software or extensions?",
      answer:
        "No software installation is required. Everything runs in standard web browsers like Chrome, Firefox, Safari, and Edge.",
    },
  ];

  return (
    <CategoryPage
      categoryKey="pdf"
      aboutText={aboutText}
      howToUse={howToUse}
      faqs={faqs}
    />
  );
}
