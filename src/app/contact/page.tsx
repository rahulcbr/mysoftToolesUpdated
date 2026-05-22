"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("sending");
    // Simulate API request
    setTimeout(() => {
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 font-sans">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Contact Us
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Have feedback, a tool request, or found a bug? Drop us a message using the form below and we will get back to you shortly.
        </p>
      </div>

      <div className="p-6 md:p-8 bg-card border border-border rounded-3xl shadow-sm space-y-6">
        {status === "success" ? (
          <div className="py-12 flex flex-col justify-center items-center text-center space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Message Sent!</h2>
            <p className="text-xs text-muted-foreground max-w-xs">
              Thank you for contacting MySoftTools. Our team has received your message and will review it soon.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="contactName" className="text-xs font-bold text-muted-foreground uppercase">Your Name</label>
              <input
                id="contactName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-muted/20 border border-border px-4 py-3 rounded-2xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="contactEmail" className="text-xs font-bold text-muted-foreground uppercase">Your Email</label>
              <input
                id="contactEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-muted/20 border border-border px-4 py-3 rounded-2xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label htmlFor="contactMsg" className="text-xs font-bold text-muted-foreground uppercase">Message</label>
              <textarea
                id="contactMsg"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full bg-muted/20 border border-border px-4 py-3 rounded-2xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 bg-primary text-primary-foreground font-extrabold rounded-2xl text-xs flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === "sending" ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6 text-xs text-muted-foreground font-mono text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Mail className="w-4 h-4 text-primary" />
          <span>support@mysofttools.com</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Response inside 24 hours</span>
        </div>
      </div>
    </div>
  );
}
