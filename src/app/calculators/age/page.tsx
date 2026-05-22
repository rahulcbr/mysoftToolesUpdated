"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/tools/ToolLayout";
import SEOContent from "@/components/tools/SEOContent";
import { recordRecentTool } from "@/utils/recentTools";
import { Calendar, Clock, Gift, ShieldCheck, Hourglass } from "lucide-react";

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState("1995-05-15");
  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [ageYears, setAgeYears] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);
  const [ageDays, setAgeDays] = useState(0);

  const [totalMonths, setTotalMonths] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const [nextBdayDays, setNextBdayDays] = useState(0);
  const [nextBdayMonths, setNextBdayMonths] = useState(0);
  const [nextBdayWeekday, setNextBdayWeekday] = useState("");

  useEffect(() => {
    recordRecentTool("calc-age");
  }, []);

  useEffect(() => {
    const d1 = new Date(dob);
    const d2 = new Date(targetDate);

    // Set time to midnight for consistent comparisons
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) {
      setAgeYears(0);
      setAgeMonths(0);
      setAgeDays(0);
      setTotalMonths(0);
      setTotalWeeks(0);
      setTotalDays(0);
      setTotalHours(0);
      setTotalMinutes(0);
      setTotalSeconds(0);
      setNextBdayDays(0);
      setNextBdayMonths(0);
      setNextBdayWeekday("");
      return;
    }

    // 1. Calculate detailed age (Years, Months, Days)
    let y = d2.getFullYear() - d1.getFullYear();
    let m = d2.getMonth() - d1.getMonth();
    let d = d2.getDate() - d1.getDate();

    if (d < 0) {
      // Find the last day of the previous month relative to d2
      const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
      d += prevMonth.getDate();
      m -= 1;
    }

    if (m < 0) {
      m += 12;
      y -= 1;
    }

    setAgeYears(y);
    setAgeMonths(m);
    setAgeDays(d);

    // 2. Calculate total elapsed units
    const diffMs = d2.getTime() - d1.getTime();
    const totDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totWeeks = Math.floor(totDays / 7);
    const totMonths = y * 12 + m;
    const totHours = totDays * 24;
    const totMinutes = totHours * 60;
    const totSeconds = totMinutes * 60;

    setTotalMonths(totMonths);
    setTotalWeeks(totWeeks);
    setTotalDays(totDays);
    setTotalHours(totHours);
    setTotalMinutes(totMinutes);
    setTotalSeconds(totSeconds);

    // 3. Countdown to Next Birthday
    const bdayThisYear = new Date(d2.getFullYear(), d1.getMonth(), d1.getDate());
    bdayThisYear.setHours(0, 0, 0, 0);

    let nextBday = bdayThisYear;
    if (bdayThisYear < d2) {
      nextBday = new Date(d2.getFullYear() + 1, d1.getMonth(), d1.getDate());
      nextBday.setHours(0, 0, 0, 0);
    }

    const nextDiffMs = nextBday.getTime() - d2.getTime();
    const nextTotDays = Math.ceil(nextDiffMs / (1000 * 60 * 60 * 24));

    // Calculate months and days remaining to next birthday
    let nextM = nextBday.getMonth() - d2.getMonth();
    let nextD = nextBday.getDate() - d2.getDate();

    if (nextD < 0) {
      const prevMonth = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
      nextD += prevMonth.getDate();
      nextM -= 1;
    }
    if (nextM < 0) {
      nextM += 12;
    }

    setNextBdayDays(nextD);
    setNextBdayMonths(nextM);

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    setNextBdayWeekday(weekdays[nextBday.getDay()]);
  }, [dob, targetDate]);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("en-US").format(val);
  };

  const faqs = [
    {
      question: "How does the birthday date calculation handle leap years?",
      answer: "Leap years are handled natively by the JavaScript Date object. A person born on February 29 will celebrate their next birthday on February 28 or March 1 depending on whether the target year is a leap year.",
    },
    {
      question: "Are timezones factored into the age calculation?",
      answer: "No, this calculator processes local dates to ensure calculations reflect the dates exactly as typed by the user, avoiding midnight offsets from greenwich mean time conversion.",
    },
    {
      question: "Why does the weekday of my next birthday change?",
      answer: "Because a year has 365 days (52 weeks and 1 day) or 366 in leap years (52 weeks and 2 days), your birthday shifts forward by 1 or 2 days of the week each year.",
    },
  ];

  return (
    <ToolLayout toolId="calc-age">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 bg-card border border-border rounded-3xl space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Date Parameters</h2>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label htmlFor="dobInput" className="text-xs font-bold text-muted-foreground uppercase block">Date of Birth</label>
                <input
                  id="dobInput"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-muted/20 border border-border p-3 rounded-2xl font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label htmlFor="targetDateInput" className="text-xs font-bold text-muted-foreground uppercase block">Age at Date</label>
                <input
                  id="targetDateInput"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-muted/20 border border-border p-3 rounded-2xl font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Results Summary (Right) */}
          <div className="lg:col-span-7 space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Age Display Card */}
              <div className="p-6 bg-card border border-border rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Computed Age</span>
                  <div className="mt-2 text-2xl font-extrabold text-foreground leading-snug">
                    <span className="text-primary text-4xl font-mono block">{ageYears} Years</span>
                    <span className="text-muted-foreground">{ageMonths} Months, {ageDays} Days</span>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
                  <Hourglass className="w-5 h-5 text-primary shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    Next Birthday in <strong>{nextBdayMonths} months, {nextBdayDays} days</strong>.
                  </div>
                </div>
              </div>

              {/* Next Birthday & Fun Card */}
              <div className="p-6 bg-card border border-border rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Next Birthday Details</span>
                  <div className="mt-4 flex items-center gap-3 bg-muted/20 border border-border/40 p-4 rounded-2xl">
                    <Gift className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Day of the Week</span>
                      <span className="font-extrabold text-foreground text-lg">{nextBdayWeekday || "Pending"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    Total elapsed days since birth: <strong>{formatNumber(totalDays)}</strong> days!
                  </div>
                </div>
              </div>
            </div>

            {/* Total Elapsed Units Table */}
            <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Age Expressed in Total Time Units
              </span>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Total Months</span>
                  <span className="text-sm font-bold text-foreground">{formatNumber(totalMonths)}</span>
                </div>
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Total Weeks</span>
                  <span className="text-sm font-bold text-foreground">{formatNumber(totalWeeks)}</span>
                </div>
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Total Days</span>
                  <span className="text-sm font-bold text-foreground">{formatNumber(totalDays)}</span>
                </div>
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Total Hours</span>
                  <span className="text-sm font-bold text-foreground">{formatNumber(totalHours)}</span>
                </div>
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Total Minutes</span>
                  <span className="text-sm font-bold text-foreground">{formatNumber(totalMinutes)}</span>
                </div>
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">Total Seconds</span>
                  <span className="text-sm font-bold text-foreground">{formatNumber(totalSeconds)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SEOContent
          title="Online Age Calculator - Total Elapsed Lifetime Counter"
          explanation="Determine your exact age in years, months, days, weeks, minutes, and seconds. Easily input birthdates to view lifetime accumulations, weekday mappings, and next birthday countdowns instantly."
          howToUse={[
            "Select your date of birth using the calendar selector.",
            "Choose a target date (defaults to today's date).",
            "Review your exact current age, total elapsed time metrics, and upcoming birthday countdowns."
          ]}
          faqs={faqs}
        />
      </div>
    </ToolLayout>
  );
}
