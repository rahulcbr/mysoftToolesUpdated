import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Serverless Device-Side Commitment",
  description:
    "Review our privacy policy. MySoftTools runs fully in your web browser. We never upload files, collect calculation inputs, or store private data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 font-sans text-xs leading-relaxed text-muted-foreground">
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground font-mono">Last updated: May 22, 2026</p>
      
      <p className="text-sm text-foreground">
        At MySoftTools, accessible from mysofttools.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information we do (and do not) collect and record.
      </p>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">1. 100% Client-Side Processing Promise</h2>
        <p>
          Unlike traditional utility websites that upload your files, images, PDFs, or raw text to a backend server for processing, **MySoftTools executes all actions locally inside your browser**. 
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Zero File Uploads:</strong> When you open a PDF or select an image to resize, the file is read directly into your device's memory. It is never transmitted across the internet to our servers.</li>
          <li><strong>Zero Data Caching:</strong> All conversions, calculations, case formatting, and image cropping actions run via client-side JavaScript APIs (HTML5 Canvas, PDF-Lib, etc.).</li>
          <li><strong>Instant Deletion:</strong> Because files are only loaded in temporary browser RAM, they are permanently cleared the moment you close the tab or refresh the page.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">2. Local Storage Usage</h2>
        <p>
          We use browser <code>localStorage</code> to store preferences for a better user experience:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Theme:</strong> Stores whether you prefer dark mode or light mode.</li>
          <li><strong>Recent Tools:</strong> Stores a history of the last few tools you visited to display a convenient "Recently Used" board on the homepage.</li>
          <li><strong>Scientific Calculator History:</strong> Stores your recent mathematical expressions so you don't lose track of active evaluations.</li>
        </ul>
        <p>This data stays on your local device and is never sent to our servers.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">3. Server Logs & Analytics</h2>
        <p>
          Like most standard websites, we may collect basic server log details (such as IP address, browser type, referral paths, and timestamps) for security purposes and server performance audits. This data is generic and is not linked to any personal files or mathematical inputs.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">4. GDPR and CCPA Compliance</h2>
        <p>
          Because we do not store, process, or transmit personal data or user files on our servers, MySoftTools natively complies with the General Data Protection Regulation (GDDR) and the California Consumer Privacy Act (CCPA). You hold full ownership of your data at all times.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">5. Contact Information</h2>
        <p>
          If you have questions about this policy or want to discuss security boundaries, feel free to email us at <strong>support@mysofttools.com</strong>.
        </p>
      </div>
    </div>
  );
}
