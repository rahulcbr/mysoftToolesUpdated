import React from "react";
import { Metadata } from "next";
import CategoryPage from "@/components/tools/CategoryPage";

export const metadata: Metadata = {
  title: "Online Image Tools - Compress, Resize, Crop & Convert",
  description:
    "Free, secure browser-based image utilities. Compress image sizes, change height/width dimensions, convert between formats, crop, and add watermarks with 100% data privacy.",
  alternates: {
    canonical: "/image-tools",
  },
};

export default function ImageToolsCategory() {
  const aboutText =
    "Our suite of online image tools is designed to provide professional-grade image processing without sacrificing data security. Whether you need to compress image sizes to optimize webpage performance, scale heights and widths for social media banners, or convert format structures like PNG to WEBP, all operations execute locally inside your web browser. By leveraging the HTML5 Canvas API and WebGL capabilities, we eliminate the need for server uploads, guaranteeing your private photos remain strictly on your machine.";

  const howToUse = [
    "Navigate to your desired image tool from the grid options above (e.g., Compress Image, Resize, or Background Remover).",
    "Drag and drop your image file directly into the dotted upload box, or click to browse files on your device.",
    "Adjust target parameters, such as sliding compression percentages or typing pixel widths and heights.",
    "Inspect the instant side-by-side preview panel showing file size changes and visual qualities.",
    "Click the download button to export the optimized file immediately to your local system.",
  ];

  const faqs = [
    {
      question: "Are my uploaded photos or graphics sent to a server?",
      answer:
        "No. MySoftTools runs on a zero-upload architecture. All crop, resize, watermark, and compression calculations are computed client-side inside your browser. No files are transferred to our servers.",
    },
    {
      question: "What image file formats do you support?",
      answer:
        "We support all major web and graphic formats including JPG, JPEG, PNG, WEBP, GIF, BMP, and SVG vector uploads.",
    },
    {
      question: "Can I use these image tools on my smartphone?",
      answer:
        "Yes, all image processing tools are mobile-responsive and support touch crop bounding boxes and local downloads on iOS and Android devices.",
    },
    {
      question: "Is there a limit on how many images I can process?",
      answer:
        "There are no limits on the number of images you can edit or convert. You can run as many tasks as you need, free of charge.",
    },
  ];

  return (
    <CategoryPage
      categoryKey="image"
      aboutText={aboutText}
      howToUse={howToUse}
      faqs={faqs}
    />
  );
}
