import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA Copyright Policy - Intellectual Property Guidelines",
  description:
    "Review our DMCA Policy. Learn how to report copyright infringements or submit intellectual property claims to our support team.",
  alternates: {
    canonical: "/dmca",
  },
};

export default function DmcaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 font-sans text-xs leading-relaxed text-muted-foreground">
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">DMCA Copyright Policy</h1>
      <p className="text-xs text-muted-foreground font-mono">Last updated: May 22, 2026</p>

      <p className="text-sm text-foreground">
        MySoftTools respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond expeditiously to claims of copyright infringement.
      </p>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">1. Filing an Infringement Notification</h2>
        <p>
          If you are a copyright owner or authorized agent and believe that content residing on or accessible through our website infringes your copyrights, please submit a written notification containing:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>A physical or electronic signature of the copyright owner or person authorized to act on their behalf.</li>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Identification of the material that is claimed to be infringing, including URL links and exact paths on our site.</li>
          <li>Contact details including your name, physical address, telephone number, and email.</li>
          <li>A statement that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">2. Contact Details</h2>
        <p>
          Please send all DMCA notifications and copyright claims to our designated agent via email:
        </p>
        <p className="p-3 bg-muted/20 border border-border/40 rounded-xl font-mono text-center font-bold text-foreground">
          support@mysofttools.com
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">3. Counter Notification</h2>
        <p>
          If you believe your content was removed by mistake or misidentification, you may file a counter-notification with our agent containing your signature, identification of the removed material, and a statement consenting to the jurisdiction of the federal district court.
        </p>
      </div>
    </div>
  );
}
