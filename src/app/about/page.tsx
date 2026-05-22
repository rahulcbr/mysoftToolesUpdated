import React from "react";
import { Metadata } from "next";
import { ShieldCheck, Zap, Heart, Code } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Our Client-Side Privacy Promise",
  description:
    "Discover the story behind MySoftTools. Learn how our 100% browser-side execution ensures your file data and calculator details remain private.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4 font-sans">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          About MySoftTools
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          The web is full of online utility tools, but most are cluttered with invasive popups, slow upload times, and hidden privacy compromises. We decided to build a better way.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Pillars */}
        <div className="p-5 bg-card border border-border rounded-3xl space-y-3">
          <div className="p-2 w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground">100% Secure & Private</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every image compress, PDF rotate, word count, or decimal math happens completely on your device. Your sensitive files and inputs never touch our servers.
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-3xl space-y-3">
          <div className="p-2 w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Blazing Fast Speed</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Because files do not upload or download over external networks, processing is near-instant. Speed is limited only by your CPU.
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-3xl space-y-3">
          <div className="p-2 w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Code className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Modern Open-Source Stack</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Built using modern frameworks like Next.js, Tailwind CSS v4, Lucide Icons, and client-side processing engines like PDF-Lib.
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-3xl space-y-3">
          <div className="p-2 w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Ad-Light & UX-First</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We focus on clean, dark-mode friendly glassmorphic visuals that scale elegantly from small smartphones to massive desktops.
          </p>
        </div>
      </div>

      <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-primary">Our Mission</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          MySoftTools was created by developers, for developers, writers, designers, and students. We believe utility tools should be utility-focused: no subscriptions, no accounts, no files leaving your computer, and no complex dashboards. Just quick, accurate operations right when you need them.
        </p>
      </div>
    </div>
  );
}
