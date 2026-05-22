import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Tool Usage Agreement",
  description:
    "Review our terms of service. Understand the guidelines and agreement for using our client-side calculators, text utilities, and converters.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 font-sans text-xs leading-relaxed text-muted-foreground">
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Terms of Service</h1>
      <p className="text-xs text-muted-foreground font-mono">Last updated: May 22, 2026</p>

      <p className="text-sm text-foreground">
        Welcome to MySoftTools. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
      </p>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">1. Use License & Scope</h2>
        <p>
          We grant you permission to use our online calculators, image converters, text formatting scripts, and PDF tools for personal, academic, or commercial purposes. Because all processing is client-side, you retain 100% ownership and copyright of any outputs generated.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">2. Mathematical Disclaimer</h2>
        <p>
          While we strive to ensure that all financial, fitness, and scientific calculations (including EMI schedules, tax rates, BMI, and ages) are mathematically accurate, **all tool outputs are provided on an "as-is" basis**. 
        </p>
        <p>
          We do not guarantee the completeness or accuracy of any result. Users must not rely solely on calculator predictions for critical financial, legal, or medical decision-making. Always verify calculations with qualified professionals.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">3. Prohibited Activities</h2>
        <p>
          You agree not to engage in any activity that interferes with or disrupts the website’s functionality, including:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Attempting to upload malicious scripts or viruses into the client-side buffers.</li>
          <li>Performing automated scraping, denial of service (DoS) attacks, or bulk request loads that stress our server hosting layers.</li>
          <li>Reverse-engineering the frontend assets in a manner that infringes on trademark or intellectual properties.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">4. Limitation of Liability</h2>
        <p>
          In no event shall MySoftTools or its developers be liable for any damages (including, without limitation, damages for loss of data, profit, or business interruption) arising out of the use or inability to use the tools on our site, even if notified of the possibility of such damage.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">5. Modifications to Terms</h2>
        <p>
          We reserve the right to revise these Terms of Service at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these Terms.
        </p>
      </div>
    </div>
  );
}
