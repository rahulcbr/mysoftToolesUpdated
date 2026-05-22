import React from "react";
import Link from "next/link";
import { Wrench, Mail, ShieldAlert, Scale, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg grad-primary text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                MySoft<span className="grad-text">Tools</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Premium, free, and privacy-first online tools. All operations run securely inside your browser using modern WebAssembly and local execution. No files are ever saved on our servers.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Client-Side
              </span>
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-blue-500" /> No Upload Logs
              </span>
            </div>
          </div>

          {/* Column 1: Image & PDF */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">File Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/image-tools" className="hover:text-foreground transition-colors">Image Tools</Link></li>
              <li><Link href="/image-tools/compress" className="hover:text-foreground transition-colors">Compress Image</Link></li>
              <li><Link href="/image-tools/convert" className="hover:text-foreground transition-colors">Convert Format</Link></li>
              <li><Link href="/pdf-tools" className="hover:text-foreground transition-colors">PDF Utilities</Link></li>
              <li><Link href="/pdf-tools/unlock" className="hover:text-foreground transition-colors">Unlock PDF</Link></li>
            </ul>
          </div>

          {/* Column 2: Text & Calculators */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Logic Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/text-tools" className="hover:text-foreground transition-colors">Text Tools</Link></li>
              <li><Link href="/text-tools/json-formatter" className="hover:text-foreground transition-colors">JSON Formatter</Link></li>
              <li><Link href="/text-tools/diff" className="hover:text-foreground transition-colors">Diff Checker</Link></li>
              <li><Link href="/calculators" className="hover:text-foreground transition-colors">Calculators</Link></li>
              <li><Link href="/calculators/emi" className="hover:text-foreground transition-colors">EMI Calculator</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform & Legal */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">SEO Blog</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Terms of Use</Link></li>
              <li><Link href="/dmca" className="hover:text-foreground transition-colors flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> DMCA Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* AdSense Placeholder Area */}
        <div className="w-full max-w-4xl mx-auto my-8 border border-dashed border-border/60 rounded-2xl p-4 bg-muted/20 text-center text-xs text-muted-foreground flex flex-col items-center justify-center min-h-[90px]" aria-hidden="true">
          <span className="font-semibold uppercase tracking-wider text-[10px] mb-1">Sponsored Advertisement</span>
          <span>This premium placement is reserved for future Google AdSense integrations.</span>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <span>&copy; {new Date().getFullYear()} MySoftTools. All rights reserved. Built for supreme speed and data privacy.</span>
          <div className="flex gap-4">
            <Link href="mailto:support@mysofttools.com" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Mail className="w-3.5 h-3.5" /> support@mysofttools.com
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
