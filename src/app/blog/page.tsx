import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Shield, Zap, Lock, BookOpen, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Official Blog - Privacy Guides & Utility Tips",
  description:
    "Read our official guides and articles on data privacy, client-side encryption, formatting tools, and math optimization systems on the MySoftTools blog.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = [
    {
      slug: "client-side-utility-privacy",
      title: "Why Client-Side Processing is the Future of Online Utilities",
      description: "Discover why standard file uploads represent security risks, and how browser-side libraries like PDF-Lib and Canvas safeguard your private data.",
      category: "Security",
      readTime: "4 min read",
      date: "May 22, 2026",
      icon: Shield,
    },
    {
      slug: "base64-url-encoding-explained",
      title: "Base64 & URL Percent Encoding: A Developer's Quick Guide",
      description: "Learn how data serialization forms work behind query parameters and base64 hashing, including safe parsing rules.",
      category: "Development",
      readTime: "3 min read",
      date: "May 18, 2026",
      icon: Lock,
      isPlaceholder: true,
    },
    {
      slug: "amortization-prepayment-math",
      title: "How Loan Prepayments Save Thousands in Interest Costs",
      description: "Analyze the mathematical compounding behind loan amortization schedules and see how small monthly extra payments slash terms.",
      category: "Finance",
      readTime: "5 min read",
      date: "May 10, 2026",
      icon: Zap,
      isPlaceholder: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 font-sans">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          MySoftTools Blog
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Insights, deep-dives, and tutorials on digital security, coding configurations, and financial planning calculators.
        </p>
      </div>

      {/* Featured Post Card */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        
        <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
          Featured Article
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground leading-snug">
          Why Client-Side Processing is the Future of Online Utilities
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Every time you upload a PDF to a standard utility website to split or compress it, your sensitive document is sent to an external server. We explore why browser-side compilation is the ultimate answer to digital privacy.
        </p>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
            <span>May 22, 2026</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 4 min read</span>
          </div>
          <Link
            href="/blog/client-side-utility-privacy"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Read Article <BookOpen className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {posts.slice(1).map((post, idx) => {
          const Icon = post.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-card border border-border rounded-3xl flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full border border-border/40">
                  {post.category}
                </span>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-2 border-t border-border/40">
                <span>{post.date}</span>
                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {post.readTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
