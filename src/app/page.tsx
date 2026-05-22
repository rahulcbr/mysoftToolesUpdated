"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, History, ShieldCheck, Heart, Zap, ArrowRight, Image as ImageIcon, FileText, Type, Calculator, HelpCircle } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { CATEGORIES, TOOLS, Tool } from "@/utils/toolsRegistry";

export default function HomePage() {
  const [recentTools, setRecentTools] = useState<Tool[]>([]);

  useEffect(() => {
    // Load recently used tools from localStorage
    try {
      const stored = localStorage.getItem("recentTools");
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const resolved = ids
          .map((id) => TOOLS.find((t) => t.id === id))
          .filter((t): t is Tool => !!t)
          .slice(0, 4); // Limit to 4
        setRecentTools(resolved);
      }
    } catch (_) {}
  }, []);

  const popularTools = TOOLS.filter((t) => t.isPopular).slice(0, 4);
  const trendingTools = TOOLS.filter((t) => t.isTrending).slice(0, 4);

  // Group tools by category to count them
  const categoryCounts = TOOLS.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative text-center py-8 md:py-16 space-y-6 overflow-hidden rounded-3xl p-6">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> 100% Free & Secure Online Tools
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Fast, Privacy-First Utilities for <span className="grad-text">Daily Tasks</span>
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Convert, compress, calculate, and format instantly in your browser. Your files never touch a server—100% client-side security guaranteed.
          </p>
        </div>

        {/* Large Prominent Search */}
        <div className="max-w-lg mx-auto pt-4">
          <SearchBar placeholder="Type to search e.g., 'Compress Image', 'EMI'..." />
        </div>
      </section>

      {/* 2. RECENTLY USED SECTION (Client-side localStorage) */}
      {recentTools.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Recently Used</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="group p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover-lift flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">
                    {tool.category}
                  </span>
                  <h3 className="font-bold text-sm md:text-base text-foreground mt-1 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="flex justify-end mt-3 text-primary text-xs font-semibold items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. CATEGORY GRID */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Explore Categories</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Select a toolset matching your workflow requirements</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const count = categoryCounts[key] || 0;
            return (
              <div
                key={key}
                className="group relative rounded-3xl p-6 md:p-8 border border-border/70 bg-card shadow-sm hover-lift flex flex-col justify-between min-h-[220px] overflow-hidden"
              >
                {/* Glow accent */}
                <div className={`absolute -right-12 -bottom-12 w-32 h-32 bg-gradient-to-tr ${cat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity pointer-events-none`} />

                <div className="space-y-4">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${cat.color} text-white w-fit shadow-md shadow-primary/10`}>
                    <DynamicIcon name={cat.icon} className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-sm">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {count} Tools Available
                  </span>
                  <Link
                    href={cat.path}
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-primary group-hover:translate-x-1 transition-transform"
                  >
                    Explore Tools <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. POPULAR & TRENDING GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Popular list */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Popular Tools</h2>
          </div>
          <div className="space-y-4">
            {popularTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="group flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10 transition-all duration-200"
              >
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px] sm:max-w-md">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Trending list */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Trending Now</h2>
          </div>
          <div className="space-y-4">
            {trendingTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="group flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10 transition-all duration-200"
              >
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px] sm:max-w-md">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US SECTION */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Security & Architecture</h2>
          <p className="text-xs md:text-sm text-muted-foreground">What makes MySoftTools distinct and reliable</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-border/60 text-center space-y-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full w-fit mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">100% Privacy Secure</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              We process PDFs, images, and calculations entirely within your browser memory. Your files are never uploaded or stored on any server.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 border border-border/60 text-center space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full w-fit mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Blazing Performance</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Skip network lags and transfer limits. Locally executed Javascript modules process items instantly, speeding up workflows.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 border border-border/60 text-center space-y-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full w-fit mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Beautiful Design</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Forget clunky interfaces. MySoftTools offers high-end aesthetics, light/dark themes, and responsive design systems.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ & SEO SECTION */}
      <section className="border-t border-border/50 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">General FAQs</h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Have questions about how our browser-based utility platform operates? Find detailed responses here.
          </p>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {[
            {
              q: "Are my files stored on mysofttools.com?",
              a: "Absolutely not. MySoftTools operates on a zero-file-storage architecture. All PDF editing, image conversion, and data format processing are handled client-side inside your browser using HTML5 Canvas, WebGL, and Javascript libraries. Files are read as local variables and are deleted immediately when the browser tab is closed.",
            },
            {
              q: "Is it completely free to use?",
              a: "Yes. All of our 50+ tools, converter suites, and calculators are fully functional and 100% free of charge. There are no registration thresholds, subscriptions, or hidden limits.",
            },
            {
              q: "Does MySoftTools work on mobile phones?",
              a: "Yes, MySoftTools was designed with a mobile-first responsive architecture. You can easily upload files, run regex tests, and perform calculations directly from Safari, Chrome, or any mobile browser.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-card space-y-2">
              <h3 className="font-bold text-sm md:text-base text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" /> {faq.q}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
